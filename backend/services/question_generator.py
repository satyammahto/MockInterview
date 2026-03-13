import json
import google.generativeai as genai
from typing import Dict, Any, List
from config import get_settings
from services.resume_analyzer import extract_raw_text
from services.resume_parser import extract_skills

settings = get_settings()

def generate_interview_questions(file_bytes: bytes, filename: str, role: str) -> Dict[str, Any]:
    """
    Generate tailored interview questions using Gemini AI.
    """
    # Initialize Gemini
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    # Extract resume context
    resume_text = extract_raw_text(file_bytes, filename)
    skills = extract_skills(file_bytes, filename)
    
    prompt = f"""
    You are an expert technical interviewer. Analyze the following resume for the role of '{role}'.
    
    Role: {role}
    Resume Text: {resume_text[:4000]}
    Extracted Skills: {", ".join(skills)}
    
    Based on the resume and the target role, generate exactly:
    - 5 Technical Interview Questions (focused on projects, technical skills, and role-specific knowledge)
    - 5 Behavioral Interview Questions (STAR-format, focused on experience and soft skills)
    
    Respond ONLY with a valid JSON in the following format:
    {{
      "role": "{role}",
      "technical_questions": [
        "question 1",
        "question 2",
        "question 3",
        "question 4",
        "question 5"
      ],
      "behavioral_questions": [
        "question 1",
        "question 2",
        "question 3",
        "question 4",
        "question 5"
      ]
    }}
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        data = json.loads(content)
        
        # Validate and trim
        return {
            "role": role,
            "technical_questions": data.get("technical_questions", [])[:5],
            "behavioral_questions": data.get("behavioral_questions", [])[:5]
        }

    except Exception as e:
        print(f"[QuestionGenerator] AI Error: {e}")
        return {
            "role": role,
            "technical_questions": ["Error generating technical questions."],
            "behavioral_questions": ["Error generating behavioral questions."]
        }
