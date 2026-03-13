"""
Backend configuration using python-decouple.
All values are loaded from the .env file.
"""
from dataclasses import dataclass, field
from functools import lru_cache
from decouple import config


@dataclass
class Settings:
    DATABASE_URL: str
    GROQ_API_KEY: str
    GROQ_MODEL: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    WHISPER_MODEL: str
    TTS_MODEL: str
    TTS_USE_GPU: bool
    FRONTEND_URL: str
    DEBUG: bool
    UPLOAD_DIR: str

    @property
    def has_groq(self) -> bool:
        return bool(self.GROQ_API_KEY and self.GROQ_API_KEY != "your_groq_api_key_here")

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)


@lru_cache()
def get_settings() -> Settings:
    return Settings(
        DATABASE_URL=config("DATABASE_URL"),
        GROQ_API_KEY=config("GROQ_API_KEY", default=""),
        GROQ_MODEL=config("GROQ_MODEL", default="llama3-70b-8192"),
        GEMINI_API_KEY=config("GEMINI_API_KEY", default=""),
        GEMINI_MODEL=config("GEMINI_MODEL", default="gemini-1.5-flash"),
        WHISPER_MODEL=config("WHISPER_MODEL", default="base"),
        TTS_MODEL=config("TTS_MODEL", default="tts_models/en/ljspeech/tacotron2-DDC"),
        TTS_USE_GPU=config("TTS_USE_GPU", default=False, cast=bool),
        FRONTEND_URL=config("FRONTEND_URL", default="http://localhost:3000"),
        DEBUG=config("DEBUG", default=True, cast=bool),
        UPLOAD_DIR=config("UPLOAD_DIR", default="./uploads"),
    )
