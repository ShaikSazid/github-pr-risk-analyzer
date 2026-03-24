import logging
from ml.apis.llm import generate_review as ml_generate_review

logger = logging.getLogger(__name__)


async def generate_review(llm_context: dict) -> dict:
    try:
        logger.info("Calling LLM layer")

        result = await ml_generate_review(llm_context)

        # If fallback came from ML layer, just return it
        if result.get("source") == "fallback":
            logger.warning("LLM returned fallback response.")
            return result

        return result

    except Exception as e:
        logger.error(f"LLM failure: {e}")

        # If quota exceeded, degrade gracefully
        if "quota" in str(e).lower() or "429" in str(e):
            logger.warning("LLM quota exceeded. Returning fallback.")
        else:
            logger.warning("LLM unexpected failure. Returning fallback.")

        # Always return graceful fallback instead of raising error
        return {
            "risk_explanation": (
                "AI review is temporarily unavailable. "
                "Risk assessment is still provided, but detailed code analysis "
                "could not be generated at this time."
            ),
            "mitigation_steps": [
                "Please review the pull request manually.",
                "Try again later if AI analysis is required."
            ],
            "file_reviews": [],
            "source": "fallback"
        }