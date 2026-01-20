import re
from pydantic import BaseModel, HttpUrl, Field, field_validator

class AnalyzePRRequest(BaseModel):
    pr_url: HttpUrl = Field(
        ...,
        description = "GitHub Pull Request URL",
        examples = ["https://github.com/facebook/react/pull/35474"]
    )

    @field_validator("pr_url")
    @classmethod
    def validate_pr_url(cls, value: HttpUrl) -> HttpUrl:
        pattern = r"^https://github\.com/[^/]+/[^/]+/pull/\d+$"
        if not re.match(pattern, str(value)):
            raise ValueError("Invalid GitHub PR URL format")
        return value