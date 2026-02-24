# backend/app/services/llm_service.py

import logging
from backend.app.core.exceptions import LLMServiceError
from ml.apis.llm import generate_review as ml_generate_review

logger = logging.getLogger(__name__)


async def generate_review(llm_context: dict) -> dict:
    """
    Thin wrapper over ml layer.
    Expects already-prepared context dict.
    """

    try:
        logger.info("Calling LLM layer")

        # IMPORTANT: now passing SINGLE context argument
        result = await ml_generate_review(llm_context)

        logger.info("LLM response received")
        return result

    except Exception as e:
        logger.exception("LLM service failed")
        raise LLMServiceError(str(e))