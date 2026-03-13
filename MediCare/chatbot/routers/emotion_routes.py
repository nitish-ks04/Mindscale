from fastapi import APIRouter
from pydantic import BaseModel

from ai_services.emotion import segment_emotions


router = APIRouter(prefix="/mental", tags=["mental-health"])


class EmotionSegmentRequest(BaseModel):
    text: str


@router.post("/emotion-segmentation")
def emotion_segmentation(req: EmotionSegmentRequest):
    return segment_emotions(req.text)

