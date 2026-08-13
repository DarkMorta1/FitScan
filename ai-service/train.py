import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("dataset/food_dataset.csv")

# Convert BMI text (if present in future) and Risk labels into numbers
label_encoder = LabelEncoder()

df["Risk"] = label_encoder.fit_transform(df["Risk"])

# Features (X)
X = df.drop("Risk", axis=1)

# Convert any text columns into numbers
X = pd.get_dummies(X)

# Target (Y)
y = df["Risk"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train Logistic Regression
model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, predictions)

print("Model Accuracy:", round(accuracy * 100, 2), "%")

# Create model folder
os.makedirs("model", exist_ok=True)

# Save trained model
joblib.dump(model, "model/food_risk_model.pkl")

# Save encoder
joblib.dump(label_encoder, "model/label_encoder.pkl")

print("Model saved successfully!")