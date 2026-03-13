"""
PrepSense AI Mock Interview Platform — FastAPI Backend
Main application entry point.

Start with:
  cd backend
  uvicorn main:app --reload --port 8000
"""
import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from database import Base, engine
from routers import sessions, questions, answers, transcribe, tts, report, dashboard, resume_router, resume

# ─── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

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
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global Error Handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(sessions.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(transcribe.router)
app.include_router(tts.router)
app.include_router(report.router)
app.include_router(dashboard.router)
app.include_router(resume_router.router)
app.include_router(resume.router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": "PrepSense API",
        "version": "1.0.0",
        "groq_configured": settings.has_groq,
        "gemini_configured": settings.has_gemini,
    }


@app.get("/health", tags=["Health"])
def health():
    warnings = []
    if not settings.has_groq:
        warnings.append("GROQ_API_KEY not set — AI features will use fallback responses. "
                        "Get your key at https://console.groq.com/keys")
    return {
        "status": "healthy",
        "groq_ready": settings.has_groq,
        "gemini_ready": settings.has_gemini,
        "warnings": warnings,
    }


# ─── Upload directory ─────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# ─── Startup log ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("PrepSense API starting up")
    logger.info(f"  Groq AI:  {'✅ Configured' if settings.has_groq else '❌ NOT SET — add GROQ_API_KEY to backend/.env'}")
    logger.info(f"  Gemini:   {'✅ Configured' if settings.has_gemini else '⚠️  Not set (optional)'}")
    logger.info(f"  DB:       {settings.DATABASE_URL[:40]}...")
    logger.info(f"  Frontend: {settings.FRONTEND_URL}")
    logger.info("=" * 60)
    if not settings.has_groq:
        logger.warning("⚠️  GROQ_API_KEY is missing! Get your free key from https://console.groq.com/keys")
