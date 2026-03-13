import json
import tempfile
import os
from pathlib import Path
from typing import Dict, Any
from groq import Groq
from config import get_settings
from services.resume_parser import extract_skills
from models.resume import ResumeAnalysisResponse

# Try to import PDF extraction tools
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except ImportError:
    pdf_extract_text = None

settings = get_settings()
_client: Groq | None = None

def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client

def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF for AI analysis."""
    suffix = Path(filename).suffix.lower()
    if suffix != ".pdf":
        return ""
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        if pdf_extract_text:
            text = pdf_extract_text(tmp_path)
            return text
        return ""
    except Exception as e:
        print(f"[ResumeAnalyzer] Text extraction error: {e}")
        return ""
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

def analyze_resume(file_bytes: bytes, filename: str, role: str, job_description: str) -> Dict[str, Any]:
    """
    Analyze resume against a role and JD using AI.
    """
    resume_text = extract_raw_text(file_bytes, filename)
    # Also extract skills using existing service for better context if needed
    skills = extract_skills(file_bytes, filename)
    
    prompt = f"""
    You are an expert Career Coach and ATS Specialist. Analyze the following resume for the role of '{role}'.
    
    Role: {role}
    Job Description: {job_description}
    Resume Text: {resume_text[:4000]}
    Extracted Skills: {", ".join(skills)}
    
    Evaluate the resume based on:
    1. Skill and keyword match
    2. Business impact and achievements (quantified metrics)
    3. Grammar and professional language
    4. Experience relevancy
    5. ATS friendliness
    
    Provide a score from 0-100.
    
    Respond ONLY with a valid JSON in the following format:
    {{
      "score": number,
      "role": "{role}",
      "keyword_match": {{
        "strengths": ["list of strengths"],
        "improvements": ["list of missing keywords"]
      }},
      "impact": {{
        "strengths": ["list of quantified achievements"],
        "improvements": ["where for better impact"]
      }},
      "grammar": {{
        "strengths": ["language positives"],
        "improvements": ["corrections if any"]
      }},
      "experience": {{
        "strengths": ["relevant experience points"],
        "improvements": ["gaps in alignment"]
      }},
      "ats": {{
        "strengths": ["formatting positives"],
        "improvements": ["readability improvements"]
      }}
    }}
    """

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, # Lower temperature for more structured/precise output
            max_tokens=2000,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Strip markdown code fences
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        analysis_data = json.loads(content)
        return analysis_data

    except Exception as e:
        print(f"[ResumeAnalyzer] AI Error: {e}")
        # Return a basic fallback response conformant to the model
        return {
            "score": 0,
            "role": role,
            "keyword_match": {"strengths": [], "improvements": ["Error during analysis"]},
            "impact": {"strengths": [], "improvements": []},
            "grammar": {"strengths": [], "improvements": []},
            "experience": {"strengths": [], "improvements": []},
            "ats": {"strengths": [], "improvements": []}
        }
