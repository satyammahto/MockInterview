"""
POST /sessions/{session_id}/generate-report — Evaluate all answers, save feedback report
GET  /sessions/{session_id}/report          — Fetch saved report for the report page
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.session import InterviewSession
from models.question import Question, Answer
from models.report import FeedbackReport
from services.feedback_gen import evaluate_answer, generate_overall_feedback

router = APIRouter(prefix="/sessions", tags=["Report"])


@router.post("/{session_id}/generate-report")
def generate_report(session_id: str, db: Session = Depends(get_db)):
    """
    1. Load all Q&A pairs for this session
    2. Call Groq to evaluate each answer (score, ideal, tips)
    3. Call Groq for overall session metrics
    4. Save everything to DB
    5. Return the full report
    Called by interview page after the last answer is submitted.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    questions = (
        db.query(Question)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )
    if not questions:
        raise HTTPException(status_code=400, detail="No questions found for this session.")

    # Build Q&A pairs and evaluate each answer
    qa_pairs = []
    feedback_items = []

    for q in questions:
        answer = db.query(Answer).filter(
            Answer.question_id == q.id,
            Answer.session_id == session_id,
        ).first()

        transcript = answer.transcript if answer else ""
        evaluation = evaluate_answer(
            question_text=q.text,
            question_type=q.type,
            candidate_answer=transcript,
        )

        # Update answer record with AI evaluation
        if answer:
            answer.score = evaluation.get("score", 0)
            answer.ideal_answer = evaluation.get("ideal_answer", "")
            answer.tips = evaluation.get("tips", [])
            db.add(answer)

        qa_pairs.append({
            "question": q.text,
            "type": q.type,
            "answer": transcript,
            "score": evaluation.get("score", 0),
        })

        feedback_items.append({
            "question_id": q.id,
            "question_text": q.text,
            "question_type": q.type,
            "score": evaluation.get("score", 0),
            "your_answer": transcript,
            "ideal_answer": evaluation.get("ideal_answer", ""),
            "tips": evaluation.get("tips", []),
        })

    # Generate overall feedback
    overall = generate_overall_feedback(
        qa_pairs=qa_pairs,
        skills=session.skills_extracted or [],
    )

    # Upsert feedback report
    existing_report = db.query(FeedbackReport).filter(
        FeedbackReport.session_id == session_id
    ).first()

    if existing_report:
        report = existing_report
    else:
        report = FeedbackReport(session_id=session_id)
        db.add(report)

    report.overall_score = overall.get("overall_score", 0)
    report.confidence_score = overall.get("confidence_score", 70)
    report.clarity_score = overall.get("clarity_score", 70)
    report.relevance_score = overall.get("relevance_score", 70)
    report.pacing_score = overall.get("pacing_score", 70)
    report.strengths = overall.get("strengths", [])
    report.improvements = overall.get("improvements", [])
    report.advice = overall.get("advice", [])

    # Update session status
    session.status = "completed"
    session.overall_score = overall.get("overall_score", 0)
    session.completed_at = datetime.utcnow()
    db.add(session)

    db.commit()

    return _build_report_response(overall, feedback_items)


@router.get("/{session_id}/report")
def get_report(session_id: str, db: Session = Depends(get_db)):
    """
    Fetch the saved feedback report for the report page.
    """
    report = db.query(FeedbackReport).filter(
        FeedbackReport.session_id == session_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found. Make sure the session is completed first via POST /generate-report."
        )

    # Reload the per-question breakdown from DB
    questions = (
        db.query(Question)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )

    feedback_items = []
    for q in questions:
        answer = db.query(Answer).filter(
            Answer.question_id == q.id,
            Answer.session_id == session_id,
        ).first()
        feedback_items.append({
            "question_id": q.id,
            "question_text": q.text,
            "question_type": q.type,
            "score": answer.score if answer else 0,
            "your_answer": answer.transcript if answer else "",
            "ideal_answer": answer.ideal_answer if answer else "",
            "tips": answer.tips if answer else [],
        })

    overall = {
        "overall_score": report.overall_score,
        "confidence_score": report.confidence_score,
        "clarity_score": report.clarity_score,
        "relevance_score": report.relevance_score,
        "pacing_score": report.pacing_score,
        "strengths": report.strengths,
        "improvements": report.improvements,
        "advice": report.advice,
        "summary_message": "Review your answers and the ideal responses to keep improving.",
    }

    return _build_report_response(overall, feedback_items)


def _build_report_response(overall: dict, feedback_items: list) -> dict:
    return {
        "overall_score": overall.get("overall_score", 0),
        "metrics": {
            "confidence": overall.get("confidence_score", 70),
            "clarity": overall.get("clarity_score", 70),
            "relevance": overall.get("relevance_score", 70),
            "pacing": overall.get("pacing_score", 70),
        },
        "feedback": feedback_items,
        "strengths": overall.get("strengths", []),
        "improvements": overall.get("improvements", []),
        "advice": overall.get("advice", []),
        "summary_message": overall.get("summary_message", ""),
    }
