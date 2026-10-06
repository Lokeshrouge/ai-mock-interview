from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.text_extractor import extract_text
from app.services.resume_parser import (
    parse_resume_content,
    StructuredResumeAnalysis,
    heuristic_resume_parse,
)

router = APIRouter(prefix="/resume", tags=["Resume"])


class ParseTextRequest(BaseModel):
    resume_text: str


class TextExtractResponse(BaseModel):
    success: bool
    extracted_text: str
    file_type: str
    error: Optional[str] = None


class ExtractAndParseResponse(BaseModel):
    success: bool
    extracted_text: str
    parsed_data: StructuredResumeAnalysis
    error: Optional[str] = None


@router.post("/extract-text", response_model=TextExtractResponse)
async def extract_resume_text(
    file: UploadFile = File(...),
):
    """Extract raw text from PDF or DOCX file."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    filename = file.filename or ""
    file_ext = filename.split(".")[-1].lower() if "." in filename else "pdf"

    success, text, err = extract_text(content, file_ext)
    if not success:
        return TextExtractResponse(
            success=False,
            extracted_text="",
            file_type=file_ext,
            error=err,
        )

    return TextExtractResponse(
        success=True,
        extracted_text=text,
        file_type=file_ext,
        error=None,
    )


@router.post("/parse", response_model=StructuredResumeAnalysis)
async def parse_text(payload: ParseTextRequest):
    """Parse raw resume text into structured fields using LLM or rule engine."""
    return await parse_resume_content(payload.resume_text)


@router.post("/extract-and-parse", response_model=ExtractAndParseResponse)
async def extract_and_parse(
    file: UploadFile = File(...),
):
    """Extract text from uploaded resume and run structured analysis."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    filename = file.filename or ""
    file_ext = filename.split(".")[-1].lower() if "." in filename else "pdf"

    success, text, err = extract_text(content, file_ext)
    if not success:
        return ExtractAndParseResponse(
            success=False,
            extracted_text="",
            parsed_data=StructuredResumeAnalysis(),
            error=err,
        )

    analysis = await parse_resume_content(text)
    return ExtractAndParseResponse(
        success=True,
        extracted_text=text,
        parsed_data=analysis,
        error=None,
    )
