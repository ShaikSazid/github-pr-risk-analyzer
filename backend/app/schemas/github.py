from pydantic import BaseModel, Field
from typing import List, Optional

class GitHubPRData(BaseModel):
    title: str = Field(
        ..., description = "Title of the pull request",
        examples = "Fix hydration bug in custom elements"
    )
    description: Optional[str] = Field(
        None,
        description = "Body/description of the pull request",
        examples = "This PR fixes event listener attachment during SSR hydration.",
    )
    files_changed: int = Field(
        ...,
        ge = 0,
        description = "Total number of files modified in the PR",
        examples = 5
    )
    lines_added: int = Field(
        ...,
        ge = 0,
        description = "Total number of lines added across all files",
        examples = 40
    )
    lines_deleted: int = Field(
        ...,
        ge = 0,
        description = "Total number of lines deleted across all files",
        examples = 34
    )
    file_names: List[str] = Field(
        ...,
        description = "List of file paths modified in the PR",
        examples = [
            "packages/react-dom/src/client/ReactDOMComponent.js",
            "packages/react-dom/src/shared/DOMPropertyOperations.js",
        ],
    )
    file_extensions: List[str] = Field(
        ...,
        description = "Unique list of file extensions modified in the PR",
        examples = ["js"],
    )
    diff_summary: str = Field(
        ...,
        description = (
            "Summarized textual representation of the PR diff, "
            "used for LLM context (not full raw diff)"
        ),
        examples = (
            "Custom element hydration logic updated. "
            "Event listeners are now re-applied during SSR hydration."
        ),
    )
