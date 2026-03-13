"""
POST /analyze-voice — Local voice analysis (no API calls required)
Accepts a transcript + duration and returns filler-word, WPM, and confidence metrics.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.voice_analysis import analyze_voice

router = APIRouter(prefix="/analyze-voice", tags=["Voice Analysis"])


class VoiceAnalysisRequest(BaseModel):
    transcript: str = Field(..., description="Full transcript of the candidate's answer")
    duration_seconds: float = Field(default=60.0, ge=1.0, description="Recording duration in seconds")


@router.post("")
def voice_analysis(body: VoiceAnalysisRequest):
    """
    Analyse a candidate's answer transcript for:
    - Filler words (count per word)
    - Speaking pace (WPM)
    - Pause count
    - Confidence score (0-100)

    Runs entirely locally — no external API calls.
    """
    if not body.transcript or not body.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        result = analyze_voice(
            transcript=body.transcript.strip(),
            duration_seconds=body.duration_seconds,
        )
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"[VoiceAnalysis] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")
