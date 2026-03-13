import io
import json
import pdfplumber
import google.generativeai as genai

from models.resume import ResumeExtractionResponse
from config import get_settings

settings = get_settings()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from a uploaded PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"[ResumeParser] Error reading PDF: {e}")
        raise ValueError("Invalid PDF format or unable to extract text.")
        
    return text.strip()


async def extract_resume_data(file_bytes: bytes) -> ResumeExtractionResponse:
    """
    Extracts structured data (skills, projects, experience, role) from a PDF 
    resume using the Gemini API.
    """
    # 1. Extract raw text from PDF
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise ValueError("No text could be extracted from the provided resume.")

    # 2. Configure Gemini API
    # Fallback to GROQ key if GEMINI key isn't explicitly set, just in case user re-used keys or it's empty
    api_key = settings.GEMINI_API_KEY or settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("AI API Key is not configured.")

    genai.configure(api_key=api_key)
    
    # Use the recommended model for general text tasks
    model = genai.GenerativeModel("gemini-1.5-pro")

    # 3. Define the prompt
    prompt = f"""
    You are an expert AI resume parser. I will provide you with the raw text extracted from a resume. 
    Your task is to extract the following information and return ONLY a valid JSON object. Do not include any markdown formatting (like ```json), just the raw JSON string.
    
    Extract these fields:
    - "skills": A list of strings representing the candidate's skills (e.g., programming languages, tools, soft skills).
    - "projects": A list of strings, each summarizing a distinct project mentioned.
    - "experience": A list of strings, each summarizing a distinct work experience or role.
    - "target_role": A single string inferring the candidate's target job role (e.g., "Software Engineer", "Data Scientist"). If unclear, make a best guess based on the skills and experience.
    
    Resume Text:
    {resume_text}
    """

    # 4. Call Gemini
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up any potential markdown formatting the AI might still add despite instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()

        # 5. Parse JSON
        parsed_data = json.loads(response_text)
        
        # 6. Validate and format output using Pydantic
        return ResumeExtractionResponse(**parsed_data)

    except json.JSONDecodeError as e:
        print(f"[ResumeParser] JSON Parse Error: {e}\nResponse was: {response_text}")
        raise ValueError("Failed to parse the AI response into valid JSON.")
    except Exception as e:
        print(f"[ResumeParser] Gemini API Error: {e}")
        raise ValueError(f"An error occurred while communicating with the AI: {str(e)}")
