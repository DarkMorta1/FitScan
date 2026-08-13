import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, classification_report, f1_score,
                             precision_score, recall_score)
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import FunctionTransformer, Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from training.exercise_transformers import split_equipment

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "dataset" / "exercise_training_dataset.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "exercise_recommendation_model.pkl"
METADATA_PATH = MODEL_DIR / "exercise_model_metadata.json"

FEATURE_COLUMNS = [
    "age",
    "gender",
    "height",
    "weight",
    "bmi",
    "goal",
    "activity_level",
    "fitness_level",
    "workout_days",
    "workout_duration_minutes",
    "equipment",
    "preferred_workout_type",
]
TARGET_COLUMNS = [
    "target_muscle",
    "exercise_category",
    "exercise_difficulty",
]

CATEGORICAL_FEATURES = [
    "gender",
    "goal",
    "activity_level",
    "fitness_level",
    "preferred_workout_type",
]
NUMERIC_FEATURES = ["age", "height", "weight", "bmi", "workout_days", "workout_duration_minutes"]
RANDOM_STATE = 42


def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    expected_cols = set(FEATURE_COLUMNS + TARGET_COLUMNS)
    missing_cols = expected_cols - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing columns in dataset: {missing_cols}")
    return df


def prepare_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, list[str]]:
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMNS].copy()
    X["equipment"] = X["equipment"].fillna("")
    X["equipment"] = X["equipment"].astype(str)
    unique_equipment = sorted({
        item
        for row in X["equipment"]
        for item in str(row).split(";")
        if item.strip()
    })
    return X, y, unique_equipment


def build_pipeline(unique_equipment: list[str]) -> ColumnTransformer:
    equipment_transformer = FunctionTransformer(
        split_equipment,
        validate=False,
        kw_args={"unique_equipment": unique_equipment},
    )

    base_transformer = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
            ("equip", equipment_transformer, ["equipment"]),
        ],
        remainder="drop",
    )
    return base_transformer


def build_model(transformer: ColumnTransformer) -> Pipeline:
    classifier = MultiOutputClassifier(
        LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
        n_jobs=-1,
    )
    return Pipeline([("transformer", transformer), ("classifier", classifier)])


def evaluate_metrics(y_true: pd.DataFrame, y_pred: np.ndarray) -> dict[str, Any]:
    metrics = {}
    for idx, target in enumerate(TARGET_COLUMNS):
        actual = y_true[target]
        predicted = y_pred[:, idx]
        metrics[target] = {
            "accuracy": float(accuracy_score(actual, predicted)),
            "precision": float(precision_score(actual, predicted, average="weighted", zero_division=0)),
            "recall": float(recall_score(actual, predicted, average="weighted", zero_division=0)),
            "f1": float(f1_score(actual, predicted, average="weighted", zero_division=0)),
            "classification_report": classification_report(actual, predicted, zero_division=0, output_dict=True),
            "classes": sorted(actual.unique().tolist()),
        }
    return metrics


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    df = load_data(DATA_PATH)
    missing_values = df.isna().sum().to_dict()
    X, y, unique_equipment = prepare_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y["exercise_category"],
    )

    transformer = build_pipeline(unique_equipment)
    pipeline = build_model(transformer)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = evaluate_metrics(y_test, y_pred)

    print("====================================")
    print("EXERCISE RECOMMENDATION MODEL TRAINING")
    print("====================================")
    print(f"Dataset shape: {df.shape}")
    print(f"Training samples: {X_train.shape[0]}")
    print(f"Testing samples: {X_test.shape[0]}")
    print(f"Missing values: {missing_values}")
    print(f"Target classes: {{}}".format({target: len(metrics[target]["classes"]) for target in TARGET_COLUMNS}))
    print()

    for target in TARGET_COLUMNS:
        print(f"--- {target} ---")
        print(f"Classes: {len(metrics[target]['classes'])}")
        print(f"Accuracy: {metrics[target]['accuracy']:.4f}")
        print(f"Precision: {metrics[target]['precision']:.4f}")
        print(f"Recall: {metrics[target]['recall']:.4f}")
        print(f"F1: {metrics[target]['f1']:.4f}")
        print()
        print("Classification report:")
        target_report = metrics[target]["classification_report"]
        print(json.dumps(target_report, indent=2))
        print()

    model_info = {
        "model_type": "MultiOutputClassifier(LogisticRegression)",
        "feature_columns": FEATURE_COLUMNS,
        "target_columns": TARGET_COLUMNS,
        "classes": {target: metrics[target]["classes"] for target in TARGET_COLUMNS},
        "dataset_size": int(df.shape[0]),
        "train_size": int(X_train.shape[0]),
        "test_size": int(X_test.shape[0]),
        "missing_values": missing_values,
        "evaluation_metrics": {
            target: {
                "accuracy": metrics[target]["accuracy"],
                "precision": metrics[target]["precision"],
                "recall": metrics[target]["recall"],
                "f1": metrics[target]["f1"],
            }
            for target in TARGET_COLUMNS
        },
        "unique_equipment": unique_equipment,
    }

    joblib.dump(pipeline, MODEL_PATH)

    metadata = {
        "model_type": model_info["model_type"],
        "feature_columns": model_info["feature_columns"],
        "target_columns": model_info["target_columns"],
        "classes": model_info["classes"],
        "training_date": datetime.now(timezone.utc).isoformat(),
        "dataset_size": model_info["dataset_size"],
        "train_size": model_info["train_size"],
        "test_size": model_info["test_size"],
        "missing_values": model_info["missing_values"],
        "evaluation_metrics": model_info["evaluation_metrics"],
        "model_path": str(MODEL_PATH),
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to: {MODEL_PATH}")
    print(f"Metadata saved to: {METADATA_PATH}")


if __name__ == "__main__":
    main()
