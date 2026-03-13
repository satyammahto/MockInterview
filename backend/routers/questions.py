"""
GET /sessions/{session_id}/questions — Load all questions for a session
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.question import Question

router = APIRouter(prefix="/sessions", tags=["Questions"])


@router.get("/{session_id}/questions")
def get_questions(session_id: str, db: Session = Depends(get_db)):
    """
    Return all questions for the given session, ordered by order_index.
    Called by the interview page on mount.
    """
    questions = (
        db.query(Question)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this session.")

    return {
        "session_id": session_id,
        "questions": [
            {"id": q.id, "text": q.text, "type": q.type, "order_index": q.order_index}
            for q in questions
        ],
    }
