# Project Architecture - AI Lesson Plan Compliance Checker

This document outlines the complete architecture of the project, including frontend, backend API, and chatbot service interactions.

## System Components

```mermaid
graph TB
    %% Frontend (React)
    subgraph Frontend[Frontend - React/Vite]
        direction TB
        ReactApp[App.jsx]
        Pages[Pages]
        Components[Components]
        Services[Services]
        
        ReactApp --> Pages
        ReactApp --> Components
        Pages --> Services
        Components --> Services
    end

    %% Backend (Node.js)
    subgraph Backend[Backend - Node.js/Express]
        direction TB
        Server[server.js]
        AuthRoutes[authRoutes.js]
        ChatRoutes[chatRoutes.js]
        AuthController[authController.js]
        ChatController[chatController.js]
        DB[(MongoDB)]
        
        Server --> AuthRoutes & ChatRoutes
        AuthRoutes --> AuthController
        ChatRoutes --> ChatController
        AuthController --> DB
    end

    %% Chatbot (Python)
    subgraph Chatbot[Chatbot - Python/Flask]
        direction TB
        FlaskApp[app.py]
        Model[AI Model]
        
        FlaskApp --> Model
    end

    %% Connections between services
    Frontend --"Auth API\n:5000/api/auth/*"--> Backend
    Frontend --"Chat API\n:5000/api/chat"--> Backend
    Backend --"AI Service\n:8000/chat"--> Chatbot

    %% Style definitions
    classDef frontend fill:#42b883,stroke:#35495e,color:white
    classDef backend fill:#68a063,stroke:#3c873a,color:white
    classDef chatbot fill:#4b8bbe,stroke:#306998,color:white
    
    class Frontend frontend
    class Backend backend
    class Chatbot chatbot
```

## File Structure & Flow

### Frontend (`my-app/`)
```
my-app/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Landing page with features
│   │   ├── Login.jsx         # Login form
│   │   ├── Signup.jsx        # Signup form
│   │   ├── Home.jsx          # Dashboard after login
│   │   ├── Profile.jsx       # User profile management
│   │   └── chatbot.jsx       # Chatbot interface
│   │
│   ├── components/
│   │   ├── navbar.jsx        # Top navigation
│   │   ├── Sidebar.jsx       # Side navigation
│   │   ├── home/            
│   │   │   ├── activity.jsx  # Activity tracking
│   │   │   └── review.jsx    # Review component
│   │   ├── landing/
│   │   │   ├── feature.jsx   # Feature showcase
│   │   │   └── hero.jsx      # Hero section
│   │   └── profile/
│   │       ├── accountsetting.jsx
│   │       ├── profilecard.jsx
│   │       ├── recentactivity.jsx
│   │       └── savedplans.jsx
│   │
│   ├── services/
│   │   └── api.js            # Axios API client
│   │
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
```

### Backend (`backend/`)
```
backend/
├── server.js                # Express server setup
├── routes/
│   ├── authroutes.js       # Auth endpoints
│   └── chatRoutes.js       # Chat endpoints
├── controller/
│   ├── authController.js   # Auth logic
│   └── chatController.js   # Chat forwarding
├── models/
│   └── user.js            # User schema
├── middleware/
│   └── authMiddleware.js  # JWT validation
└── config/
    └── db.js             # MongoDB connection
```

### Chatbot (`chatbot/`)
```
chatbot/
├── app.py                # FastAPI server (medical assistant)
├── req.txt               # Python dependencies
├── MEDICAL_CHATBOT_README.md
└── __pycache__/          # Python cache
```

## API Flow & Endpoints

### Authentication Flow
1. User fills Login/Signup form
2. Frontend calls `/api/auth/login` or `/api/auth/signup`
3. Backend validates and creates/authenticates user
4. JWT token returned and stored in localStorage
5. User redirected to dashboard

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB
    
    User->>Frontend: Fill login form
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Validate credentials
    DB-->>Backend: User data
    Backend-->>Frontend: JWT token
    Frontend->>Frontend: Store token
    Frontend->>User: Redirect to dashboard
```

### Chat Flow
1. User sends message in chat interface
2. Frontend sends to backend `/api/chat` (or directly to the chatbot API if configured)
3. Backend forwards to the Chatbot service (FastAPI) at `:8000/chat`
4. FastAPI service uses LangChain + Google Gemini model to generate a response, and also runs sentiment analysis (VADER)
5. Response and sentiment metadata flow back through the backend to the frontend

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Chatbot
    
    User->>Frontend: Send message
    Frontend->>Backend: POST /api/chat
    Backend->>Chatbot: POST :8000/chat
    Chatbot->>Chatbot: Process with AI
    Chatbot-->>Backend: AI Response
    Backend-->>Frontend: Forward response
    Frontend->>User: Display message
```

## Running the Project

1. Start MongoDB database
2. Start backend server (port 5000):
   ```bash
   cd backend
   npm install
   npm start
   ```

3. Start Python chatbot (port 8000):
    For development on Windows (PowerShell):
    ```powershell
    cd "C:\Users\saran\OneDrive\Documents\NLP project\chatbot"

    # create and activate virtual environment
    python -m venv venv
    .\venv\Scripts\Activate.ps1

    # (optional) upgrade pip
    python -m pip install --upgrade pip

    # install requirements
    pip install -r .\req.txt

    # run the FastAPI server (uvicorn)
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    ```

4. Start frontend dev server:
   ```bash
   cd my-app
   npm install
   npm run dev
   ```

## Security Notes

- Frontend stores JWT in localStorage (the code labels it `userInside`). Consider using httpOnly cookies for production to reduce XSS risk.
- Backend validates JWT on protected routes using `JWT_SECRET` from environment variables.
- CORS is permissive for local development; restrict allowed origins in production.
- Do NOT commit `.env` files. I found a Google API key in `chatbot/.env` — rotate any exposed keys immediately and add `.env` to `.gitignore`.
- Keep `JWT_SECRET`, `MONGO_URI`, and any API keys in a secure secrets manager in production.

## Development Notes

- Frontend uses Vite + React + Tailwind CSS (located in `my-app/`).
- Backend uses Node.js (ESM) + Express + Mongoose (MongoDB) and exposes `/api/auth` and `/api/chat` (located in `backend/`).
- Chatbot uses Python + FastAPI + LangChain + Google Gemini (via `langchain_google_genai`) and VADER sentiment analysis (located in `chatbot/`).
- All services rely on environment variables for secrets and configuration. See the root `README.md` for `.env` examples and exact variable names.