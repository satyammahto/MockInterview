from fastapi import APIRouter, UploadFile, File, HTTPException, status
from models.resume import ResumeExtractionResponse
from services.resume_parser_service import extract_resume_data

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeExtractionResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF resume, extracts text using pdfplumber, 
    and returns a structured JSON response via the Gemini API.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF files are supported.",
        )
        
    try:
        # Read the uploaded file bytes
        file_bytes = await file.read()
        
        # Extract structured data
        extracted_data = await extract_resume_data(file_bytes)
        
        return extracted_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during processing: {str(e)}",
        )
