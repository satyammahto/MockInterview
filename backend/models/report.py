from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
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
    strengths = Column(JSON, nullable=True)    # ["Strong technical depth", ...]
    improvements = Column(JSON, nullable=True) # ["Use STAR method", ...]
    advice = Column(JSON, nullable=True)       # ["Practice quantifying results", ...]
    created_at = Column(DateTime, default=datetime.utcnow)
