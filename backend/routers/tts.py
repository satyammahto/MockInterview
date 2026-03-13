"""
POST /tts — Coqui TTS text-to-speech for AI interviewer voice.
Returns WAV audio bytes on success, or a JSON fallback when TTS is unavailable.
The frontend should use the Web Speech API (browser TTS) when fallback=true.
"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tts", tags=["Text-to-Speech"])


class TTSRequest(BaseModel):
    text: str


@router.post("")
async def text_to_speech(body: TTSRequest):
    """
    Convert question text to speech. Returns WAV audio bytes.
    If Coqui TTS is unavailable, returns JSON with fallback=true and the original text,
    so the frontend can use the browser's Web Speech API instead.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    if len(body.text) > 1000:
        raise HTTPException(status_code=400, detail="Text is too long (max 1000 characters).")

    text = body.text.strip()

    try:
        from services.coqui_tts import synthesize_speech
        audio_bytes = synthesize_speech(text)

        if audio_bytes:
            return Response(content=audio_bytes, media_type="audio/wav")

        # synthesize_speech returned empty bytes — use browser fallback
        logger.warning("[TTS] Coqui returned empty audio, using browser fallback.")
        return JSONResponse(
            status_code=200,
            content={"fallback": True, "text": text, "reason": "TTS returned empty audio"}
        )

    except Exception as e:
        # Coqui TTS library not installed or model not available — use browser fallback
        logger.warning(f"[TTS] Coqui TTS not available: {e}. Returning browser fallback.")
        return JSONResponse(
            status_code=200,
            content={"fallback": True, "text": text, "reason": "TTS service unavailable"}
        )
