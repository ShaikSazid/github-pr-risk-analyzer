from typing import List, Optional
from pydantic import BaseModel, Field


class CodeSuggestion(BaseModel):
    type: str = Field(
        ...,
        description="Type of suggestion: 'text' or 'code'"
    )
    content: str = Field(
        ...,
        description="Suggestion content"
    )
    language: Optional[str] = Field(
        default=None,
        description="Programming language if suggestion is code"
    )


class LLMReview(BaseModel):
    risk_explanation: str = Field(
        ...,
        example="This PR modifies critical authentication logic."
    )
    mitigation_steps: List[str] = Field(
        default_factory=list,
        example=["Add unit tests", "Request senior review"]
    )
    code_suggestions: List[CodeSuggestion] = Field(
        default_factory=list
    )
    source: Optional[str] = None  # supports llm / fallback


class AnalyzePRResponse(BaseModel):
    risk_label: str = Field(..., examples=["LOW", "MEDIUM", "HIGH"])
    risk_score: float = Field(..., ge=0.0, le=10.0)
    review_comments: LLMReview