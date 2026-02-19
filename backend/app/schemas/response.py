from typing import List
from pydantic import BaseModel, Field


class LLMReview(BaseModel):
    risk_explanation: str = Field(..., example="This PR modifies critical authentication logic.")
    mitigation_steps: List[str] = Field(
        default_factory=list,
        example=["Add unit tests", "Request senior review"]
    )
    code_suggestions: List[str] = Field(
        default_factory=list,
        example=["Refactor validation logic", "Add input sanitization"]
    )


class AnalyzePRResponse(BaseModel):
    risk_label: str = Field(..., examples=["LOW", "MEDIUM", "HIGH"])
    risk_score: float = Field(..., ge=0.0, le=10.0)
    review_comments: LLMReview
