import httpx
from core.exceptions import MLServiceError


async def predict_risk(normalized_data: dict) -> dict:
    try:
        return {
            "risk_label": "HIGH",
            "risk_score": 0.72,
        }
    except httpx.TimeoutException:
        raise MLServiceError("ML service timeout")
