from __future__ import annotations

from typing import Dict, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai_services.questionary import QuestionnaireId, get_questionnaire, score_responses


router = APIRouter(prefix="/mental", tags=["mental-health"])


@router.get("/questionnaires/{qid}")
def get_questionnaires(qid: QuestionnaireId):
    return get_questionnaire(qid)


class QuestionnaireSubmitRequest(BaseModel):
    questionnaire_id: QuestionnaireId
    responses: Dict[str, int]  # question_id -> 0..3


@router.post("/questionnaires/score")
def score_questionnaire(req: QuestionnaireSubmitRequest):
    try:
        result = score_responses(req.questionnaire_id, req.responses)
        return {
            "questionnaire_id": result.questionnaire_id,
            "raw_score": result.raw_score,
            "severity": result.severity,
            "flags": result.flags,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown questionnaire")

