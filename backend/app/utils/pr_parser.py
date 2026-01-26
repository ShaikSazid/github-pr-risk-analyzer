import re
from typing import Tuple

from core.exceptions import InvalidPullRequestURLError

PR_REGEX = re.compile(
    r"^https://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/]+)/pull/(?P<number>\d+)$"
)


def parse_pr_url(pr_url: str) -> Tuple[str, str, int]:
    match = PR_REGEX.match(pr_url.strip())
    if not match:
        raise InvalidPullRequestURLError("Invalid PR URL")

    return (match.group("owner"), match.group("repo"), int(match.group("number")))
