"""
POST /sessions/start  — Upload resume + JD, extract skills, generate questions
GET  /sessions/{session_id} — Fetch session info
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.session import InterviewSession
from models.question import Question
from services.resume_parser import extract_skills
from services.question_gen import generate_questions
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/start")
async def start_session(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
    db: Session = Depends(get_db),
):
    """
    1. Validate & save uploaded resume file
    2. Run PyResparser to extract skills
    3. Call Groq Llama3 to generate questions
    4. Save session + questions to MySQL
    5. Return session_id and questions to frontend
    """
    # Validate file type
    allowed_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if resume.content_type not in allowed_types and not resume.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are accepted.")

    # Read file bytes
    file_bytes = await resume.read()
    if len(file_bytes) > 5 * 1024 * 1024:  # 5 MB limit
        raise HTTPException(status_code=400, detail="File size must be under 5 MB.")

    # Save resume to uploads dir
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{uuid.uuid4()}_{resume.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    # Extract skills
    skills = extract_skills(file_bytes, resume.filename)

    # Generate questions via Groq
    questions_data = generate_questions(
        skills=skills,
        job_description=job_description,
        difficulty=difficulty,
        num_questions=num_questions,
    )

    # Create session in DB
    session_id = str(uuid.uuid4())
    db_session = InterviewSession(
        id=session_id,
        job_description=job_description,
        resume_filename=safe_filename,
        skills_extracted=skills,
        difficulty=difficulty,
        num_questions=str(num_questions),
        status="in_progress",
    )
    db.add(db_session)
    db.flush()

    # Save questions to DB
    db_questions = []
    for i, q in enumerate(questions_data):
        db_q = Question(
            session_id=session_id,
            text=q["text"],
            type=q["type"],
            order_index=i,
        )
        db.add(db_q)
        db_questions.append(db_q)

    db.commit()
    db.refresh(db_session)
    for q in db_questions:
        db.refresh(q)

    return {
        "session_id": session_id,
        "skills_extracted": skills,
        "questions": [
            {"id": q.id, "text": q.text, "type": q.type, "order_index": q.order_index}
            for q in db_questions
        ],
    }


@router.get("/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Return session metadata."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {
        "session_id": session.id,
        "status": session.status,
        "difficulty": session.difficulty,
        "skills_extracted": session.skills_extracted,
        "overall_score": session.overall_score,
        "created_at": session.created_at,
    }
