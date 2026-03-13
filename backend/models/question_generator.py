from pydantic import BaseModel
from typing import List

class QuestionGeneratorResponse(BaseModel):
    role: str
    technical_questions: List[str]
    behavioral_questions: List[str]
