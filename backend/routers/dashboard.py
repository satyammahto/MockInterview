"""
GET /dashboard/stats — Aggregated stats and recent session history
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.session import InterviewSession

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Return aggregated statistics and recent interview history.
    Called by the dashboard page on mount.
    
    NOTE: For MVP (no auth), this returns stats for ALL sessions.
    When auth is added, filter by user_id from JWT token.
    """
    # Completed sessions only
    completed = (
        db.query(InterviewSession)
        .filter(InterviewSession.status == "completed")
        .all()
    )

    total_completed = len(completed)
    scores = [s.overall_score for s in completed if s.overall_score is not None]
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    # Estimate practice time: assume avg 2 min per question
    total_questions = sum(int(s.num_questions or 5) for s in completed)
    practice_time_hours = round((total_questions * 2) / 60, 1)

    # Goal readiness
    if avg_score >= 85:
        readiness = "High"
    elif avg_score >= 70:
        readiness = "Medium"
    else:
        readiness = "Building"

    # Recent sessions (last 10, most recent first)
    recent = (
        db.query(InterviewSession)
        .filter(InterviewSession.status == "completed")
        .order_by(InterviewSession.completed_at.desc())
        .limit(10)
        .all()
    )

    history = []
    for s in recent:
        # Extract job role hint from first 60 chars of JD
        jd_preview = (s.job_description or "")[:60].strip()
        history.append({
            "session_id": s.id,
            "role": jd_preview or "Practice Session",
            "date": s.completed_at.strftime("%b %d") if s.completed_at else "",
            "score": round(s.overall_score) if s.overall_score else 0,
            "difficulty": s.difficulty,
        })

    # Performance trend — last 10 scores in chronological order
    trend_sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.status == "completed",
            InterviewSession.overall_score.isnot(None),
        )
        .order_by(InterviewSession.completed_at.asc())
        .limit(10)
        .all()
    )
    performance_trend = [round(s.overall_score) for s in trend_sessions]

    return {
        "stats": {
            "interviews_completed": total_completed,
            "avg_score": avg_score,
            "practice_time_hours": practice_time_hours,
            "goal_readiness": readiness,
        },
        "recent_sessions": history,
        "performance_trend": performance_trend if performance_trend else [0],
    }
