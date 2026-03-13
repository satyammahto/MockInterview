"""
Resume Analyzer Service using Groq Llama3.
Analyzes a resume against a role and job description using AI.
"""
import re
import json
import tempfile
import os
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Try to import PDF extraction tools
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
    _has_pdfminer = True
except ImportError:
    _has_pdfminer = False

try:
    import pdfplumber
    _has_pdfplumber = True
except ImportError:
    _has_pdfplumber = False


def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF/DOCX for AI analysis."""
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        # Try pdfplumber first (more reliable)
        if _has_pdfplumber:
            try:
                import io
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    text = "\n".join(
                        page.extract_text() or "" for page in pdf.pages
                    )
                if text.strip():
                    return text.strip()
            except Exception as e:
                logger.warning(f"[ResumeAnalyzer] pdfplumber failed: {e}")

        # Fallback to pdfminer
        if _has_pdfminer:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            try:
                text = pdf_extract_text(tmp_path)
                return text.strip() if text else ""
            except Exception as e:
                logger.warning(f"[ResumeAnalyzer] pdfminer failed: {e}")
            finally:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    return ""


def analyze_resume(
    file_bytes: bytes,
    filename: str,
    role: str,
    job_description: str
) -> Dict[str, Any]:
    """
    Analyze resume against a role and JD using Groq AI.
    Returns structured feedback dict.
    """
    from config import get_settings
    from services.resume_parser import extract_skills

    settings = get_settings()

    if not settings.has_groq:
        logger.error("[ResumeAnalyzer] GROQ_API_KEY not configured.")
        return _error_response(role, "Groq API key is not configured.")

    resume_text = extract_raw_text(file_bytes, filename)
    skills = extract_skills(file_bytes, filename)
    skills_str = ", ".join(skills[:30]) if skills else "Not detected"

    if not resume_text:
        resume_text = f"Skills detected: {skills_str}"

    prompt = f"""You are an expert Career Coach and ATS Specialist. Analyze the following resume for the role of '{role}'.

Job Description: {job_description[:1500]}
Extracted Skills: {skills_str}
Resume Text:
{resume_text[:4500]}

Evaluate and score the resume 0-100 across these dimensions:
1. Keyword & skill match with the JD
2. Business impact and quantified achievements
3. Grammar and professional language
4. Experience relevancy for the target role
5. ATS optimization and formatting

IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no explanation before or after.
{{
  "score": <integer 0-100>,
  "role": "{role}",
  "keyword_match": {{
    "strengths": ["matched keywords and skills"],
    "improvements": ["missing or underrepresented keywords from JD"]
  }},
  "impact": {{
    "strengths": ["well-quantified achievements"],
    "improvements": ["vague statements that could be improved with metrics"]
  }},
  "grammar": {{
    "strengths": ["professional language positives"],
    "improvements": ["grammar or style issues"]
  }},
  "experience": {{
    "strengths": ["relevant experience highlights"],
    "improvements": ["gaps or missing experience for this role"]
  }},
  "ats": {{
    "strengths": ["ATS-friendly elements"],
    "improvements": ["formatting or structure improvements for ATS"]
  }}
}}"""

    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000,
        )

        content = response.choices[0].message.content
        logger.debug(f"[ResumeAnalyzer] Raw response: {content[:300]}")

        # Robust JSON extraction
        text = content.strip()
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            pass

        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            data = json.loads(match.group())
            return data

        logger.warning("[ResumeAnalyzer] Could not parse AI response.")
        return _error_response(role, "Could not parse AI response.")

    except json.JSONDecodeError as e:
        logger.error(f"[ResumeAnalyzer] JSON parse error: {e}")
        return _error_response(role, "Failed to parse AI response.")
    except Exception as e:
        logger.error(f"[ResumeAnalyzer] AI Error: {e}")
        return _error_response(role, str(e))


def _error_response(role: str, message: str) -> Dict[str, Any]:
    return {
        "score": 0,
        "role": role,
        "error": message,
        "keyword_match": {"strengths": [], "improvements": [f"Analysis failed: {message}"]},
        "impact": {"strengths": [], "improvements": []},
        "grammar": {"strengths": [], "improvements": []},
        "experience": {"strengths": [], "improvements": []},
        "ats": {"strengths": [], "improvements": []},
    }
