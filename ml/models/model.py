# TODO 
# Build Random Forest Classifier
# Train it on X_train and y_train
# Evaluate on X_test and y_test
# Get feature importance rankings

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# load the data
df = pd.read_csv(r"./data/processed_data.csv")

# test train split
X = df.drop("is_risky", axis=1)
y = df["is_risky"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
