from pydantic import BaseModel, Field
from typing import List


class ResumeExtractionResponse(BaseModel):
    skills: List[str] = Field(default_factory=list, description="List of technical and soft skills extracted from the resume.")
    projects: List[str] = Field(default_factory=list, description="List of projects mentioned in the resume.")
    experience: List[str] = Field(default_factory=list, description="List of work experiences or professional roles.")
    target_role: str = Field(default="", description="The inferred target job role based on the resume content.")
