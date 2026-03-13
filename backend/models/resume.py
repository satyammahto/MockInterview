from pydantic import BaseModel
from typing import List

class StrengthImprovement(BaseModel):
    strengths: List[str]
    improvements: List[str]

class ResumeAnalysisResponse(BaseModel):
    score: int
    role: str
    keyword_match: StrengthImprovement
    impact: StrengthImprovement
    grammar: StrengthImprovement
    experience: StrengthImprovement
    ats: StrengthImprovement
