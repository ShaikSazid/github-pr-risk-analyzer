from pydantic import BaseModel
from typing import List

class GitHubFileChange(BaseModel):
    fileName: str
    additions: int
    deletions: int
    patch: str | None

class GitHubPRData(BaseModel):
    title: str
    body: str | None
    files_changed: int
    additions: int
    deletions: int
    files: List[GitHubFileChange]