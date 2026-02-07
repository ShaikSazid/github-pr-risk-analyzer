# TODO 
# Build Random Forest Classifier
# Train it on X_train and y_train
# Evaluate on X_test and y_test
# Get feature importance rankings

from tkinter.constants import N
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

# load the data
df = pd.read_csv("../data/processed/processed_data.csv")

# test train split
X = df.drop("is_risky", axis=1)
y = df["is_risky"]

X_train, X_test, y_train, y_test = train_test_split(
  X, y, test_size=0.2, random_state=42, stratify=y
)

# train
model = RandomForestClassifier(
  n_estimators=200,
  random_state=42,
  class_weight="balanced",
  n_jobs=1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

threshold = 0.3
y_pred_adj = (y_prob > threshold).astype(int)

print(classification_report(y_test, y_pred_adj))
print(f"ROC AUC: , {roc_auc_score(y_test, y_prob):.4f}")

# feature importances
importances = sorted(
  zip(X.columns, model.feature_importances_),
  key=lambda x:x[1],
  reverse=True
)

print("Important features")
for feat, imp in importances:
  print(f"{feat}: {imp}")

joblib.dump(model, "rf_model.joblib")
joblib.dump(list(X.columns), "feature_columns.joblib")
print("Model and feature columns saved")