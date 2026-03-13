from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ai_services.scoring import compute_mental_health_score


router = APIRouter(prefix="/mental", tags=["mental-health"])


class ScoreRequest(BaseModel):
    sentiment: Optional[Dict[str, Any]] = None
    nlp: Optional[Dict[str, Any]] = None
    emotion_segmentation: Optional[Dict[str, Any]] = None
    questionnaire: Optional[Dict[str, Any]] = None
    keystroke: Optional[Dict[str, Any]] = None


@router.post("/score")
def score(req: ScoreRequest):
    return compute_mental_health_score(
        sentiment=req.sentiment,
        nlp=req.nlp,
        emotion_segmentation=req.emotion_segmentation,
        questionnaire=req.questionnaire,
        keystroke=req.keystroke,
    )

