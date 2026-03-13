import re
from typing import Any, Dict, List, Literal

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


EmotionLabel = Literal[
    "anger",
    "sadness",
    "anxiety",
    "joy",
    "neutral",
]


_analyzer = SentimentIntensityAnalyzer()


_KEYWORDS: Dict[EmotionLabel, List[str]] = {
    "anger": ["angry", "furious", "mad", "rage", "frustrated", "annoyed", "irritated"],
    "sadness": ["sad", "depressed", "hopeless", "lonely", "crying", "miserable", "grief"],
    "anxiety": ["anxious", "worried", "scared", "panic", "nervous", "fear", "stress", "terrified"],
    "joy": ["happy", "relieved", "grateful", "excited", "hopeful", "calm"],
    "neutral": [],
}


def _split_utterances(text: str) -> List[str]:
    # Sentence-ish splitting without extra deps.
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [c.strip() for c in chunks if c and c.strip()]


def _label_for_utterance(text: str) -> EmotionLabel:
    t = text.lower()
    for label, kws in _KEYWORDS.items():
        if kws and any(k in t for k in kws):
            return label

    scores = _analyzer.polarity_scores(text)
    compound = scores.get("compound", 0.0)
    if compound <= -0.55:
        return "sadness"
    if compound <= -0.15:
        return "anxiety"
    if compound >= 0.45:
        return "joy"
    return "neutral"


def segment_emotions(text: str) -> Dict[str, Any]:
    """
    Emotion segmentation for mental-health signals.

    Returns an utterance-level emotion timeline plus aggregates.
    """
    if not text or not text.strip():
        return {"segments": [], "summary": {"dominant_emotion": "neutral", "counts": {}}}

    segments: List[Dict[str, Any]] = []
    counts: Dict[str, int] = {}

    for idx, utt in enumerate(_split_utterances(text), start=1):
        label = _label_for_utterance(utt)
        scores = _analyzer.polarity_scores(utt)
        segments.append(
            {
                "i": idx,
                "text": utt,
                "emotion": label,
                "sentiment": {
                    "compound": scores["compound"],
                    "pos": scores["pos"],
                    "neg": scores["neg"],
                    "neu": scores["neu"],
                },
            }
        )
        counts[label] = counts.get(label, 0) + 1

    dominant = max(counts.items(), key=lambda kv: kv[1])[0] if counts else "neutral"
    return {
        "segments": segments,
        "summary": {
            "dominant_emotion": dominant,
            "counts": counts,
            "segment_count": len(segments),
        },
    }

