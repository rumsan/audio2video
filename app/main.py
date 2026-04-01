from __future__ import annotations

import asyncio
import json
import uuid
from pathlib import Path
from typing import AsyncGenerator, Optional

import hashlib
import shutil

from fastapi import BackgroundTasks, Depends, FastAPI, File, Header, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse
from slugify import slugify

from .config import settings
from .converter import convert
from .downloader import download
from .jobs import JobState, registry
from .models import ConvertRequest, JobResponse, JobStatus

app = FastAPI(title="audio2video HTTP API", version="1.0.0")

# Allow the Vite dev server and same-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve cached files at /cache/<filename> so the browser can preview uploaded audio/images
app.mount("/cache", StaticFiles(directory=str(settings.cache_dir)), name="cache")
# Serve built frontend assets (js/css bundles)
_frontend_assets = Path("frontend-dist/assets")
if _frontend_assets.exists():
    app.mount("/assets", StaticFiles(directory=str(_frontend_assets)), name="frontend-assets")

# ---------------------------------------------------------------------------
# Auth dependency — accepts X-API-Key header OR ?key= query param
# (query param needed for EventSource and <video src> which can't set headers)
# ---------------------------------------------------------------------------

async def verify_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    key: Optional[str] = Query(None),
) -> None:
    provided = x_api_key or key
    if not provided or provided != settings.api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# File upload
# ---------------------------------------------------------------------------

@app.post(
    "/files/upload",
    dependencies=[Depends(verify_api_key)],
)
async def upload_file(file: UploadFile = File(...)) -> dict:
    """
    Upload a local audio or image file to the server cache.
    Returns a ``file_url`` (``file:///...``) that can be used directly
    in the ``audio_url``, ``image_url``, or ``images[].url`` fields of
    ``POST /convert``.
    """
    # Compute SHA-256 of file content for a stable cache key
    hasher = hashlib.sha256()
    suffix = Path(file.filename or "upload").suffix[:10]
    tmp_path = settings.cache_dir / f"upload_{uuid.uuid4().hex}{suffix}.tmp"
    dest: Path | None = None
    try:
        with tmp_path.open("wb") as fh:
            while chunk := await file.read(65536):
                hasher.update(chunk)
                fh.write(chunk)
        dest = settings.cache_dir / f"{hasher.hexdigest()}{suffix}"
        if not dest.exists():
            tmp_path.rename(dest)
        else:
            tmp_path.unlink(missing_ok=True)
    except Exception:
        tmp_path.unlink(missing_ok=True)
        raise

    cache_filename = dest.name
    return {
        "file_url": dest.resolve().as_uri(),
        "preview_url": f"/cache/{cache_filename}",
        "filename": file.filename,
    }


@app.post(
    "/convert",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_api_key)],
)
async def start_conversion(
    request: ConvertRequest,
    background_tasks: BackgroundTasks,
) -> JobResponse:
    job_id = str(uuid.uuid4())

    # Determine output filename (slug of title, unique if collision)
    slug = slugify(request.title) or job_id
    ext = f".{request.options.format}"
    output_path = settings.output_dir / f"{slug}{ext}"
    if output_path.exists():
        output_path = settings.output_dir / f"{slug}-{job_id[:8]}{ext}"

    job = await registry.create(job_id)

    base = settings.base_url.rstrip("/")
    progress_url = f"{base}/jobs/{job_id}/progress"
    status_url = f"{base}/jobs/{job_id}/status"
    download_url = f"{base}/jobs/{job_id}/download"

    background_tasks.add_task(
        _run_conversion,
        job_id=job_id,
        request=request,
        output_path=output_path,
        download_url=download_url,
    )

    return JobResponse(
        job_id=job_id,
        progress_url=progress_url,
        status_url=status_url,
        download_url=download_url,
    )


async def _run_conversion(
    job_id: str,
    request: ConvertRequest,
    output_path: Path,
    download_url: str,
) -> None:
    job = await registry.get(job_id)
    if job is None:
        return

    try:
        # Download audio
        audio_path = await download(request.audio_url)

        # Download images (in parallel)
        if request.images:
            image_paths = list(
                await asyncio.gather(*[download(img.url) for img in request.images])
            )
        else:
            image_paths = [await download(request.image_url)]  # type: ignore[arg-type]

        await convert(
            job_id=job_id,
            request=request,
            audio_path=audio_path,
            image_paths=image_paths,
            output_path=output_path,
            job=job,
            download_url=download_url,
        )
    except Exception as exc:
        job.mark_error(str(exc))


# ---------------------------------------------------------------------------
# SSE progress stream
# ---------------------------------------------------------------------------

@app.get(
    "/jobs/{job_id}/progress",
    dependencies=[Depends(verify_api_key)],
)
async def job_progress(job_id: str) -> EventSourceResponse:
    job = await registry.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    return EventSourceResponse(_progress_generator(job))


async def _progress_generator(job: JobState) -> AsyncGenerator[dict, None]:
    # If already done, emit a single final event and close
    if job.status == "complete":
        yield {"data": json.dumps({"type": "complete", "download_url": job.output_path})}
        return
    if job.status == "error":
        yield {"data": json.dumps({"type": "error", "message": job.error})}
        return

    q = job.subscribe()
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=30)
            except asyncio.TimeoutError:
                # Keep-alive ping
                yield {"data": json.dumps({"type": "ping"})}
                continue

            yield {"data": json.dumps(event)}

            if event.get("type") in ("complete", "error"):
                break
    finally:
        job.unsubscribe(q)


# ---------------------------------------------------------------------------
# Status (non-streaming)
# ---------------------------------------------------------------------------

@app.get(
    "/jobs/{job_id}/status",
    response_model=JobStatus,
    dependencies=[Depends(verify_api_key)],
)
async def job_status(job_id: str) -> JobStatus:
    job = await registry.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    base = settings.base_url.rstrip("/")
    download_url = f"{base}/jobs/{job_id}/download" if job.status == "complete" else None

    return JobStatus(
        job_id=job_id,
        status=job.status,
        percent=job.percent,
        time_processed=job.time_processed,
        error=job.error,
        download_url=download_url,
    )


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------

@app.get(
    "/jobs/{job_id}/download",
    dependencies=[Depends(verify_api_key)],
)
async def job_download(job_id: str) -> FileResponse:
    job = await registry.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.status != "complete":
        raise HTTPException(status_code=409, detail=f"Job is not complete yet (status: {job.status}).")
    if not job.output_path or not Path(job.output_path).exists():
        raise HTTPException(status_code=410, detail="Output file no longer available.")

    output_path = Path(job.output_path)
    media_types = {
        ".mp4": "video/mp4",
        ".mkv": "video/x-matroska",
        ".webm": "video/webm",
    }
    media_type = media_types.get(output_path.suffix, "application/octet-stream")

    return FileResponse(
        path=str(output_path),
        media_type=media_type,
        filename=output_path.name,
        headers={"Content-Disposition": f'attachment; filename="{output_path.name}"'},
    )


# ---------------------------------------------------------------------------
# SPA catch-all — serve React frontend for any unmatched route
# Must be defined LAST so API routes take precedence.
# ---------------------------------------------------------------------------

_frontend_dist = Path("frontend-dist")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str) -> HTMLResponse:
    index = _frontend_dist / "index.html"
    if index.exists():
        return HTMLResponse(index.read_text())
    return HTMLResponse("<p>Frontend not built. Run <code>cd frontend && npm run build</code>.</p>", status_code=503)
