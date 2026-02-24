import logging
from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter

from backend.app.core.exceptions import MLServiceError
from backend.app.schemas.request import AnalyzePRRequest
from backend.app.schemas.response import AnalyzePRResponse

from backend.app.services.github_service import (
    fetch_pr,
    fetch_pr_files,
)

from backend.app.services.ml_service import predict_risk
from backend.app.services.llm_service import generate_review
from backend.app.services.diff_selector import build_selected_patch

from backend.app.utils.pr_parser import parse_pr_url


router = APIRouter()
logger = logging.getLogger(__name__)

# Helper: Safe datetime parsing

def parse_github_datetime(dt_str: str | None) -> datetime | None:
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None

# Build ML Input

def build_ml_input(pr: Dict, files: List[Dict]) -> Dict:
    """
    Prepare raw metadata for ML layer.
    Must match ml/apis/predict.py contract.
    """

    pr_created = parse_github_datetime(pr.get("created_at"))

    # -------- Author Account Age --------
    user_created = parse_github_datetime(
        pr.get("user", {}).get("created_at")
    )

    if pr_created and user_created:
        author_account_age_days = (pr_created - user_created).days
    else:
        author_account_age_days = 0

    # -------- Labels --------
    labels_list = pr.get("labels") or []
    labels = ", ".join(label.get("name", "") for label in labels_list) if labels_list else "none"

    # -------- Milestone --------
    milestone = pr.get("milestone", {})
    milestone_title = milestone.get("title") if milestone else "none"
    milestone_title = milestone_title or "none"

    # -------- File Extensions --------
    extensions = {
        f.get("filename", "").rsplit(".", 1)[-1]
        for f in files
        if "." in f.get("filename", "")
    }
    file_extensions = ", ".join(extensions) if extensions else "none"

    # -------- Requested Reviewers --------
    requested_reviewers = pr.get("requested_reviewers") or []
    reviewers_count = len(requested_reviewers)

    return {
        "is_draft": pr.get("draft", False),
        "author_account_age_days": author_account_age_days,
        "additions": pr.get("additions", 0),
        "deletions": pr.get("deletions", 0),
        "changed_files": pr.get("changed_files", 0),
        "commits_count": pr.get("commits", 0),
        "body": pr.get("body"),
        "title": pr.get("title", ""),
        "labels": labels,
        "milestone": milestone_title,
        "file_extensions": file_extensions,
        "created_day_of_week": pr_created.weekday() if pr_created else 0,
        "created_hour": pr_created.hour if pr_created else 0,
        "requested_reviewers_count": reviewers_count,
        "author_association": pr.get("author_association", "NONE"),
    }


@router.post("/analyze/pr", response_model=AnalyzePRResponse)
async def analyze_pr(request: AnalyzePRRequest):

    logger.info("Analyze PR request received")

    owner, repo, pr_number = parse_pr_url(str(request.pr_url))

    pr = await fetch_pr(owner, repo, pr_number)
    files = await fetch_pr_files(owner, repo, pr_number)

    ml_input = build_ml_input(pr, files)
    logger.info(f"ML INPUT KEYS: {list(ml_input.keys())}")

    try:
        ml_result = await predict_risk(ml_input)
        logger.info(f"ML OUTPUT: {ml_result}")
    except Exception as e:
        logger.error(f"ML prediction failed: {e}")
        raise MLServiceError("ML prediction failed.")

    selected_patch = build_selected_patch(
        files_data=files,
        risk_score=ml_result["risk_score"],
    )

    llm_context = {
        "risk_label": ml_result["risk_label"],
        "risk_score": ml_result["risk_score"],
        "top_risk_factors": ml_result.get("top_risk_factors", []),

        "title": pr.get("title", ""),
        "body": pr.get("body", ""),
        "file_names": [f.get("filename") for f in files],
        "diff_summary": selected_patch,
    }

    review = await generate_review(llm_context)

    logger.info(f"LLM OUTPUT: {review}")

    # ---------------- Final Response ----------------
    return {
    "risk_label": ml_result["risk_label"],
    "risk_score": ml_result["risk_score"],
    "review_comments": review,
    "pr_url": str(request.pr_url),
    "ai_unavailable": review.get("source") == "fallback"
}