# Mediscale — Medical Assistant

Comprehensive medical-assistant based upon NLP is a web application combining React frontend, Node/Express backend, MongoDB persistence, and a Python FastAPI-based medical chatbot (powered by LangChain + Google Gemini). The chatbot provides medical Q&A, sentiment-aware responses, and conversational memory for improved context.

This README explains the architecture, setup, environment variables, run steps (PowerShell-friendly), testing, and security considerations.

## Key Features
- Web frontend (React + Vite) with authentication and a chatbot UI
- Backend API (Node.js + Express) handling auth, chat routing, and persistence
- Medical chatbot (FastAPI) using LangChain + Google Gemini and VADER sentiment analysis
- Conversation memory (in-memory per-user) and sentiment history endpoints

## Repository structure (top-level)

- `my-app/` — React frontend (Vite)
- `backend/` — Node/Express API, Mongoose models
- `chatbot/` — FastAPI medical chatbot, Python dependencies
- `PROJECT_ARCHITECTURE.md` — Architecture overview

## Prerequisites
- Node.js (recommended >= 18) and npm
- Python 3.11+ (the project indicates 3.13+, but 3.11+ should work with the listed packages)
- pip
- MongoDB (local or Atlas)
- A valid Google API key with access to the Google Generative AI (Gemini) APIs

## Environment variables

Create environment files in each service (do NOT commit them).

`backend/.env` (example)
```
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
```

`chatbot/.env` (example)
```
GOOGLE_API_KEY=<your_google_api_key>
```

Notes:
- Rotate any API keys that were previously committed. Do not commit `.env` files.
- Add `.env` to `.gitignore`.

## Quick Start (PowerShell)

Open three separate PowerShell terminals (one per service).

1) Backend (Express)

```powershell
cd "\backend"
npm install
# create backend/.env with MONGO_URI and JWT_SECRET before starting
npm run dev   # uses nodemon, or 'npm start' to run with node
```

2) Chatbot (FastAPI)

```powershell
cd "\chatbot"

# create and activate a venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# upgrade pip (optional)
python -m pip install --upgrade pip

# install requirements
pip install -r .\req.txt

# ensure chatbot/.env contains GOOGLE_API_KEY
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

3) Frontend (React + Vite)

```powershell
cd "\my-app"
npm install
npm run dev
# visit http://localhost:5173
```


