import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "exercise_recommendation_model.pkl"
METADATA_PATH = BASE_DIR / "model" / "exercise_model_metadata.json"
EXERCISES_PATH = BASE_DIR.parent / "backend" / "src" / "data" / "exercises.js"

MODEL_METADATA = json.loads(METADATA_PATH.read_text())
FEATURE_COLUMNS = MODEL_METADATA["feature_columns"]
TARGET_COLUMNS = MODEL_METADATA["target_columns"]

MODEL = joblib.load(MODEL_PATH)


def load_exercise_catalog() -> list[dict[str, Any]]:
    import subprocess

    result = subprocess.run(
        [
            "node",
            "-e",
            f"const ex=require({json.dumps(str(EXERCISES_PATH))}); console.log(JSON.stringify(ex));",
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "Failed to load exercise catalog from backend/src/data/exercises.js:\n"
            + result.stderr
        )
    return json.loads(result.stdout)


EXERCISE_CATALOG = load_exercise_catalog()


class ValidationError(ValueError):
    pass


def validate_profile(profile: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "age": profile.get("age"),
        "gender": profile.get("gender"),
        "height": profile.get("height"),
        "weight": profile.get("weight"),
        "bmi": profile.get("bmi"),
        "goal": profile.get("goal"),
        "activity_level": profile.get("activity_level") or profile.get("activityLevel"),
        "fitness_level": profile.get("fitness_level") or profile.get("fitnessLevel"),
        "workout_days": profile.get("workout_days") or profile.get("workoutDays"),
        "workout_duration_minutes": profile.get("workout_duration_minutes") or profile.get("workoutDurationMinutes"),
        "equipment": profile.get("equipment"),
        "preferred_workout_type": profile.get("preferred_workout_type") or profile.get("preferredWorkoutType"),
    }

    missing_fields = [field for field in FEATURE_COLUMNS if normalized.get(field) is None]
    if missing_fields:
        raise ValidationError(f"Missing profile fields: {missing_fields}")

    validated = {}
    validated["age"] = int(normalized["age"])
    validated["gender"] = str(normalized["gender"])
    validated["height"] = float(normalized["height"])
    validated["weight"] = float(normalized["weight"])
    validated["bmi"] = float(normalized["bmi"])
    validated["goal"] = str(normalized["goal"])
    validated["activity_level"] = str(normalized["activity_level"])
    validated["fitness_level"] = str(normalized["fitness_level"])
    validated["workout_days"] = int(normalized["workout_days"])
    validated["workout_duration_minutes"] = int(normalized["workout_duration_minutes"])
    validated["preferred_workout_type"] = str(normalized["preferred_workout_type"])

    equipment = profile.get("equipment")
    if equipment is None:
        validated["equipment"] = []
    elif isinstance(equipment, list):
        validated["equipment"] = [str(item) for item in equipment if str(item).strip()]
    elif isinstance(equipment, str):
        validated["equipment"] = [item.strip() for item in equipment.split(",") if item.strip()]
    else:
        raise ValidationError("Equipment must be a list or comma-separated string.")

    validated["equipment"] = sorted(set(validated["equipment"]))
    return validated


def normalize_equipment(equipment: list[str]) -> str:
    return ";".join(sorted(equipment))


def score_exercise(exercise: dict[str, Any], profile: dict[str, Any], predicted: dict[str, str]) -> float:
    score = 0.0
    if exercise.get("muscleGroup") == predicted["target_muscle"]:
        score += 2.0
    if exercise.get("category") == predicted["exercise_category"]:
        score += 1.5
    if exercise.get("difficulty") == predicted["exercise_difficulty"]:
        score += 1.0
    if profile["goal"] in exercise.get("goals", []):
        score += 1.5
    if exercise.get("difficulty") == profile["fitness_level"]:
        score += 1.0
    if profile["preferred_workout_type"] == "Bodyweight" and not exercise.get("equipment"):
        score += 1.5
    if profile["preferred_workout_type"] == "Strength" and exercise.get("category") in {"Strength", "Accessory"}:
        score += 0.75
    if profile["preferred_workout_type"] == "Cardio" and exercise.get("category") in {"Cardio", "Bodyweight"}:
        score += 0.75
    duration = exercise.get("durationMinutes") or 0
    if duration <= profile["workout_duration_minutes"]:
        score += 0.5
    return score


def equipment_allowed(exercise: dict[str, Any], available_equipment: list[str], preferred_workout_type: str) -> bool:
    required_equipment = exercise.get("equipment") or []
    if preferred_workout_type == "Bodyweight" and required_equipment:
        return False
    if required_equipment and not set(required_equipment).issubset(set(available_equipment)):
        return False
    return True


def rule_based_allowed(exercise: dict[str, Any], profile: dict[str, Any]) -> bool:
    if profile["fitness_level"] == "Beginner" and exercise.get("difficulty") in ["Intermediate", "Advanced"]:
        return False
    if profile["fitness_level"] == "Intermediate" and exercise.get("difficulty") == "Advanced":
        return False
    if exercise.get("goals") and profile["goal"] not in exercise.get("goals", []):
        return False
    if not equipment_allowed(exercise, profile["equipment"], profile["preferred_workout_type"]):
        return False

    if profile["preferred_workout_type"] == "Strength" and exercise.get("category") == "Cardio":
        return False
    if profile["preferred_workout_type"] == "Cardio" and exercise.get("category") not in {"Cardio", "Bodyweight", "Accessory"}:
        return False
    return True


def _get_model_confidence(probabilities: Any) -> float:
    if isinstance(probabilities, list):
        confidences: list[float] = []
        for probability in probabilities:
            if probability is None or probability.size == 0:
                continue
            confidences.append(float(np.max(probability[0])))
        if confidences:
            return min(max(float(np.mean(confidences)), 0.0), 1.0)
    elif hasattr(probabilities, "shape") and probabilities.size:
        return min(max(float(np.max(probabilities[0])), 0.0), 1.0)
    return 0.0


def predict_exercise_recommendations(user_profile: dict[str, Any]) -> dict[str, Any]:
    profile = validate_profile(user_profile)
    input_df = pd.DataFrame([
        {
            "age": profile["age"],
            "gender": profile["gender"],
            "height": profile["height"],
            "weight": profile["weight"],
            "bmi": profile["bmi"],
            "goal": profile["goal"],
            "activity_level": profile["activity_level"],
            "fitness_level": profile["fitness_level"],
            "workout_days": profile["workout_days"],
            "workout_duration_minutes": profile["workout_duration_minutes"],
            "equipment": normalize_equipment(profile["equipment"]),
            "preferred_workout_type": profile["preferred_workout_type"],
        }
    ])

    raw_pred = MODEL.predict(input_df)
    probabilities = MODEL.predict_proba(input_df)
    predicted = {
        "target_muscle": raw_pred[0][0],
        "exercise_category": raw_pred[0][1],
        "exercise_difficulty": raw_pred[0][2],
    }

    filtered = [
        ex for ex in EXERCISE_CATALOG
        if rule_based_allowed(ex, profile)
    ]

    scored = []
    for exercise in filtered:
        score = score_exercise(exercise, profile, predicted)
        scored.append((score, exercise))

    scored.sort(key=lambda item: item[0], reverse=True)
    recommendations = []
    for score, exercise in scored[:10]:
        recommendations.append({
            "exerciseName": exercise["name"],
            "targetMuscle": exercise["muscleGroup"],
            "category": exercise["category"],
            "difficulty": exercise["difficulty"],
            "sets": exercise.get("sets", 3),
            "reps": exercise.get("reps", "8-12"),
            "restSeconds": exercise.get("restSeconds", 60),
            "durationMinutes": exercise.get("durationMinutes", 0),
            "score": round(float(score), 4),
        })

    confidence = _get_model_confidence(probabilities)

    return {
        "predicted": predicted,
        "confidence": confidence,
        "recommendations": recommendations,
    }
