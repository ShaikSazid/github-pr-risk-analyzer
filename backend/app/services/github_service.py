import base64

import httpx
from core.config import settings
from core.exceptions import GitHubAPIError

BASE_URL = "https://api.github.com"


def _headers():
    if not settings.GITHUB_TOKEN:
        raise GitHubAPIError("GITHUB_TOKEN not set")

    return {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }


async def fetch_pr(owner: str, repo: str, pr_number: int):
    url = f"{BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers=_headers())

    if r.status_code != 200:
        raise GitHubAPIError(r.text)

    return r.json()


async def fetch_pr_files(owner: str, repo: str, pr_number: int):
    url = f"{BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}/files"

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers=_headers())

    if r.status_code != 200:
        raise GitHubAPIError(r.text)

    return r.json()


async def fetch_recent_commits(owner: str, repo: str, limit: int = 5) -> list[str]:
    url = f"{BASE_URL}/repos/{owner}/{repo}/commits"

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers=_headers())

    if r.status_code != 200:
        raise GitHubAPIError(r.text)

    commits = r.json()
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
            r = await client.get(url, headers=_headers())

            if r.status_code == 200:
                content = r.json().get("content")
                if content:
                    return base64.b64decode(content).decode("utf-8")

    return None
