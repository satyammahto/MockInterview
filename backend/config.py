from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/prepsense_db"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-8b-8192"
    WHISPER_MODEL: str = "base"
    TTS_MODEL: str = "tts_models/en/ljspeech/tacotron2-DDC"
    TTS_USE_GPU: bool = False
    FRONTEND_URL: str = "http://localhost:3000"
    DEBUG: bool = True
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
