from __future__ import annotations

from typing import Any, Dict, Optional, Tuple


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _norm01(x: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.0
    return _clamp((x - lo) / (hi - lo), 0.0, 1.0)


def _risk_bucket(score_0_100: float) -> str:
    if score_0_100 >= 80:
        return "low"
    if score_0_100 >= 60:
        return "mild"
    if score_0_100 >= 40:
        return "moderate"
    if score_0_100 >= 20:
        return "high"
    return "critical"


def compute_mental_health_score(
    *,
    sentiment: Optional[Dict[str, Any]] = None,
    nlp: Optional[Dict[str, Any]] = None,
    emotion_segmentation: Optional[Dict[str, Any]] = None,
    questionnaire: Optional[Dict[str, Any]] = None,
    keystroke: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Unified scoring system.

    Uses the **existing model outputs** (sentiment + NLP) as the base signal,
    then blends in questionnaire / emotion segmentation / keystroke features.

    Output is a 0..100 "wellbeing score" where higher is better.
    """
    # Base: sentiment compound (-1..1) -> (0..1)
    compound = float((sentiment or {}).get("compound", 0.0))
    base = (compound + 1.0) / 2.0

    # NLP modifiers
    negation_count = float((nlp or {}).get("negation_count", 0.0))
    pronoun_ratio = float((nlp or {}).get("pronoun_ratio", 0.0))
    emotional_intensity = float((nlp or {}).get("emotional_intensity", 0.0))

    # Emotion segmentation modifier: more sadness/anxiety/anger lowers.
    seg_counts = ((emotion_segmentation or {}).get("summary") or {}).get("counts") or {}
    neg_emotion = float(seg_counts.get("sadness", 0) + seg_counts.get("anxiety", 0) + seg_counts.get("anger", 0))
    seg_total = float(((emotion_segmentation or {}).get("summary") or {}).get("segment_count", 0) or 0)
    neg_emotion_ratio = (neg_emotion / seg_total) if seg_total else 0.0

    # Questionnaire modifier: PHQ-9 / GAD-7 mapped to risk.
    qid = (questionnaire or {}).get("questionnaire_id")
    q_score = float((questionnaire or {}).get("raw_score", 0.0))
    self_harm_flag = bool(((questionnaire or {}).get("flags") or {}).get("self_harm_risk", False))
    if qid == "phq9":
        q_risk = _norm01(q_score, 0, 27)
    elif qid == "gad7":
        q_risk = _norm01(q_score, 0, 21)
    else:
        q_risk = 0.0

    # Keystroke modifier: high pauses + backspace rate can correlate with distress.
    kf = (keystroke or {}).get("features") or {}
    pause_count = float(kf.get("pause_count", 0.0))
    duration_ms = float(kf.get("duration_ms", 0.0))
    backspace_rate = float(kf.get("backspace_rate", 0.0))
    pauses_per_min = (pause_count / (duration_ms / 60000.0)) if duration_ms >= 1000 else 0.0
    ks_risk = 0.0
    ks_risk += _norm01(pauses_per_min, 0.0, 20.0) * 0.6
    ks_risk += _norm01(backspace_rate, 0.0, 0.25) * 0.4

    # Aggregate (weights sum to 1)
    # Higher "risk" lowers wellbeing score.
    risk = 0.0
    risk += (1.0 - base) * 0.45
    risk += _norm01(negation_count, 0.0, 15.0) * 0.05
    risk += _norm01(pronoun_ratio, 0.0, 0.25) * 0.05
    risk += _norm01(emotional_intensity, 0.0, 1.0) * 0.05
    risk += _clamp(neg_emotion_ratio, 0.0, 1.0) * 0.15
    risk += _clamp(q_risk, 0.0, 1.0) * 0.2
    risk += _clamp(ks_risk, 0.0, 1.0) * 0.05

    if self_harm_flag:
        risk = max(risk, 0.9)

    wellbeing = (1.0 - _clamp(risk, 0.0, 1.0)) * 100.0
    return {
        "wellbeing_score": round(wellbeing, 1),
        "risk_bucket": _risk_bucket(wellbeing),
        "signals": {
            "sentiment_compound": compound,
            "neg_emotion_ratio": round(neg_emotion_ratio, 3),
            "questionnaire_risk": round(q_risk, 3),
            "keystroke_risk": round(ks_risk, 3),
            "self_harm_risk": self_harm_flag,
        },
    }

