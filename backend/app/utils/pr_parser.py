import re
from typing import Tuple

from backend.app.core.exceptions import InvalidPullRequestURLError

PR_REGEX = re.compile(
    r"^https://github\.com/"
    r"(?P<owner>[A-Za-z0-9](?:-?[A-Za-z0-9])*)/"
    r"(?P<repo>[A-Za-z0-9._-]+)/"
    r"pull/(?P<number>\d+)$"
)


def parse_pr_url(pr_url: str) -> Tuple[str, str, int]:
    match = PR_REGEX.match(pr_url.strip())
    if not match:
        raise InvalidPullRequestURLError("Invalid PR URL")

    return (match.group("owner"), match.group("repo"), int(match.group("number")))
