from __future__ import annotations

import asyncio
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from .config import settings
from .jobs import JobState
from .models import ConvertRequest, ImageSpec, parse_marker


# ---------------------------------------------------------------------------
# ffprobe helpers
# ---------------------------------------------------------------------------

def get_audio_duration(audio_path: Path) -> float:
    """Return audio duration in seconds using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            str(audio_path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


# ---------------------------------------------------------------------------
# ffmetadata (chapters)
# ---------------------------------------------------------------------------

def _seconds_to_ms(seconds: float) -> int:
    return int(seconds * 1000)


def build_ffmetadata(
    title: str,
    description: Optional[str],
    images: list[ImageSpec],
    audio_duration: float,
    tmp_dir: Path,
) -> Path:
    """
    Write an ffmetadata file with global metadata and chapter markers derived
    from the image time markers.  Returns the path to the written file.
    """
    lines: list[str] = [";FFMETADATA1", f"title={title}"]
    if description:
        lines.append(f"comment={description}")
    lines.append("")

    # Sort images by marker time; first chapter always starts at 0
    sorted_images = sorted(images, key=lambda img: img.marker_seconds)

    for idx, img in enumerate(sorted_images):
        start_ms = _seconds_to_ms(img.marker_seconds)
        if idx + 1 < len(sorted_images):
            end_ms = _seconds_to_ms(sorted_images[idx + 1].marker_seconds)
        else:
            end_ms = _seconds_to_ms(audio_duration)

        chapter_title = img.title if img.title else f"Chapter {idx + 1}"
        lines += [
            "[CHAPTER]",
            "TIMEBASE=1/1000",
            f"START={start_ms}",
            f"END={end_ms}",
            f"title={chapter_title}",
            "",
        ]

    meta_path = tmp_dir / "ffmetadata.txt"
    meta_path.write_text("\n".join(lines), encoding="utf-8")
    return meta_path


# ---------------------------------------------------------------------------
# concat demuxer input file
# ---------------------------------------------------------------------------

def build_concat_input(
    image_paths: list[Path],
    durations: list[float],
    tmp_dir: Path,
) -> Path:
    """
    Write an ffmpeg concat demuxer input file.  Each image is listed with its
    display duration.  Returns the path to the written file.
    """
    lines: list[str] = []
    for path, duration in zip(image_paths, durations):
        # Escape single quotes in paths
        escaped = str(path).replace("'", "'\\''")
        lines.append(f"file '{escaped}'")
        lines.append(f"duration {duration:.6f}")

    # Repeat the last frame to avoid a black flash at the end
    if image_paths:
        escaped = str(image_paths[-1]).replace("'", "'\\''")
        lines.append(f"file '{escaped}'")

    concat_path = tmp_dir / "concat_input.txt"
    concat_path.write_text("\n".join(lines), encoding="utf-8")
    return concat_path


# ---------------------------------------------------------------------------
# Scale / pad filter
# ---------------------------------------------------------------------------

def _scale_filter(resolution: Optional[str]) -> str:
    """
    Return a vf filter that scales the image to *resolution* (WxH) with
    letterbox/pillarbox padding so mixed-AR images all produce the same canvas.
    If no resolution is given, use 1920x1080 as the safe default.
    """
    if resolution:
        w, h = resolution.split("x")
    else:
        w, h = "1920", "1080"
    return (
        f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black,"
        f"setsar=1"
    )


# ---------------------------------------------------------------------------
# Progress parser helpers
# ---------------------------------------------------------------------------

def _ms_to_timestamp(ms: int) -> str:
    total_s = ms // 1000
    h = total_s // 3600
    m = (total_s % 3600) // 60
    s = total_s % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


# ---------------------------------------------------------------------------
# Main converter
# ---------------------------------------------------------------------------

async def convert(
    job_id: str,
    request: ConvertRequest,
    audio_path: Path,
    image_paths: list[Path],
    output_path: Path,
    job: JobState,
    download_url: str,
) -> None:
    """
    Run the full conversion pipeline in a thread-pool executor so the async
    event loop is not blocked.  Progress is parsed from ffmpeg's -progress pipe
    and pushed to the job state.
    """
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        _convert_sync,
        job_id,
        request,
        audio_path,
        image_paths,
        output_path,
        job,
        download_url,
    )


def _convert_sync(
    job_id: str,
    request: ConvertRequest,
    audio_path: Path,
    image_paths: list[Path],
    output_path: Path,
    job: JobState,
    download_url: str,
) -> None:
    try:
        job.mark_processing()
        audio_duration = get_audio_duration(audio_path)

        with tempfile.TemporaryDirectory(prefix=f"a2v_{job_id}_") as tmp_str:
            tmp_dir = Path(tmp_str)

            # ----------------------------------------------------------------
            # Build image segment list
            # ----------------------------------------------------------------
            if request.images and len(request.images) > 0:
                sorted_images_spec = sorted(
                    request.images, key=lambda img: img.marker_seconds
                )
                # Ensure first image starts at t=0; override its marker
                durations: list[float] = []
                for idx, img_spec in enumerate(sorted_images_spec):
                    start = img_spec.marker_seconds
                    if idx + 1 < len(sorted_images_spec):
                        end = sorted_images_spec[idx + 1].marker_seconds
                    else:
                        end = audio_duration
                    durations.append(max(end - start, 0.001))

                # image_paths are ordered by URL position in the original; we
                # need them ordered by sorted_images_spec.  image_paths were
                # downloaded in the same order as request.images (pre-sorted
                # by caller).  Re-sort by marker.
                original_order = list(request.images)
                sorted_paths = [
                    image_paths[original_order.index(img_spec)]
                    for img_spec in sorted_images_spec
                ]
            else:
                # Single cover image for the whole duration
                sorted_images_spec = []
                sorted_paths = image_paths
                durations = [audio_duration]

            concat_path = build_concat_input(sorted_paths, durations, tmp_dir)

            # ----------------------------------------------------------------
            # ffmetadata (title, description, chapters)
            # ----------------------------------------------------------------
            effective_images_for_chapters: list[ImageSpec]
            if request.images and len(request.images) > 0:
                # Inject a chapter-0 at t=0 using first image's title if its
                # marker is not already at 0
                first_spec = sorted(request.images, key=lambda i: i.marker_seconds)[0]
                if first_spec.marker_seconds > 0:
                    from .models import ImageSpec as IS
                    zero_spec = IS(url=first_spec.url, marker="00:00:00", title=first_spec.title)
                    effective_images_for_chapters = [zero_spec] + [
                        i for i in request.images if i.marker_seconds > 0
                    ]
                else:
                    effective_images_for_chapters = list(request.images)
            else:
                # No timed images — single chapter for the whole video
                from .models import ImageSpec as IS
                effective_images_for_chapters = [
                    IS(url="", marker="00:00:00", title=request.title)
                ]

            meta_path = build_ffmetadata(
                title=request.title,
                description=request.description,
                images=effective_images_for_chapters,
                audio_duration=audio_duration,
                tmp_dir=tmp_dir,
            )

            # ----------------------------------------------------------------
            # Build ffmpeg command
            # ----------------------------------------------------------------
            opts = request.options
            scale_vf = _scale_filter(opts.resolution)

            # Audio filters
            audio_filters: list[str] = []
            if opts.normalize_audio:
                audio_filters.append("loudnorm")

            cmd: list[str] = [
                "ffmpeg", "-y",
                # Video input via concat demuxer
                "-f", "concat", "-safe", "0", "-i", str(concat_path),
                # Audio input
                "-i", str(audio_path),
                # ffmetadata input
                "-i", str(meta_path),
                # Map video from concat, audio from audio file
                "-map", "0:v", "-map", "1:a",
                # Embed metadata from ffmetadata file
                "-map_metadata", "2",
                "-c:v", "libx264",
                "-tune", "stillimage",
                "-pix_fmt", "yuv420p",
                "-vf", scale_vf,
                "-c:a", "aac",
                "-b:a", opts.audio_bitrate,
                "-shortest",
                # Progress reporting to stdout
                "-progress", "pipe:1",
                "-nostats",
            ]

            if opts.video_bitrate:
                cmd += ["-b:v", opts.video_bitrate]
            else:
                cmd += ["-crf", str(opts.crf)]

            if audio_filters:
                cmd += ["-af", ",".join(audio_filters)]

            # Output format
            if opts.format == "mkv":
                cmd += ["-f", "matroska"]
            elif opts.format == "webm":
                cmd += ["-c:v", "libvpx-vp9", "-c:a", "libopus", "-f", "webm"]

            cmd.append(str(output_path))

            # ----------------------------------------------------------------
            # Run ffmpeg and stream progress
            # ----------------------------------------------------------------
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
            )

            out_time_ms = 0
            for line in process.stdout:  # type: ignore[union-attr]
                line = line.strip()
                if line.startswith("out_time_ms="):
                    try:
                        out_time_ms = int(line.split("=", 1)[1])
                    except ValueError:
                        pass
                    if audio_duration > 0 and out_time_ms > 0:
                        percent = min(out_time_ms / (audio_duration * 1_000_000) * 100, 99.9)
                        time_str = _ms_to_timestamp(out_time_ms // 1000)
                        job.update_progress(percent, time_str)
                elif line == "progress=end":
                    break

            process.wait()

            if process.returncode != 0:
                stderr_output = process.stderr.read() if process.stderr else ""
                raise RuntimeError(f"ffmpeg failed (code {process.returncode}): {stderr_output[-2000:]}")

        job.mark_complete(str(output_path), download_url)

    except Exception as exc:
        job.mark_error(str(exc))
        raise
