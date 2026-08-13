from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
from pathlib import Path

from prediction.exercise_predictor import (
    ValidationError,
    predict_exercise_recommendations,
)

app = FastAPI(title="FitScan AI API")

# Project root
BASE_DIR = Path(__file__).resolve().parent

# Load trained model
model = joblib.load(BASE_DIR / "models" / "food_risk_model.pkl")
label_encoder = joblib.load(BASE_DIR / "models" / "label_encoder.pkl")


class PredictionRequest(BaseModel):
    Age: int
    BMI: float
    Goal: str
    Activity_Level: str
    Diabetes: int
    Hypertension: int
    High_Cholesterol: int

    Calories: float
    Protein: float
    Fat: float
    Carbs: float
    Sugar: float
    Fiber: float
    Sodium: float
    Cholesterol: float


class ExerciseRecommendationRequest(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    bmi: float
    goal: str
    activity_level: str
    fitness_level: str
    workout_days: int
    workout_duration_minutes: int
    equipment: list[str]
    preferred_workout_type: str


@app.get("/")
def home():
    return {
        "status": "ok",
        "service": "FitScan AI",
        "exerciseModel": "loaded",
        "foodModel": "loaded",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "FitScan AI",
        "foodModel": "loaded",
        "exerciseModel": "loaded",
    }


@app.post("/predict")
def predict(data: PredictionRequest):

    df = pd.DataFrame([data.model_dump()])

    prediction = model.predict(df)[0]

    prediction_label = label_encoder.inverse_transform([prediction])[0]

    probabilities = model.predict_proba(df)[0]

    confidence = round(max(probabilities) * 100, 2)

    return {
        "prediction": prediction_label,
        "confidence": confidence,
    }


@app.post("/recommend-exercises")
@app.post("/exercise-recommendations")
def exercise_recommendations(data: ExerciseRecommendationRequest):
    try:
        result = predict_exercise_recommendations(data.model_dump())
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result