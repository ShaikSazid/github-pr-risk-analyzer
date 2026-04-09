import asyncio
from ml.apis.predict import prepare_features, predict_risk as ml_predict
from backend.app.core.exceptions import MLServiceError


async def predict_risk(normalized_data: dict) -> dict:
    try:
        features = prepare_features(normalized_data)
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, ml_predict, features)
    except Exception as e:
        print("Risk prediction failed: %s", e)
        raise MLServiceError("Risk prediction service is currently unavailable.") from e
