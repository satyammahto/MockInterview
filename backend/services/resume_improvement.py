"""
Resume Improvement Service — uses Groq LLM to analyze the candidate's existing resume
skills vs the actual skills demonstrated in the interview based on the generated feedback.

It suggests additions or refinements to the resume.
"""
import io
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from config import get_settings
from database.session import get_session_by_id

from groq import Groq
import os

logger = logging.getLogger(__name__)

def _get_client():
    settings = get_settings()
    return Groq(api_key=settings.GROQ_API_KEY)


def suggest_resume_improvements(db: Session, session_id: str, new_resume_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Reads the new uploaded resume text, fetches the interview performance (from DB report),
    and asks the LLM to suggest how the resume could be improved given the interview context.
    
    If the session_id is missing or DB lacks a report, it does a generic review.
    """
    # 1. Parse the text from the newly uploaded resume
    from services.resume_parser import _extract_text
    resume_text = _extract_text(new_resume_bytes, filename)
    if not resume_text:
        return {"error": "Could not extract text from the uploaded resume file.", "suggestions": []}
        
    # 2. Build interview context if available
    interview_context = "No interview context provided. Please provide a general critique."
    
    interview_session = get_session_by_id(db, session_id)
    if interview_session and interview_session.report:
        report = interview_session.report
        
        # Summarise feedback to feed back into the resume enhancer
        q_summaries = []
        for ans in interview_session.answers:
            if ans.score >= 7.0: # Good answer - add to strengths to highlight
                q_summaries.append(f"- Answered well on '{ans.question.question_text}'. Score: {ans.score}/10")
            elif ans.score < 5.0:
                q_summaries.append(f"- Struggled with '{ans.question.question_text}'. Score: {ans.score}/10")
                
        interview_context = (
            f"Overall Interview Score: {report.overall_score}/100.\n"
            f"Key strengths: {', '.join(report.strengths) if report.strengths else 'None identified'}.\n"
            f"Areas for improvement: {', '.join(report.improvements) if report.improvements else 'None identified'}.\n"
            f"Question performance summary:\n" + "\n".join(q_summaries)
        )

    # 3. Ask LLM to improve resume based on interview performance
    settings = get_settings()
    prompt = f"""You are an expert tech recruiter and resume writer.
I will provide you with a candidate's resume text, and the feedback from their recent technical mock interview.

Interview Feedback / Performance:
{interview_context}

---
Current Resume Text:
{resume_text[:4000]} # Truncated for token limit

Your task:
Suggest 3-5 absolute most impactful changes to THIS resume to make it stronger, explicitly leveraging the skills they demonstrated in their mock interview. 
For example, if the interview showed they are great at Redis caching but it's not on the resume, tell them to add it. If the resume lists Python but they failed basic Python questions in the interview, maybe advise adjusting the wording.

Return ONLY a raw JSON array of strings containing the distinct suggestions. No markdown code blocks, no explanation.
Example:
[
  "Add your experience with Redis caching to the Skills section, as you demonstrated strong knowledge of idempotency in the interview.",
  "Quantify the impact of your payment gateway project (e.g. 'Processed 10K+ transactions')."
]
"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800,
        )
        content = response.choices[0].message.content
        from services.question_gen import _extract_json_array
        suggestions = _extract_json_array(content)
        
        if not suggestions or not isinstance(suggestions, list):
            # Fallback parsing if LLM disobeys JSON rules
            lines = [ln.strip("- *").strip() for ln in content.split('\n') if ln.strip()]
            suggestions = [l for l in lines if len(l) > 10][:5]
            
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"[ResumeImprovement] LLM Error: {e}")
        return {"error": f"Failed to generate suggestions. Error: {str(e)}", "suggestions": []}
