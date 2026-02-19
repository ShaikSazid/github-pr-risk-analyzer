# import httpx
# from backend.app.core.exceptions import MLServiceError


# async def predict_risk(normalized_data: dict) -> dict:
#     try:
#         return {
#             "risk_label": "HIGH",
#             "risk_score": 0.72,
#         }
#     except httpx.TimeoutException:
#         raise MLServiceError("ML service timeout")


# from backend.app.core.exceptions import MLServiceError
# from ml.apis.predict import prepare_features, predict_risk as ml_predict

# async def predict_risk(normalized_data: dict) -> dict:
#     try:
#         feautures = prepare_features(normalized_data)
#         result = ml_predict(feautures)
#         return result
#     except Exception as e:
#         raise MLServiceError(f"ML inference failed: {str(e)}")

from ml.apis.predict import prepare_features, predict_risk as ml_predict

async def predict_risk(normalized_data: dict) -> dict:
    features = prepare_features(normalized_data)
    return ml_predict(features)
