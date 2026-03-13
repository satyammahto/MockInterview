"""
Coqui TTS Service.
Synthesizes AI interviewer voice for reading questions aloud.
Imports are lazy to prevent startup crashes when TTS library is not installed.
"""
import os
import tempfile
import logging

logger = logging.getLogger(__name__)


def synthesize_speech(text: str) -> bytes:
    """
    Convert text to speech using Coqui TTS.
    Returns raw WAV audio bytes, or empty bytes on failure.
    All imports are lazy — this function will not crash the server if TTS is not installed.
    """
    if not text or not text.strip():
        return b""

    try:
        from TTS.api import TTS
        from config import get_settings
        settings = get_settings()

        # Lazy-load model singleton
        global _tts
        if _tts is None:
            logger.info(f"[TTS] Loading model '{settings.TTS_MODEL}' (GPU={settings.TTS_USE_GPU})...")
            _tts = TTS(model_name=settings.TTS_MODEL, gpu=settings.TTS_USE_GPU)
            logger.info("[TTS] Model loaded successfully.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp_path = tmp.name

        _tts.tts_to_file(text=text.strip(), file_path=tmp_path)

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        return audio_bytes

    except ImportError:
        logger.warning("[TTS] Coqui TTS library not installed. Returning empty bytes for browser fallback.")
        return b""
    except Exception as e:
        logger.error(f"[TTS] Synthesis error: {e}")
        return b""
    finally:
        try:
            if 'tmp_path' in locals():
                os.remove(tmp_path)
        except OSError:
            pass


# Module-level singleton — starts as None, loaded on first use
_tts = None
