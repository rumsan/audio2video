from __future__ import annotations

import hashlib
from pathlib import Path
from urllib.parse import urlparse

import httpx

from .config import settings


def _cache_path(url: str, cache_dir: Path) -> Path:
    """Derive a stable local path from a URL using SHA-256 of the URL."""
    digest = hashlib.sha256(url.encode()).hexdigest()
    # Preserve the original file extension if detectable from the URL path
    suffix = Path(url.split("?")[0]).suffix[:10]  # strip query params, cap length
    return cache_dir / f"{digest}{suffix}"


async def download(url: str, cache_dir: Path | None = None) -> Path:
    """
    Resolve *url* to a local file path, downloading and caching if necessary.

    Supported schemes:
    - http:// / https://  — downloaded to cache dir (skipped if already cached)
    - file:///path        — returned directly as a local Path (no caching)
    """
    if cache_dir is None:
        cache_dir = settings.cache_dir

    # Handle local file:// URLs — return the path directly without caching
    parsed = urlparse(url)
    if parsed.scheme == "file":
        local_path = Path(parsed.path)
        if not local_path.exists():
            raise FileNotFoundError(f"Local file not found: {local_path}")
        return local_path

    dest = _cache_path(url, cache_dir)
    if dest.exists():
        return dest

    tmp = dest.with_suffix(dest.suffix + ".tmp")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=300) as client:
            async with client.stream("GET", url) as response:
                response.raise_for_status()
                with tmp.open("wb") as fh:
                    async for chunk in response.aiter_bytes(chunk_size=65536):
                        fh.write(chunk)
        tmp.rename(dest)
    except Exception:
        tmp.unlink(missing_ok=True)
        raise

    return dest
