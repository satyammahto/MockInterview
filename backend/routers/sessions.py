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
    job_description: str = Form(""),
    manual_skills: str = Form(""),
    role: str = Form(""),
    experience: str = Form(""),
    persona: str = Form(""),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
<<<<<<< HEAD
    interview_mode: str = Form("mixed"),
    role: str = Form(""),
=======
    resume: Optional[UploadFile] = File(None),
>>>>>>> 43af45495dfc197909b53ff7992bfae07c08618d
    db: Session = Depends(get_db),
):
    """
    1. Validate & save uploaded resume file if present
    2. Run PyResparser to extract skills if resume present
    3. Combine with manual skills 
    4. Call Groq Llama3 to generate questions
    5. Save session + questions to MySQL
    6. Return session_id and questions to frontend
    """
    skills = []
    safe_filename = "manual_entry"

    if resume and resume.filename:
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
        resume_skills = extract_skills(file_bytes, resume.filename)
        if isinstance(resume_skills, list):
             skills.extend(resume_skills)

    # Add manual skills, role, and experience to the skills list
    manual_combined = []
    if manual_skills:
        manual_combined.append(f"Key Skills: {manual_skills}")
    if role:
        manual_combined.append(f"Target Role: {role}")
    if experience:
        manual_combined.append(f"Experience Level: {experience}")
    if persona:
        manual_combined.append(f"Interviewer Persona: {persona}")
    
    if manual_combined:
        skills.insert(0, " | ".join(manual_combined))

    if not skills:
        raise HTTPException(status_code=400, detail="Please provide either a resume or manual skills.")

    # Validate interview_mode
    valid_modes = {"hr", "technical", "behavioral", "stress", "mixed"}
    if interview_mode.lower() not in valid_modes:
        interview_mode = "mixed"

    # Generate questions via Groq (mode-aware)
    questions_data = generate_questions(
        skills=skills,
        job_description=job_description,
        difficulty=difficulty,
        num_questions=num_questions,
        role=role,
        interview_mode=interview_mode,
    )

    # Create session in DB
    session_id = str(uuid.uuid4())
    db_session = InterviewSession(
        id=session_id,
        job_description=job_description,
        resume_filename=safe_filename,
        skills_extracted=skills,
        difficulty=difficulty,
        interview_mode=interview_mode.lower(),
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
        "interview_mode": session.interview_mode,
        "skills_extracted": session.skills_extracted,
        "overall_score": session.overall_score,
        "created_at": session.created_at,
    }
