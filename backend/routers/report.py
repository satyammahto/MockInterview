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
from services.confidence_analyzer import analyze_confidence, aggregate_confidence
from services.answer_evaluator import evaluate_answer_v2
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/sessions", tags=["Report"])


@router.post("/{session_id}/generate-report")
def generate_report(session_id: str, db: Session = Depends(get_db)):
    """
    1. Load all Q&A pairs for this session
    2. Call Groq to evaluate each answer (score, ideal, tips, STAR analysis)
    3. Run confidence analysis on each answer transcript
    4. Call Groq for overall session metrics
    5. Save everything to DB
    6. Return the full report
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
    confidence_analyses = []
    star_analyses = []

    for q in questions:
        answer = db.query(Answer).filter(
            Answer.question_id == q.id,
            Answer.session_id == session_id,
        ).first()

        transcript = answer.transcript if answer else ""
        duration = answer.time_taken_seconds if answer else 0

        # AI evaluation (includes STAR analysis)
        evaluation = evaluate_answer(
            question_text=q.text,
            question_type=q.type,
            candidate_answer=transcript,
        )

        # Confidence analysis (local, no API)
        conf_analysis = analyze_confidence(transcript, duration or 0)
        confidence_analyses.append(conf_analysis)

        # Extract STAR analysis from evaluation
        star = evaluation.get("star_analysis", {
            "situation": False, "task": False, "action": False, "result": False,
            "star_score": 0, "missing_components": ["situation", "task", "action", "result"],
        })
        star_analyses.append(star)

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
            "feedback": evaluation.get("feedback", ""),
            "star_analysis": star,
            "confidence": {
                "confidence_score": conf_analysis["confidence_score"],
                "filler_word_count": conf_analysis["filler_word_count"],
                "pace_wpm": conf_analysis["pace_wpm"],
            },
        })

    # Aggregate confidence across all answers
    agg_confidence = aggregate_confidence(confidence_analyses)

    # Aggregate STAR scores
    star_scores = [s.get("star_score", 0) for s in star_analyses]
    avg_star_score = round(sum(star_scores) / max(len(star_scores), 1))

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
    report.summary_message = overall.get("summary_message", "")
    report.prep_tips = overall.get("prep_tips", [])
    report.learning_resources = overall.get("learning_resources", [])
    
    # Granular scores
    report.technical_score = overall.get("technical_score", overall.get("overall_score", 0))
    report.grammar_score = overall.get("grammar_score", 70)
    report.communication_score = overall.get("communication_score", 70)

    # Confidence detection fields
    report.filler_word_count = agg_confidence["total_filler_count"]
    report.pace_wpm = agg_confidence["avg_pace_wpm"]
    report.confidence_issues = agg_confidence["all_issues"]

    # STAR evaluation fields
    report.star_score = avg_star_score
    report.star_analysis = star_analyses

    # Update session status
    session.status = "completed"
    session.overall_score = overall.get("overall_score", 0)
    session.completed_at = datetime.utcnow()
    db.add(session)

    db.commit()

    return _build_report_response(overall, feedback_items, agg_confidence, avg_star_score, star_analyses)


class EvaluationRequest(BaseModel):
    session_id: str
    question: str
    user_answer: str
    interview_mode: Optional[str] = "mixed"
    role: Optional[str] = "Software Engineer"


@router.post("/evaluate-answer")
async def api_evaluate_answer(req: EvaluationRequest):
    """
    Real-time answer evaluation during an interview session.
    """
    try:
        result = evaluate_answer_v2(
            question=req.question,
            user_answer=req.user_answer,
            interview_mode=req.interview_mode,
            role=req.role
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        "prep_tips": report.prep_tips,
        "learning_resources": report.learning_resources,
        "summary_message": report.summary_message or "Review your answers and the ideal responses to keep improving.",
    }

    agg_confidence = {
        "avg_confidence_score": report.confidence_score or 0,
        "total_filler_count": report.filler_word_count or 0,
        "avg_pace_wpm": report.pace_wpm or 0.0,
        "top_filler_words": [],
        "all_issues": report.confidence_issues or [],
    }

    return _build_report_response(
        overall, feedback_items, agg_confidence,
        report.star_score or 0, report.star_analysis or []
    )


def _build_report_response(
    overall: dict,
    feedback_items: list,
    confidence: dict,
    star_score: float,
    star_analyses: list,
) -> dict:
    return {
        "overall_score": overall.get("overall_score", 0),
        "metrics": {
            "confidence": overall.get("confidence_score", 70),
            "clarity": overall.get("clarity_score", 70),
            "relevance": overall.get("relevance_score", 70),
            "pacing": overall.get("pacing_score", 70),
            "technical": overall.get("technical_score", 70),
            "grammar": overall.get("grammar_score", 70),
            "communication": overall.get("communication_score", 70),
        },
        "feedback": feedback_items,
        "strengths": overall.get("strengths", []),
        "improvements": overall.get("improvements", []),
        "advice": overall.get("advice", []),
        "prep_tips": overall.get("prep_tips", []),
        "learning_resources": overall.get("learning_resources", []),
        "summary_message": overall.get("summary_message", ""),

        # Confidence Detection (Feature 2)
        "confidence_analysis": {
            "confidence_score": confidence.get("avg_confidence_score", 0),
            "filler_word_count": confidence.get("total_filler_count", 0),
            "pace_wpm": confidence.get("avg_pace_wpm", 0.0),
            "top_filler_words": confidence.get("top_filler_words", []),
            "issues": confidence.get("all_issues", []),
        },

        # STAR Method Evaluation (Feature 3)
        "star_evaluation": {
            "star_score": star_score,
            "per_question": star_analyses,
        },
    }
