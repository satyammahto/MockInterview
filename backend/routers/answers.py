"""
POST /sessions/{session_id}/answers — Submit a transcribed answer
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.question import Question, Answer
from models.session import InterviewSession
from services.question_gen import generate_followup_question

router = APIRouter(prefix="/sessions", tags=["Answers"])


class AnswerSubmit(BaseModel):
    question_id: int
    transcript: str
    time_taken_seconds: Optional[int] = None


@router.post("/{session_id}/answers")
def submit_answer(
    session_id: str,
    body: AnswerSubmit,
    db: Session = Depends(get_db),
):
    """
    Save the transcribed answer and generate a follow-up question if needed.
    Called by the interview page after each answer.
    """
    # Validate session
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Validate question belongs to this session
    question = db.query(Question).filter(
        Question.id == body.question_id,
        Question.session_id == session_id,
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found for this session.")

    # Check if answer already submitted
    existing = db.query(Answer).filter(
        Answer.question_id == body.question_id,
        Answer.session_id == session_id,
    ).first()
    if existing:
        # Allow re-submission — update the existing answer
        existing.transcript = body.transcript
        existing.time_taken_seconds = body.time_taken_seconds
        db.commit()
        answer_id = existing.id
    else:
        # Create new answer
        db_answer = Answer(
            question_id=body.question_id,
            session_id=session_id,
            transcript=body.transcript,
            time_taken_seconds=body.time_taken_seconds,
        )
        db.add(db_answer)
        db.commit()
        db.refresh(db_answer)
        answer_id = db_answer.id

    # Generate follow-up question
    followup = generate_followup_question(
        original_question=question.text,
        candidate_answer=body.transcript,
        skills=session.skills_extracted or [],
    )

    return {
        "status": "ok",
        "answer_id": answer_id,
        "followup_question": followup,
    }
