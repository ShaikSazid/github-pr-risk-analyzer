from pydantic import BaseModel, Field
from typing import Optional

class AnalyzePRResponse(BaseModel):
    risk_label: str = Field(..., description = "Risk category predicted by the ML model", examples = ["LOW", "MEDIUM", "HIGH"],)
    risk_score: float = Field(..., ge = 0.0, le = 1.0, description = "Risk probability score from the ML model (0.0 to 1.0)", examples = 0.72)
    review_comment: Optional[str] = Field(
        None,
        description = "AI-generated review suggestions from the LLM",
        examples = (
            "This PR modifies core hydration logic, which is a sensitive area. "
            "Ensure regression tests cover edge cases."
        ),
    )