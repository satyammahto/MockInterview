"""
Question Generation Service using Groq Llama3.
Generates tailored interview questions based on skills and JD.
"""
from typing import List, Dict
from groq import Groq
from config import get_settings

settings = get_settings()

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def generate_questions(
    skills: List[str],
    job_description: str,
    difficulty: str = "medium",
    num_questions: int = 5,
) -> List[Dict[str, str]]:
    """
    Call Groq Llama3 to generate interview questions.
    Returns a list of {text, type} dicts.
    """
    skill_str = ", ".join(skills[:20]) if skills else "general software engineering"
    
    prompt = f"""You are an expert technical interviewer. Generate exactly {num_questions} interview questions for a candidate.

Candidate Skills: {skill_str}
Job Description: {job_description[:1500]}
Difficulty: {difficulty}

Rules:
- Mix question types: Technical (deep technical knowledge), Behavioral (STAR-format), and Deep Dive (system design or complex concepts)
- Tailor questions specifically to the candidate's skills and the job requirements
- Questions should be concise and clear (1-3 sentences max)
- {difficulty.capitalize()} difficulty level

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {{"text": "question here", "type": "Technical"}},
  {{"text": "question here", "type": "Behavioral"}},
  {{"text": "question here", "type": "Deep Dive"}}
]"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1500,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        import json
        questions = json.loads(content)
        
        # Validate structure
        validated = []
        for i, q in enumerate(questions[:num_questions]):
            validated.append({
                "text": str(q.get("text", "")),
                "type": str(q.get("type", "Technical")),
            })
        
        return validated

    except Exception as e:
        print(f"[QuestionGen] Error: {e}")
        # Fallback questions
        return _fallback_questions(num_questions, skills)


def generate_followup_question(
    original_question: str,
    candidate_answer: str,
    skills: List[str],
) -> str:
    """
    Generate a single follow-up question based on the candidate's answer.
    Returns the follow-up question text, or empty string if not needed.
    """
    if not candidate_answer or len(candidate_answer.strip()) < 20:
        return ""
    
    prompt = f"""You are a technical interviewer. The candidate just answered a question.

Original Question: {original_question}
Candidate's Answer: {candidate_answer[:800]}

Generate ONE concise follow-up question to dig deeper (max 2 sentences). 
If the answer is thorough enough, respond with SKIP.
Respond with ONLY the follow-up question or SKIP."""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150,
        )
        result = response.choices[0].message.content.strip()
        return "" if result == "SKIP" else result
    except Exception:
        return ""


def _fallback_questions(num: int, skills: List[str]) -> List[Dict[str, str]]:
    top_skill = skills[0] if skills else "software development"
    templates = [
        {"text": f"Can you walk me through a recent project where you used {top_skill}?", "type": "Technical"},
        {"text": "Tell me about a time you had to solve a complex technical problem under pressure.", "type": "Behavioral"},
        {"text": f"How would you design a scalable system using {top_skill}?", "type": "Deep Dive"},
        {"text": "Describe a situation where you disagreed with a team member. How did you handle it?", "type": "Behavioral"},
        {"text": f"What are the most important best practices when working with {top_skill}?", "type": "Technical"},
    ]
    return templates[:num]
