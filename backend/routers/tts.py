"""
POST /tts — Coqui TTS text-to-speech for AI interviewer voice
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from services.coqui_tts import synthesize_speech

router = APIRouter(prefix="/tts", tags=["Text-to-Speech"])


class TTSRequest(BaseModel):
    text: str


@router.post("")
async def text_to_speech(body: TTSRequest):
    """
    Convert question text to speech. Returns WAV audio bytes.
    Called by the interview page to have the AI read the question aloud.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    if len(body.text) > 1000:
        raise HTTPException(status_code=400, detail="Text is too long (max 1000 characters).")

    audio_bytes = synthesize_speech(body.text.strip())

    if not audio_bytes:
        raise HTTPException(status_code=500, detail="TTS synthesis failed.")

    return Response(content=audio_bytes, media_type="audio/wav")
