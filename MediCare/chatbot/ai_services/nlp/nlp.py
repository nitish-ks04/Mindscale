import re
import os
import nltk
from textblob import TextBlob


# ------------------------------------------------
# Ensure NLTK data exists
# ------------------------------------------------

nltk_data_path = os.path.join(os.path.expanduser("~"), "nltk_data")

if not os.path.exists(nltk_data_path):
    os.makedirs(nltk_data_path, exist_ok=True)

if nltk_data_path not in nltk.data.path:
    nltk.data.path.append(nltk_data_path)


def ensure_nltk_data():
    """
    Download required NLTK packages if missing
    """

    packages = [
        ("tokenizers/punkt", "punkt"),
        ("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger")
    ]

    for path, package in packages:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(package, quiet=True)


# Run once on import
ensure_nltk_data()


# ------------------------------------------------
# Main NLP Analysis Function
# ------------------------------------------------

def analyze_text(text: str) -> dict:
    """
    Analyze text and return NLP metrics.
    Used by FastAPI endpoints for React integration.
    """

    if not text or not text.strip():
        return {
            "sentiment_score": 0.0,
            "sentiment_label": "neutral",
            "word_count": 0,
            "sentence_count": 0,
            "pronoun_ratio": 0.0,
            "negation_count": 0,
            "emotional_intensity": 0.0
        }

    blob = TextBlob(text)

    sentiment = blob.sentiment.polarity

    if sentiment > 0.1:
        label = "positive"
    elif sentiment < -0.1:
        label = "negative"
    else:
        label = "neutral"

    words = text.split()
    word_count = len(words)

    sentence_count = len(blob.sentences)

    pronouns = re.findall(
        r"\b(i|me|my|mine|myself)\b",
        text.lower()
    )

    pronoun_ratio = len(pronouns) / word_count if word_count > 0 else 0

    negations = re.findall(
        r"\b(not|no|never|none|neither|nor|cannot|can't|don't|doesn't|didn't|won't|shan't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|couldn't|shouldn't|wouldn't|mightn't|mustn't)\b",
        text.lower()
    )

    negation_count = len(negations)

    emotional_intensity = blob.sentiment.subjectivity

    return {
        "sentiment_score": round(sentiment, 2),
        "sentiment_label": label,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "pronoun_ratio": round(pronoun_ratio, 2),
        "negation_count": negation_count,
        "emotional_intensity": round(emotional_intensity, 2)
    }