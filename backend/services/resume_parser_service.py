"""
Resume Parser Service.
Extracts structured data (skills, projects, experience, target role)
from a PDF resume. Uses Groq Llama3 (falls back to Gemini if available).
"""
import io
import re
import json
import logging
from typing import Optional

from models.resume import ResumeExtractionResponse

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using pdfplumber."""
    text = ""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        logger.error(f"[ResumeParser] Error reading PDF: {e}")
        raise ValueError("Invalid PDF format or unable to extract text.")
    return text.strip()


def _extract_json(text: str) -> Optional[dict]:
    """Robustly extract JSON from LLM response."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None


EXTRACT_PROMPT = """You are an expert AI resume parser.

Extract the following fields from the resume text below and return ONLY a raw JSON object (no markdown, no explanation).

Fields to extract:
- "skills": list of strings (programming languages, tools, frameworks, soft skills)
- "projects": list of strings (brief descriptions of projects)
- "experience": list of strings (job roles and responsibilities)
- "target_role": single string (inferred target job role, e.g. "Software Engineer")

Resume Text:
{resume_text}

Return ONLY valid JSON."""


async def extract_resume_data(file_bytes: bytes) -> ResumeExtractionResponse:
    """
    Extract structured data from a PDF resume using AI.
    Tries Groq first, then Gemini if configured.
    """
    from config import get_settings
    settings = get_settings()

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise ValueError("No text could be extracted from the provided resume.")

    prompt = EXTRACT_PROMPT.format(resume_text=resume_text[:5000])

    # Try Groq first (preferred)
    if settings.has_groq:
        result = await _extract_with_groq(prompt, settings)
        if result:
            return ResumeExtractionResponse(**result)

    # Try Gemini as fallback
    if settings.has_gemini:
        result = await _extract_with_gemini(prompt, settings)
        if result:
            return ResumeExtractionResponse(**result)

    raise ValueError(
        "AI API key not configured. Please set GROQ_API_KEY in backend/.env"
    )


async def _extract_with_groq(prompt: str, settings) -> Optional[dict]:
    """Extract resume data using Groq."""
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1500,
        )
        content = response.choices[0].message.content
        result = _extract_json(content)
        if result:
            logger.info("[ResumeParser] Groq extraction successful.")
            return result
        logger.warning("[ResumeParser] Groq returned unparseable response.")
        return None
    except Exception as e:
        logger.warning(f"[ResumeParser] Groq extraction failed: {e}")
        return None


async def _extract_with_gemini(prompt: str, settings) -> Optional[dict]:
    """Extract resume data using Gemini as fallback."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        content = response.text
        result = _extract_json(content)
        if result:
            logger.info("[ResumeParser] Gemini extraction successful.")
            return result
        logger.warning("[ResumeParser] Gemini returned unparseable response.")
        return None
    except Exception as e:
        logger.warning(f"[ResumeParser] Gemini extraction failed: {e}")
        return None
