from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator


def parse_marker(marker: str) -> float:
    """Parse HH:MM:SS or MM:SS marker string into total seconds (float)."""
    parts = marker.strip().split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    raise ValueError(f"Invalid marker format: {marker!r}. Expected MM:SS or HH:MM:SS.")


class ImageSpec(BaseModel):
    url: str
    marker: str = "00:00:00"
    title: Optional[str] = None

    @field_validator("marker")
    @classmethod
    def validate_marker(cls, v: str) -> str:
        parse_marker(v)  # raises if invalid
        return v

    @property
    def marker_seconds(self) -> float:
        return parse_marker(self.marker)


class ConvertOptions(BaseModel):
    format: str = "mp4"
    crf: int = 23
    video_bitrate: Optional[str] = None   # e.g. "2M"
    audio_bitrate: str = "192k"
    resolution: Optional[str] = None      # e.g. "1920x1080"
    normalize_audio: bool = False

    @field_validator("format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        allowed = {"mp4", "mkv", "webm"}
        if v not in allowed:
            raise ValueError(f"format must be one of {allowed}")
        return v

    @field_validator("resolution")
    @classmethod
    def validate_resolution(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.match(r"^\d+x\d+$", v):
            raise ValueError("resolution must be in WxH format, e.g. 1920x1080")
        return v


class ConvertRequest(BaseModel):
    title: str
    description: Optional[str] = None
    audio_url: str
    images: Optional[list[ImageSpec]] = None
    image_url: Optional[str] = None
    options: ConvertOptions = ConvertOptions()

    @model_validator(mode="after")
    def validate_image_source(self) -> "ConvertRequest":
        if self.images is None and self.image_url is None:
            raise ValueError("Either 'images' or 'image_url' must be provided.")
        if self.images is not None and len(self.images) == 0:
            raise ValueError("'images' must contain at least one item.")
        return self

    @property
    def cover_image_url(self) -> str:
        """URL of the cover image (first image from images, or image_url)."""
        if self.image_url:
            return self.image_url
        return self.images[0].url  # type: ignore[index]


class JobResponse(BaseModel):
    job_id: str
    progress_url: str
    status_url: str
    download_url: str


class JobStatus(BaseModel):
    job_id: str
    status: str  # pending | processing | complete | error
    percent: float = 0.0
    time_processed: Optional[str] = None
    error: Optional[str] = None
    download_url: Optional[str] = None
