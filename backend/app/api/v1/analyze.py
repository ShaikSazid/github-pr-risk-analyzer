import logging

from fastapi import APIRouter
from schemas.request import AnalyzePRRequest
from schemas.response import AnalyzePRResponse
from services.github_service import (
    fetch_contributing,
    fetch_pr,
    fetch_pr_files,
    fetch_recent_commits,
)
from services.llm_service import generate_review
from services.ml_service import predict_risk
from utils.diff_utils import (
    build_diff_summary,
    extract_patch_text,
    limit_diff_text,
)
from utils.pr_parser import parse_pr_url

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze/pr", response_model=AnalyzePRResponse)
async def analyze_pr(request: AnalyzePRRequest):
    logger.info("request received")

    owner, repo, pr_number = parse_pr_url(str(request.pr_url))
    logger.info("parsed pr url", extra={"owner": owner, "repo": repo, "pr": pr_number})

    pr = await fetch_pr(owner, repo, pr_number)
    logger.info("fetched pr metadata")

    files = await fetch_pr_files(owner, repo, pr_number)
    logger.info("fetched pr files", extra={"file_count": len(files)})

    recent_commits = await fetch_recent_commits(owner, repo)
    logger.info("fetched recent commits", extra={"count": len(recent_commits)})

    contributing = await fetch_contributing(owner, repo)
    if contributing:
        logger.info("fetched contributing guidelines")
    else:
        logger.info("no contributing guidelines found")

    diff_summary = build_diff_summary(files)
    diff_text = extract_patch_text(files)
    diff_text = limit_diff_text(diff_text)

    logger.info("built diff summary", extra=diff_summary)

    ml_input = {
        **diff_summary,
        "title_length": len(pr.get("title", "")),
        "description_length": len(pr.get("body") or ""),
    }

    ml_result = await predict_risk(ml_input)
    logger.info("ml inference completed", extra=ml_result)

    llm_context = {
        "pr_summary": pr["title"],
        "diff_summary": diff_summary,
        "diff_text": diff_text,
        "recent_commits": recent_commits,
        "contributing_guidelines": contributing,
        **ml_result,
    }

    review = await generate_review(llm_context)
    logger.info("llm review generated")

    return AnalyzePRResponse(
        risk_label=ml_result["risk_label"],
        risk_score=ml_result["risk_score"],
        review_comments=review,
    )
