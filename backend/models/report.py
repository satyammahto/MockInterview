from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, JSON, ForeignKey, DateTime
from database import Base


class FeedbackReport(Base):
    __tablename__ = "feedback_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), unique=True, nullable=False)
    overall_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    clarity_score = Column(Float, nullable=True)
    relevance_score = Column(Float, nullable=True)
    pacing_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)     # 0-10 or 0-100
    grammar_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)
    prep_tips = Column(JSON, nullable=True)
    learning_resources = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)     # ["Strong technical depth", ...]
    improvements = Column(JSON, nullable=True)  # ["Use STAR method", ...]
    advice = Column(JSON, nullable=True)        # ["Practice quantifying results", ...]
    summary_message = Column(Text, nullable=True)  # AI-generated holistic summary

    # ── Confidence Detection (Feature 2) ──────────────────────────────────────
    filler_word_count = Column(Integer, nullable=True, default=0)
    pace_wpm = Column(Float, nullable=True, default=0.0)
    confidence_issues = Column(JSON, nullable=True)  # ["too many filler words", ...]

    # ── STAR Method Evaluation (Feature 3) ────────────────────────────────────
    star_score = Column(Float, nullable=True, default=0.0)
    star_analysis = Column(JSON, nullable=True)  # Per-question STAR breakdown

    created_at = Column(DateTime, default=datetime.utcnow)
