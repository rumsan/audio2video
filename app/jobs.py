from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class JobState:
    job_id: str
    status: str = "pending"        # pending | processing | complete | error
    percent: float = 0.0
    time_processed: Optional[str] = None
    output_path: Optional[str] = None
    error: Optional[str] = None
    # Subscribers waiting for progress updates
    _waiters: list[asyncio.Queue] = field(default_factory=list, repr=False)

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._waiters.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        try:
            self._waiters.remove(q)
        except ValueError:
            pass

    def _broadcast(self, event: dict) -> None:
        for q in list(self._waiters):
            q.put_nowait(event)

    def update_progress(self, percent: float, time_processed: str) -> None:
        self.percent = percent
        self.time_processed = time_processed
        self._broadcast(
            {"type": "progress", "percent": round(percent, 2), "time_processed": time_processed}
        )

    def mark_complete(self, output_path: str, download_url: str) -> None:
        self.status = "complete"
        self.percent = 100.0
        self.output_path = output_path
        self._broadcast({"type": "complete", "download_url": download_url})

    def mark_error(self, message: str) -> None:
        self.status = "error"
        self.error = message
        self._broadcast({"type": "error", "message": message})

    def mark_processing(self) -> None:
        self.status = "processing"
        self._broadcast({"type": "progress", "percent": 0.0, "time_processed": "00:00:00"})


class JobRegistry:
    def __init__(self) -> None:
        self._jobs: dict[str, JobState] = {}
        self._lock = asyncio.Lock()

    async def create(self, job_id: str) -> JobState:
        async with self._lock:
            state = JobState(job_id=job_id)
            self._jobs[job_id] = state
            return state

    async def get(self, job_id: str) -> Optional[JobState]:
        async with self._lock:
            return self._jobs.get(job_id)

    async def delete(self, job_id: str) -> None:
        async with self._lock:
            self._jobs.pop(job_id, None)


# Singleton registry shared across the app
registry = JobRegistry()
