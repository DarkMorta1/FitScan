import json
import random
import subprocess
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
EXERCISE_JS_PATH = BASE_DIR.parent / "backend" / "src" / "data" / "exercises.js"
OUTPUT_CSV = BASE_DIR / "dataset" / "exercise_training_dataset.csv"

AGE_BINS = list(range(18, 66))
GENDERS = ["Male", "Female", "Other"]
GOALS = ["Bulking", "Cutting", "Maintain"]
ACTIVITY_LEVELS = ["Sedentary", "Light", "Moderate", "Active", "Very Active"]
FITNESS_LEVELS = ["Beginner", "Intermediate", "Advanced"]
PREFERRED_WORKOUT_TYPES = ["Strength", "Cardio", "Mixed", "Bodyweight"]
WORKOUT_DURATIONS = [15, 30, 45, 60, 75, 90, 120]

RANDOM_SEED = 42
random.seed(RANDOM_SEED)


def load_exercise_catalog():
    command = [
        "node",
        "-e",
        f"const ex=require({json.dumps(str(EXERCISE_JS_PATH))}); console.log(JSON.stringify(ex));",
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            "Failed to load exercise catalog from backend/src/data/exercises.js:\n"
            + result.stderr
        )
    return json.loads(result.stdout)


def choose_activity_level(age: int) -> str:
    if age < 25:
        return random.choices(ACTIVITY_LEVELS, weights=[5, 10, 25, 40, 20])[0]
    if age < 35:
        return random.choices(ACTIVITY_LEVELS, weights=[10, 20, 35, 25, 10])[0]
    if age < 50:
        return random.choices(ACTIVITY_LEVELS, weights=[20, 30, 30, 15, 5])[0]
    return random.choices(ACTIVITY_LEVELS, weights=[35, 35, 20, 8, 2])[0]


def choose_goal(bmi: float) -> str:
    if bmi < 19:
        return random.choice(["Bulking", "Maintain"])
    if bmi < 24.5:
        return random.choices(GOALS, weights=[25, 15, 60])[0]
    if bmi < 28:
        return random.choices(GOALS, weights=[20, 35, 45])[0]
    return random.choices(GOALS, weights=[10, 55, 35])[0]


def choose_fitness_level(activity_level: str, age: int, bmi: float) -> str:
    if activity_level in ["Sedentary", "Light"] or bmi >= 30:
        return random.choices(FITNESS_LEVELS, weights=[60, 30, 10])[0]
    if activity_level == "Moderate":
        return random.choices(FITNESS_LEVELS, weights=[20, 55, 25])[0]
    return random.choices(FITNESS_LEVELS, weights=[10, 40, 50])[0]


def choose_workout_days(fitness_level: str) -> int:
    if fitness_level == "Beginner":
        return random.choice([2, 3, 4])
    if fitness_level == "Intermediate":
        return random.choice([3, 4, 5, 6])
    return random.choice([4, 5, 6])


def choose_duration(fitness_level: str) -> int:
    if fitness_level == "Beginner":
        return random.choice([15, 30, 45, 60])
    if fitness_level == "Intermediate":
        return random.choice([30, 45, 60, 75])
    return random.choice([45, 60, 75, 90])


def choose_preferred_type(goal: str) -> str:
    if goal == "Bulking":
        return random.choices(PREFERRED_WORKOUT_TYPES, weights=[45, 5, 35, 15])[0]
    if goal == "Cutting":
        return random.choices(PREFERRED_WORKOUT_TYPES, weights=[20, 40, 30, 10])[0]
    return random.choices(PREFERRED_WORKOUT_TYPES, weights=[30, 20, 35, 15])[0]


def choose_equipment(available_equipment: list[str], preferred_type: str, fitness_level: str) -> list[str]:
    if preferred_type == "Bodyweight":
        return []

    if fitness_level == "Beginner":
        options = [eq for eq in available_equipment if eq not in {"Barbell", "Cable Machine", "Assisted Pull-up Machine"}]
        pool = options or available_equipment
    else:
        pool = available_equipment

    count = random.choices([0, 1, 2, 3], weights=[25, 40, 25, 10])[0]
    chosen = random.sample(pool, min(count, len(pool))) if count > 0 else []
    return sorted(set(chosen))


def build_profile(available_equipment: list[str]) -> dict:
    age = random.choice(AGE_BINS)
    gender = random.choices(GENDERS, weights=[48, 48, 4])[0]
    height = random.randint(155, 198)
    bmi = round(random.uniform(18.0, 34.5), 1)
    weight = round(bmi * ((height / 100) ** 2), 1)
    goal = choose_goal(bmi)
    activity_level = choose_activity_level(age)
    fitness_level = choose_fitness_level(activity_level, age, bmi)
    workout_days = choose_workout_days(fitness_level)
    workout_duration_minutes = choose_duration(fitness_level)
    preferred_workout_type = choose_preferred_type(goal)
    equipment = choose_equipment(available_equipment, preferred_workout_type, fitness_level)

    return {
        "age": age,
        "gender": gender,
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "goal": goal,
        "activity_level": activity_level,
        "fitness_level": fitness_level,
        "workout_days": workout_days,
        "workout_duration_minutes": workout_duration_minutes,
        "equipment": equipment,
        "preferred_workout_type": preferred_workout_type,
    }


def build_profile_for_exercise(exercise: dict, available_equipment: list[str]) -> dict:
    age = random.choice(AGE_BINS)
    gender = random.choices(GENDERS, weights=[48, 48, 4])[0]
    height = random.randint(155, 198)
    bmi = round(random.uniform(18.0, 34.5), 1)
    weight = round(bmi * ((height / 100) ** 2), 1)

    exercise_goals = exercise.get("goals") or GOALS
    goal = random.choice(exercise_goals)
    activity_level = choose_activity_level(age)
    fitness_level = exercise["difficulty"] if exercise["difficulty"] in FITNESS_LEVELS else choose_fitness_level(activity_level, age, bmi)
    if fitness_level == "Advanced" and exercise["difficulty"] == "Beginner":
        fitness_level = random.choice(["Intermediate", "Advanced"])
    workout_days = choose_workout_days(fitness_level)
    workout_duration_minutes = choose_duration(fitness_level)

    category = exercise.get("category", "Strength")
    if category == "Cardio":
        preferred_workout_type = random.choices(["Cardio", "Mixed"], weights=[70, 30])[0]
    elif category == "Bodyweight":
        preferred_workout_type = random.choices(["Bodyweight", "Mixed"], weights=[60, 40])[0]
    else:
        preferred_workout_type = random.choices(["Strength", "Mixed"], weights=[65, 35])[0]

    required_equipment = exercise.get("equipment") or []
    equipment = []
    if preferred_workout_type == "Bodyweight":
        equipment = []
    else:
        if required_equipment:
            equipment = sorted(set(required_equipment))
        else:
            if random.random() < 0.25:
                equipment = choose_equipment(available_equipment, preferred_workout_type, fitness_level)
            else:
                equipment = []

    if preferred_workout_type == "Strength" and category == "Cardio":
        preferred_workout_type = "Mixed"
    if preferred_workout_type == "Cardio" and category == "Strength":
        preferred_workout_type = "Mixed"

    return {
        "age": age,
        "gender": gender,
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "goal": goal,
        "activity_level": activity_level,
        "fitness_level": fitness_level,
        "workout_days": workout_days,
        "workout_duration_minutes": workout_duration_minutes,
        "equipment": equipment,
        "preferred_workout_type": preferred_workout_type,
    }


def exercise_allowed(exercise: dict, profile: dict) -> bool:
    if profile["fitness_level"] == "Beginner" and exercise["difficulty"] in ["Intermediate", "Advanced"]:
        return False
    if profile["fitness_level"] == "Intermediate" and exercise["difficulty"] == "Advanced":
        return False

    if exercise.get("goals") and profile["goal"] not in exercise["goals"]:
        return False

    required_equipment = exercise.get("equipment") or []
    if required_equipment and not set(required_equipment).issubset(set(profile["equipment"])):
        return False

    pref = profile["preferred_workout_type"]
    if pref == "Bodyweight" and required_equipment:
        return False
    if pref == "Strength" and exercise["category"] == "Cardio":
        return False
    if pref == "Cardio" and exercise["category"] not in {"Cardio", "Bodyweight", "Accessory"}:
        return False

    return True


def exercise_score(exercise: dict, profile: dict) -> float:
    score = 0.0
    if profile["goal"] in exercise.get("goals", []):
        score += 2.0
    if exercise["difficulty"] == profile["fitness_level"]:
        score += 1.5
    if profile["preferred_workout_type"] == "Bodyweight" and not exercise.get("equipment"):
        score += 2.0
    if profile["preferred_workout_type"] == "Strength" and exercise["category"] in {"Strength", "Accessory"}:
        score += 1.0
    if profile["preferred_workout_type"] == "Cardio" and exercise["category"] in {"Cardio", "Bodyweight"}:
        score += 1.0
    return score + random.random() * 0.5


def build_dataset(exercises: list[dict], target_rows: int = 32000, samples_per_exercise: int = 600) -> pd.DataFrame:
    equipment_options = sorted({item for ex in exercises for item in ex.get("equipment", []) if item})
    profile_set = set()
    profiles: list[dict] = []

    def profile_key(profile: dict) -> tuple:
        return (
            profile["age"],
            profile["gender"],
            profile["height"],
            profile["weight"],
            profile["bmi"],
            profile["goal"],
            profile["activity_level"],
            profile["fitness_level"],
            profile["workout_days"],
            profile["workout_duration_minutes"],
            tuple(profile["equipment"]),
            profile["preferred_workout_type"],
        )

    while len(profiles) < 9000:
        profile = build_profile(equipment_options)
        key = profile_key(profile)
        if key in profile_set:
            continue
        profile_set.add(key)
        profiles.append(profile)

    target_counts = {ex["name"]: samples_per_exercise for ex in exercises}
    rows: list[dict] = []
    row_key_set = set()

    def build_row(profile: dict, exercise: dict) -> dict:
        return {
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
            "equipment": ";".join(profile["equipment"]),
            "preferred_workout_type": profile["preferred_workout_type"],
            "target_muscle": exercise["muscleGroup"],
            "exercise_name": exercise["name"],
            "exercise_category": exercise["category"],
            "exercise_difficulty": exercise["difficulty"],
            "sets": exercise.get("sets", 3),
            "reps": exercise.get("reps", "8-12"),
            "rest_seconds": exercise.get("restSeconds", 60),
            "duration_minutes": exercise.get("durationMinutes", 5),
        }

    def eligible_profiles_for_exercise(exercise: dict) -> list[dict]:
        return [profile for profile in profiles if exercise_allowed(exercise, profile)]

    def choose_profiles(exercise: dict, target: int, existing_profiles: set[tuple]) -> list[dict]:
        eligible = eligible_profiles_for_exercise(exercise)
        if len(eligible) < target:
            return eligible

        scored = [(exercise_score(exercise, profile), profile) for profile in eligible]
        scored.sort(key=lambda item: item[0], reverse=True)

        selected = []
        selected_keys = set()
        window = min(len(scored), target * 4)
        candidates = scored[:window]
        while len(selected) < target and candidates:
            weights = [score for score, _ in candidates]
            total = sum(weights)
            if total <= 0:
                weights = [1.0] * len(candidates)
                total = len(candidates)
            choice = random.choices(candidates, weights=[w / total for w in weights], k=1)[0][1]
            key = profile_key(choice)
            if key in selected_keys or key in existing_profiles:
                candidates = [item for item in candidates if item[1] != choice]
                continue
            selected.append(choice)
            selected_keys.add(key)
            candidates = [item for item in candidates if item[1] != choice]
        if len(selected) < target:
            selected.extend(profile for _, profile in scored if profile_key(profile) not in selected_keys and profile_key(profile) not in existing_profiles)[: target - len(selected)]
        return selected

    exercise_profiles_used: dict[str, set[tuple]] = {ex["name"]: set() for ex in exercises}

    for exercise in exercises:
        target = target_counts[exercise["name"]]
        chosen_profiles = choose_profiles(exercise, target, exercise_profiles_used[exercise["name"]])

        if len(chosen_profiles) < target:
            attempts = 0
            while len(chosen_profiles) < target and attempts < 10000:
                profile = build_profile_for_exercise(exercise, equipment_options)
                key = profile_key(profile)
                if key in profile_set:
                    attempts += 1
                    continue
                if not exercise_allowed(exercise, profile):
                    attempts += 1
                    continue
                profile_set.add(key)
                profiles.append(profile)
                exercise_profiles_used[exercise["name"]].add(key)
                chosen_profiles.append(profile)
                attempts += 1
            if len(chosen_profiles) < target:
                raise RuntimeError(f"Unable to generate enough profiles for exercise {exercise['name']}")

        for profile in chosen_profiles[:target]:
            row = build_row(profile, exercise)
            row_key = (row["exercise_name"], row["age"], row["gender"], row["height"], row["weight"], row["bmi"], row["goal"], row["activity_level"], row["fitness_level"], row["workout_days"], row["workout_duration_minutes"], row["equipment"], row["preferred_workout_type"], row["target_muscle"])
            if row_key in row_key_set:
                continue
            row_key_set.add(row_key)
            rows.append(row)

    df = pd.DataFrame(rows)
    if df.shape[0] < target_rows:
        raise RuntimeError(f"Generated only {df.shape[0]} rows, expected at least {target_rows}")

    return df


def main():
    exercises = load_exercise_catalog()
    samples_per_exercise = 600
    expected_rows = len(exercises) * samples_per_exercise
    dataset_df = build_dataset(exercises, target_rows=expected_rows, samples_per_exercise=samples_per_exercise)
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    dataset_df.to_csv(OUTPUT_CSV, index=False)

    print("Dataset shape:", dataset_df.shape)
    print("Unique exercises:", dataset_df["exercise_name"].nunique())
    profile_columns = [
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
    print("Unique profiles:", dataset_df.drop_duplicates(subset=profile_columns).shape[0])
    counts = dataset_df["exercise_name"].value_counts().sort_index()
    print("Minimum class count:", counts.min())
    print("Maximum class count:", counts.max())
    print("Class distribution:\n", counts.to_string())
    print("Missing values:\n", dataset_df.isna().sum())

    valid = True
    if dataset_df.isna().any().any():
        valid = False
        print("Dataset validation: FAIL - missing values found")
    if dataset_df["exercise_name"].nunique() < 53:
        valid = False
        print("Dataset validation: FAIL - fewer than 53 unique exercises")
    if counts.min() < 300:
        valid = False
        print("Dataset validation: FAIL - some exercises have fewer than 300 samples")

    if valid:
        print("Dataset validation: PASS")
    else:
        raise RuntimeError("Dataset validation failed")

    print("Saved CSV to:", OUTPUT_CSV)


if __name__ == "__main__":
    main()
