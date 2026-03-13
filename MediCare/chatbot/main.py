"""
Enhanced FastAPI entrypoint.

This file intentionally does NOT modify `app.py`. Instead, it imports the
existing `app` and then additively mounts new mental-health features.

Run:
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# Ensure we load the correct .env regardless of where uvicorn is started from.
_HERE = Path(__file__).resolve().parent
_ENV_PATH = _HERE / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

# Normalize common key names and guarantee the env var exists for downstream libs.
_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GENAI_API_KEY")
if _key and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = _key

from app import app  # existing FastAPI instance (imports after env is ready)

from routers.emotion_routes import router as emotion_router
from routers.keystroke_routes import router as keystroke_router
from routers.questionary_routes import router as questionary_router
from routers.scoring_routes import router as scoring_router


app.include_router(emotion_router)
app.include_router(questionary_router)
app.include_router(keystroke_router)
app.include_router(scoring_router)

