"""
Coqui TTS Service.
Synthesizes AI interviewer voice for reading questions aloud.
"""
import os
import tempfile
from config import get_settings

settings = get_settings()

_tts = None


def _get_tts():
    global _tts
    if _tts is None:
        from TTS.api import TTS
        use_gpu = settings.TTS_USE_GPU
        print(f"[TTS] Loading model '{settings.TTS_MODEL}' (GPU={use_gpu})...")
        _tts = TTS(model_name=settings.TTS_MODEL, gpu=use_gpu)
        print("[TTS] Model loaded.")
    return _tts


def synthesize_speech(text: str) -> bytes:
    """
    Convert text to speech using Coqui TTS.
    Returns raw WAV audio bytes, or empty bytes on failure.
    """
    if not text or not text.strip():
        return b""

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp_path = tmp.name

    try:
        tts = _get_tts()
        tts.tts_to_file(text=text.strip(), file_path=tmp_path)
        
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        
        return audio_bytes

    except Exception as e:
        print(f"[TTS] Synthesis error: {e}")
        return b""

    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
