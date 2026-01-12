from pydantic import BaseModel, Field, HttpUrl, field_validator
import re

GITHUB_PR_URL_PATTERN = re.compile(
    r"^https://github\.com/[\w.-]+/[\w.-]+/pull/\d+$"
)

class AnalyzePRRequest(BaseModel):
    pr_url: HttpUrl = Field(..., description = "Public GitHub Pull Request URL", examples = ["https://github.com/facebook/react/pull/35474"],)
    @field_validator("pr_url")
    @classmethod
    def validate_github_pr_url(cls, value: HttpUrl) -> HttpUrl:
        if not GITHUB_PR_URL_PATTERN.match(str(value)):
            raise ValueError(
                "Invalid GitHub Pull Request URL. "
                "Expected format: https://github.com/{owner}/{repo}/pull/{number}"
            )
        return value
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "pr_url": "https://github.com/facebook/react/pull/35474"
            }
        }
    }