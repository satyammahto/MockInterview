from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database.session import get_db
from database.session import get_session_by_id

router = APIRouter(prefix="/improve-resume", tags=["Resume Improvement"])

@router.post("")
async def improve_resume(
    resume: UploadFile = File(...),
    session_id: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a new resume. Analyzes the existing interview performance from `session_id` 
    and offers concrete suggestions for how to improve the resume.
    """
    if not resume.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX formats are supported.")

    file_bytes = await resume.read()

    # Pass everything to the new local service
    from services.resume_improvement import suggest_resume_improvements
    
    # We allow running this without a session ID just for generic resume feedback
    # but the AI is explicitly prompted to find correlative strengths if session is provided.
    result = suggest_resume_improvements(
        db=db,
        session_id=session_id,
        new_resume_bytes=file_bytes,
        filename=resume.filename
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
