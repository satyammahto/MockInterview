from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Any
from services.resume_analyzer import analyze_resume
from models.resume import ResumeAnalysisResponse

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def api_analyze_resume(
    resume: UploadFile = File(...),
    role: str = Form(...),
    job_description: str = Form(...)
):
    """
    Upload a resume PDF and get an AI-powered analysis against a role/JD.
    """
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await resume.read()
        analysis = analyze_resume(content, resume.filename, role, job_description)
        return analysis
    except Exception as e:
        print(f"[ResumeRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
