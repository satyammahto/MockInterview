"""
Resume Parser Service — Pure Python skill extraction.
Uses pdfplumber + regex matching against a tech-skill vocabulary.
No nltk, no pyresparser — zero external data downloads needed.
"""
import io
import re
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)

# ─── Comprehensive tech/soft-skill vocabulary ──────────────────────────────────
_SKILL_VOCAB = {
    # Programming languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "perl",
    "haskell", "elixir", "dart", "lua", "bash", "shell", "powershell", "groovy",
    # Web / Frontend
    "react", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "html",
    "css", "sass", "scss", "tailwind", "bootstrap", "jquery", "webpack", "vite",
    "redux", "zustand", "mobx", "graphql", "rest", "restful",
    # Backend / Frameworks
    "fastapi", "django", "flask", "express", "node.js", "nodejs", "spring",
    "spring boot", "rails", "laravel", "asp.net", "gin", "fiber", "nestjs",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite", "cassandra",
    "elasticsearch", "dynamodb", "firestore", "prisma", "sqlalchemy", "orm",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "nginx", "linux", "unix",
    "heroku", "vercel", "netlify", "cloudflare",
    # ML / AI / Data
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "sklearn",
    "scikit-learn", "pandas", "numpy", "opencv", "nlp", "llm", "langchain",
    "hugging face", "transformers", "data science", "data analysis", "power bi",
    "tableau", "spark", "hadoop", "airflow", "dbt",
    # Tools / Other
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma",
    "postman", "swagger", "microservices", "api", "jwt", "oauth", "websocket",
    "celery", "rabbitmq", "kafka", "grpc",
    # Soft skills
    "leadership", "teamwork", "communication", "problem solving", "agile",
    "scrum", "kanban", "mentoring",
}

# Compile a single pattern for speed
_PATTERN = re.compile(
    r'\b(' + '|'.join(re.escape(skill) for skill in sorted(_SKILL_VOCAB, key=len, reverse=True)) + r')\b',
    re.IGNORECASE,
)


def extract_skills(file_bytes: bytes, filename: str) -> List[str]:
    """
    Extract skills from a PDF/DOCX resume using pdfplumber + regex matching.
    Returns a deduplicated list of recognised skills — no external downloads needed.
    """
    try:
        text = _extract_text(file_bytes, filename)
        if not text:
            logger.warning("[ResumeParser] No text extracted from file.")
            return []

        matches = _PATTERN.findall(text)
        # Normalise case: capitalise common acronyms, lowercase the rest
        seen = set()
        skills = []
        for m in matches:
            key = m.lower()
            if key not in seen:
                seen.add(key)
                # Preserve common capitalisations
                skills.append(_normalise_skill(m))

        logger.info(f"[ResumeParser] Extracted {len(skills)} skills from resume.")
        return skills

    except Exception as e:
        logger.error(f"[ResumeParser] Skill extraction failed: {e}")
        return []


def _extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from PDF or DOCX bytes."""
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        return _pdf_text(file_bytes)
    if suffix in {".docx", ".doc"}:
        return _docx_text(file_bytes)

    # Last resort: try PDF
    return _pdf_text(file_bytes)


def _pdf_text(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
        return "\n".join(pages).strip()
    except Exception as e:
        logger.warning(f"[ResumeParser] pdfplumber failed: {e}")

    # Fallback: pdfminer
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        import tempfile, os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        try:
            return (pdfminer_extract(tmp_path) or "").strip()
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
    except Exception as e:
        logger.warning(f"[ResumeParser] pdfminer fallback failed: {e}")

    return ""


def _docx_text(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs).strip()
    except Exception as e:
        logger.warning(f"[ResumeParser] python-docx failed: {e}")
        return ""


def _normalise_skill(raw: str) -> str:
    """Capitalise known acronyms; title-case multi-word skills."""
    _UPPER = {
        "aws", "gcp", "api", "html", "css", "sql", "jwt", "orm", "jwt",
        "nlp", "llm", "ci/cd", "dbt", "grpc", "css",
    }
    lower = raw.lower()
    if lower in _UPPER:
        return raw.upper()
    return raw.strip()
