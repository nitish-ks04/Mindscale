from __future__ import annotations

from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from ai_services.keystroke import analyze_keystrokes


router = APIRouter(prefix="/mental", tags=["mental-health"])


class KeystrokeEvent(BaseModel):
    t_ms: int
    key: str | None = None
    type: str


class KeystrokeRequest(BaseModel):
    events: List[KeystrokeEvent]
    pause_ms_threshold: int = 800


@router.post("/keystroke-analysis")
def keystroke_analysis(req: KeystrokeRequest):
    return analyze_keystrokes(
        [e.model_dump() for e in req.events],
        pause_ms_threshold=req.pause_ms_threshold,
    )

