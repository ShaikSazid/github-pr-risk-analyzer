from ml.apis.predict import prepare_features, predict_risk as ml_predict
from backend.app.core.exceptions import MLServiceError

async def predict_risk(normalized_data: dict) -> dict:
    try:
        features = prepare_features(normalized_data)
        return ml_predict(features)
    except Exception:
        raise MLServiceError(
            "Risk prediction service is currently unavailable."
        )