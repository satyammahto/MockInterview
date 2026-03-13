from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, JSON, ForeignKey, DateTime
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="Technical")  # Technical / Behavioral / Deep Dive
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    transcript = Column(Text, nullable=True)           # Whisper STT output
    time_taken_seconds = Column(Integer, nullable=True)
    score = Column(Float, nullable=True)               # AI-scored 0-100
    ideal_answer = Column(Text, nullable=True)         # Groq-generated ideal answer
    tips = Column(JSON, nullable=True)                 # ["Quantify results", ...]
    submitted_at = Column(DateTime, default=datetime.utcnow)
