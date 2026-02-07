import joblib
import pandas as pd
from pathlib import Path

from pandas.core.base import NoNewAttributesMixin

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "ml" / "models"

_model = None
_feature_columns = None

def _load_model(): 
  global _model, _feature_columns
  _model = joblib.load(MODEL_DIR, "rf_model.joblib")
  _feature_columns = joblib.load(MODEL_DIR, "feature_columns.joblib")

def prepare_features(pr_data: dict) -> dict:
  """
  Transform raw PR metadata (from Github API) into the 22 model features.
  pr_data is the expected raw from Github API
  """
  additions = pr_data.get("additions", 0)
  deletions = pr_data.get("deletions", 0)
  changed_files = pr_data.get("changed_files", 0)
  commits_count = pr_data.get("commits_count", 0)
  body = pr_data.get("body") or ""
  title = pr_data.get("title", "")
  labels = pr_data.get("labels") or "none"
  milestone = pr_data.get("milestone") or "none"
  file_extensions = pr_data.get("file_extensions") or "none"
  created_day_of_week = pr_data.get("created_day_of_week", 0)
  created_hour = pr_data.get("created_hour", 0)

  # author association encoding
  assoc_map = {
    "COLLABORATOR": 0, "CONTRIBUTOR": 1, "MEMBER": 2, "NONE": 3, "OWNER": 4
  }

  author_assoc_en = assoc_map.get(
    pr_data.get("author_association", "NONE"), 3
  )

  total_changes = additions + deletions

  features = {
    "is_draft": int(pr_data.get("is_draft", False)),
    "author_account_age_days": pr_data.get("author_account_age_days", 0),
    "additions": additions,
    "deletions": deletions,
    "changed_files": changed_files,
    "commits_count": commits_count,
    "body_len": len(body),
    "created_day_of_week": created_day_of_week,
    "created_hour": created_hour,
    "requested_reviewers_count": pr_data.get("requested_reviewers_count", 0),
    "total_changes": total_changes,
    "change_ratio": additions / (deletions + 1),
    "avg_changes_per_file": total_changes / (changed_files + 1),
    "commits_per_file": commits_count / (changed_files + 1),
    "title_length": len(title),
    "is_weekend": int(created_day_of_week >= 5),
    "is_business_hours": int(9 <= created_hour <= 17),
    "has_body": int(body != ""),
    "has_labels": int(labels != "none"),
    "has_milestone": int(milestone != "none"),
    "has_file_extensions": int(file_extensions != "none"),
    "author_association_encoded": author_assoc_encoded,
  }

  return features

def predict_risk(pr_features: dict) -> dict:
  """
  Takes features and predits risk
  """
  _load_model()

  df = pd.DataFrame([pr_features])[_feature_columns]

  prob = _model.predict_proba(df)[0][1]
  risk_score = round(prob * 10, 1)

  if risk_score <= 3:
    risk_lable = "LOW"
  elif risk_score <= 6:
    risk_lable = "MEDIUM"
  else:
    risk_lable = "HIGH"

  # top factors 
  importances = sorted(
    zip(_feature_columns, _model.feature_importances_),
    key = lambda x:x[1],
    reverse = True
  )

  top_factors = [ n for n, _ in importances[:5]] # because we need top 5

  return {
    "risk_score": risk_score, 
    "risk_label": risk_lable,
    "top_risk_factors": top_factors
  }