# backend/app/services/llm_service.py

import logging
from backend.app.core.exceptions import LLMServiceError
from ml.apis.llm import generate_review as ml_generate_review

logger = logging.getLogger(__name__)


async def generate_review(llm_context: dict) -> dict:
    """
    Orchestrates LLM call.

    llm_context expected:
    {
        "risk_score": float,
        "risk_label": str,
        "top_risk_factors": list[str],
        "title": str,
        "body": str,
        "file_names": list[str],
        "diff_summary": dict | str | None,
        "recent_commits": list[str],
        "contributing_guidelines": str | None
    }

    Returns:
    {
        "risk_explanation": str,
        "mitigation_steps": list[str],
        "code_suggestions": list[str]
    }
    """

    try:
        risk_output = {
            "risk_score": llm_context["risk_score"],
            "risk_label": llm_context["risk_label"],
            "top_risk_factors": llm_context.get("top_risk_factors", []),
        }

        pr_context = {
            "title": llm_context.get("title", ""),
            "body": llm_context.get("body", ""),
            "file_names": llm_context.get("file_names", []),
            "diff_summary": llm_context.get("diff_summary", {}),
            "commit_messages": llm_context.get("recent_commits", []),
            "contributing_md": llm_context.get("contributing_guidelines"),
        }

        logger.info("Calling LLM layer")

        result = ml_generate_review(risk_output, pr_context)

        logger.info("LLM response received")

        return result

    except Exception as e:
        logger.exception("LLM service failed")
        raise LLMServiceError(str(e))
