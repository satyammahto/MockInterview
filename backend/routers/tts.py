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

    try:
        audio_bytes = synthesize_speech(body.text.strip())
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"[TTS] Synthesis error: {e}")
        audio_bytes = b""

    if not audio_bytes:
        # Return 200 with an empty body + custom header so the frontend knows to
        # fall back to window.speechSynthesis — never block interview flow.
        return Response(
            content=b"",
            media_type="audio/wav",
            headers={"X-TTS-Fallback": "true"},
        )

    return Response(content=audio_bytes, media_type="audio/wav")
