import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent

# Load training dataset
df = pd.read_csv(BASE_DIR / "dataset" / "training_dataset.csv")

# Features
X = df.drop("Risk", axis=1)

# Target
y = df["Risk"]

# Encode target labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Separate categorical and numerical columns
categorical_cols = ["Goal", "Activity_Level"]
numerical_cols = [col for col in X.columns if col not in categorical_cols]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols),
    ]
)

# Model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

# Pipeline
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", model)
])

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train
pipeline.fit(X_train, y_train)

# Predict
predictions = pipeline.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, predictions)

print("=" * 50)
print("Accuracy:", round(accuracy * 100, 2), "%")
print("=" * 50)

print(classification_report(
    y_test,
    predictions,
    target_names=label_encoder.classes_
))

# Save Model
models_dir = BASE_DIR / "models"
models_dir.mkdir(exist_ok=True)

joblib.dump(pipeline, models_dir / "food_risk_model.pkl")
joblib.dump(label_encoder, models_dir / "label_encoder.pkl")

print("Model saved successfully!")