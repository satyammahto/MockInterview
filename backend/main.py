"""
PrepSense AI Mock Interview Platform — FastAPI Backend
Main application entry point.

Start with:
  cd backend
  uvicorn main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import Base, engine
from routers import sessions, questions, answers, transcribe, tts, report, dashboard, resume

settings = get_settings()

# ─── Create all DB tables on startup ─────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="PrepSense API",
    description="AI Mock Interview Platform — FastAPI Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS (allow Next.js dev server) ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(sessions.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(transcribe.router)
app.include_router(tts.router)
app.include_router(report.router)
app.include_router(dashboard.router)
app.include_router(resume.router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "PrepSense API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


# ─── Upload directory ─────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
