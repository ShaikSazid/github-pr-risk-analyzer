from pydantic import BaseModel, Field

class AnalyzePRResponse(BaseModel):
    risk_label: str = Field(..., examples = ["LOW", "MEDIUM", "HIGH"])
    risk_score: float = Field(..., ge = 0.0, le = 1.0)
    review_comments: str