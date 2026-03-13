from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.question_generator import generate_interview_questions
from models.question_generator import QuestionGeneratorResponse

router = APIRouter(prefix="/question-generator", tags=["AI Question Generator"])

@router.post("/generate-questions", response_model=QuestionGeneratorResponse)
async def api_generate_questions(
    resume: UploadFile = File(...),
    role: str = Form(...)
):
    """
    Generate tailored interview questions based on resume and role.
    """
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
    
    try:
        content = await resume.read()
        questions = generate_interview_questions(content, resume.filename, role)
        return questions
    except Exception as e:
        print(f"[QuestionGeneratorRouter] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
