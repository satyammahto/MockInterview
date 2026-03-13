"""
Whisper Speech-to-Text Service.
Transcribes audio recordings from the interview microphone.
"""
import os
import tempfile
from pathlib import Path
from config import get_settings

settings = get_settings()

_model = None


def _get_model():
    global _model
    if _model is None:
        import whisper
        print(f"[Whisper] Loading model '{settings.WHISPER_MODEL}'...")
        _model = whisper.load_model(settings.WHISPER_MODEL)
        print("[Whisper] Model loaded.")
    return _model


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribe audio bytes using OpenAI Whisper.
    Supports WebM (from MediaRecorder), WAV, MP3, etc.
    Returns the transcript string (empty string on failure).
    """
    suffix = Path(filename).suffix.lower() or ".webm"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()
        result = model.transcribe(tmp_path, language="en", fp16=False)
        transcript = result.get("text", "").strip()
        return transcript

    except Exception as e:
        print(f"[Whisper] Transcription error: {e}")
        return ""

    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
