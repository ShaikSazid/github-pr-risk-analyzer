import httpx
from core.exceptions import LLMServiceError


async def generate_review(context: dict) -> str:
    try:
        # Stub implementation (replace with real LLM later)
        return "This PR introduces risky changes. Please review carefully ya."
    except httpx.TimeoutException:
        raise LLMServiceError("LLM service timeout")
