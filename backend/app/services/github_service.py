import base64
import httpx
from backend.app.core.config import settings
from backend.app.core.exceptions import GitHubAPIError

BASE_URL = "https://api.github.com"


def _headers():
    if not settings.GITHUB_TOKEN:
        raise GitHubAPIError("GITHUB_TOKEN not set")

    return {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }


async def _get(url: str):
    """Reusable GET helper with clean error mapping"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=_headers())

    # SUCCESS
    if response.status_code == 200:
        return response.json()

    # NOT FOUND
    if response.status_code == 404:
        raise GitHubAPIError("Pull request not found.")

    # FORBIDDEN
    if response.status_code == 403:
        if "rate limit" in response.text.lower():
            raise GitHubAPIError(
                "GitHub rate limit reached. Please try again later."
            )
        raise GitHubAPIError(
            "This repository is private or not accessible."
        )

    # OTHER ERRORS
    raise GitHubAPIError(
        "Unable to fetch data from GitHub. Please try again."
    )


async def fetch_pr(owner: str, repo: str, pr_number: int) -> dict:
    url = f"{BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}"
    return await _get(url)


async def fetch_pr_files(owner: str, repo: str, pr_number: int) -> list[dict]:
    url = f"{BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}/files"
    return await _get(url)


async def fetch_recent_commits(
    owner: str, repo: str, limit: int = 5
) -> list[str]:
    url = f"{BASE_URL}/repos/{owner}/{repo}/commits"

    commits = await _get(url)
    messages = []

    for commit in commits[:limit]:
        msg = commit.get("commit", {}).get("message")
        if msg:
            messages.append(msg)

    return messages


async def fetch_contributing(owner: str, repo: str) -> str | None:
    paths = [
        "CONTRIBUTING.md",
        ".github/CONTRIBUTING.md",
    ]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for path in paths:
            url = f"{BASE_URL}/repos/{owner}/{repo}/contents/{path}"
            response = await client.get(url, headers=_headers())

            if response.status_code == 200:
                content = response.json().get("content")
                if content:
                    return base64.b64decode(content).decode("utf-8")

    return None
