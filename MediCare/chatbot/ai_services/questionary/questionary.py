from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Literal, TypedDict


QuestionnaireId = Literal["phq9", "gad7"]


class Question(TypedDict):
    id: str
    text: str


class Questionnaire(TypedDict):
    id: QuestionnaireId
    title: str
    instructions: str
    questions: List[Question]
    scale: Dict[str, int]


PHQ9: Questionnaire = {
    "id": "phq9",
    "title": "PHQ-9 (Depression)",
    "instructions": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    "questions": [
        {"id": "phq9_q1", "text": "Little interest or pleasure in doing things"},
        {"id": "phq9_q2", "text": "Feeling down, depressed, or hopeless"},
        {"id": "phq9_q3", "text": "Trouble falling or staying asleep, or sleeping too much"},
        {"id": "phq9_q4", "text": "Feeling tired or having little energy"},
        {"id": "phq9_q5", "text": "Poor appetite or overeating"},
        {"id": "phq9_q6", "text": "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"},
        {"id": "phq9_q7", "text": "Trouble concentrating on things, such as reading the newspaper or watching television"},
        {"id": "phq9_q8", "text": "Moving or speaking so slowly that other people could have noticed? Or the opposite — being fidgety or restless"},
        {"id": "phq9_q9", "text": "Thoughts that you would be better off dead or of hurting yourself in some way"},
    ],
    "scale": {"not_at_all": 0, "several_days": 1, "more_than_half": 2, "nearly_every_day": 3},
}

GAD7: Questionnaire = {
    "id": "gad7",
    "title": "GAD-7 (Anxiety)",
    "instructions": "Over the last 2 weeks, how often have you been bothered by the following problems?",
    "questions": [
        {"id": "gad7_q1", "text": "Feeling nervous, anxious or on edge"},
        {"id": "gad7_q2", "text": "Not being able to stop or control worrying"},
        {"id": "gad7_q3", "text": "Worrying too much about different things"},
        {"id": "gad7_q4", "text": "Trouble relaxing"},
        {"id": "gad7_q5", "text": "Being so restless that it is hard to sit still"},
        {"id": "gad7_q6", "text": "Becoming easily annoyed or irritable"},
        {"id": "gad7_q7", "text": "Feeling afraid, as if something awful might happen"},
    ],
    "scale": {"not_at_all": 0, "several_days": 1, "more_than_half": 2, "nearly_every_day": 3},
}


_REGISTRY: Dict[QuestionnaireId, Questionnaire] = {"phq9": PHQ9, "gad7": GAD7}


def get_questionnaire(qid: QuestionnaireId) -> Questionnaire:
    return _REGISTRY[qid]


@dataclass(frozen=True)
class ScoreResult:
    questionnaire_id: QuestionnaireId
    raw_score: int
    severity: str
    flags: Dict[str, bool]


def _severity_phq9(score: int) -> str:
    if score <= 4:
        return "minimal"
    if score <= 9:
        return "mild"
    if score <= 14:
        return "moderate"
    if score <= 19:
        return "moderately_severe"
    return "severe"


def _severity_gad7(score: int) -> str:
    if score <= 4:
        return "minimal"
    if score <= 9:
        return "mild"
    if score <= 14:
        return "moderate"
    return "severe"


def score_responses(qid: QuestionnaireId, responses: Dict[str, int]) -> ScoreResult:
    """
    `responses` is a map of question_id -> 0..3
    """
    q = get_questionnaire(qid)
    valid_ids = {qq["id"] for qq in q["questions"]}
    total = 0
    for k, v in responses.items():
        if k in valid_ids:
            total += int(v)

    if qid == "phq9":
        severity = _severity_phq9(total)
        flags = {"self_harm_risk": int(responses.get("phq9_q9", 0)) >= 1}
    else:
        severity = _severity_gad7(total)
        flags = {}

    return ScoreResult(questionnaire_id=qid, raw_score=total, severity=severity, flags=flags)

