import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, Enum, Float, DateTime
from database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)  # Optional for MVP (no auth yet)
    job_description = Column(Text, nullable=False)
    resume_filename = Column(String(255), nullable=True)
    skills_extracted = Column(JSON, nullable=True)  # ["React", "TypeScript", ...]
    difficulty = Column(
        Enum("easy", "medium", "hard"), nullable=False, default="medium"
    )
    num_questions = Column(String(5), nullable=False, default="5")
    status = Column(
        Enum("in_progress", "completed"), nullable=False, default="in_progress"
    )
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
