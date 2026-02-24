from typing import List, Optional
from pydantic import BaseModel, Field


class Issue(BaseModel):
    description: str
    code_example: Optional[str] = None
    language: Optional[str] = None


class FileReview(BaseModel):
    file: str
    issues: List[Issue]


class LLMReview(BaseModel):
    risk_explanation: str
    mitigation_steps: List[str]
    file_reviews: List[FileReview]
    source: Optional[str] = None


class AnalyzePRResponse(BaseModel):
    risk_label: str = Field(..., examples=["LOW", "MEDIUM", "HIGH"])
    risk_score: float = Field(..., ge=0.0, le=10.0)
    review_comments: LLMReview
    ai_unavailable: bool = False