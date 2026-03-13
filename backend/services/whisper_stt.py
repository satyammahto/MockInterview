"""
Whisper Speech-to-Text Service.
Uses Groq's Whisper API (fast, cloud-based) with local OpenAI Whisper as fallback.
"""
import os
import tempfile
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_local_model = None


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribe audio bytes to text.
    Primary: Groq Whisper API (faster, no GPU needed)
    Fallback: Local OpenAI Whisper model
    Returns the transcript string (empty string on failure).
    """
    # Try Groq Whisper first (fast cloud-based transcription)
    transcript = _transcribe_with_groq(audio_bytes, filename)
    if transcript:
        return transcript

    # Fallback to local Whisper
    logger.warning("[Whisper] Groq failed, falling back to local Whisper model...")
    return _transcribe_local(audio_bytes, filename)


def _transcribe_with_groq(audio_bytes: bytes, filename: str) -> str:
    """Use Groq's Whisper API for fast transcription."""
    try:
        from groq import Groq
        from config import get_settings
        settings = get_settings()

        if not settings.has_groq:
            return ""

        suffix = Path(filename).suffix.lower() or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            with open(tmp_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    file=(filename, audio_file.read()),
                    model="whisper-large-v3",
                    language="en",
                    response_format="text",
                )
            # Groq returns the text directly as a string when format is "text"
            if isinstance(transcription, str):
                result = transcription.strip()
            else:
                result = getattr(transcription, "text", "").strip()

            logger.info(f"[Whisper] Groq transcription success ({len(result)} chars)")
            return result

        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    except Exception as e:
        logger.warning(f"[Whisper] Groq transcription failed: {e}")
        return ""


def _transcribe_local(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe using local OpenAI Whisper model."""
    global _local_model
    from config import get_settings
    settings = get_settings()

    suffix = Path(filename).suffix.lower() or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        if _local_model is None:
            import whisper
            logger.info(f"[Whisper] Loading local model '{settings.WHISPER_MODEL}'...")
            _local_model = whisper.load_model(settings.WHISPER_MODEL)
            logger.info("[Whisper] Local model loaded.")

        result = _local_model.transcribe(tmp_path, language="en", fp16=False)
        transcript = result.get("text", "").strip()
        logger.info(f"[Whisper] Local transcription success ({len(transcript)} chars)")
        return transcript

    except Exception as e:
        logger.error(f"[Whisper] Local transcription error: {e}")
        return ""

    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
