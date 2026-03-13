"""
Resume Parser Service using PyResparser.
Extracts candidate skills from uploaded PDF/DOCX resumes.
"""
import os
import tempfile
from pathlib import Path
from typing import List

# Lazy import to avoid slow startup
def extract_skills(file_bytes: bytes, filename: str) -> List[str]:
    """
    Save uploaded resume bytes to a temp file, run PyResparser,
    and return the extracted skills list.
    """
    suffix = Path(filename).suffix.lower()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        # PyResparser needs NLTK data; download if missing
        _ensure_nltk_data()
        
        from pyresparser import ResumeParser
        data = ResumeParser(tmp_path).get_extracted_data()
        
        skills: List[str] = data.get("skills") or []
        # Deduplicate and clean
        skills = list({s.strip() for s in skills if s and len(s.strip()) > 1})
        return skills

    except Exception as e:
        print(f"[ResumeParser] Warning: Could not parse resume — {e}")
        return []

    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


def _ensure_nltk_data():
    import nltk
    for package in ["stopwords", "punkt", "averaged_perceptron_tagger", "universal_tagset"]:
        try:
            nltk.data.find(f"tokenizers/{package}")
        except LookupError:
            try:
                nltk.download(package, quiet=True)
            except Exception:
                pass
