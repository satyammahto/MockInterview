"""
POST /transcribe — Whisper Speech-to-Text for mic recordings
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.whisper_stt import transcribe_audio

router = APIRouter(prefix="/transcribe", tags=["Transcription"])


@router.post("")
async def transcribe(audio: UploadFile = File(...)):
    """
    Accept an audio file (WebM from MediaRecorder, WAV, MP3) and return its transcript.
    Called by the interview page after each recording stops.
    """
    allowed_extensions = {".webm", ".wav", ".mp3", ".m4a", ".ogg"}
    import os
    ext = os.path.splitext(audio.filename or "audio.webm")[1].lower()
    if ext and ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

    transcript = transcribe_audio(audio_bytes, audio.filename or "audio.webm")

    return {"transcript": transcript}
