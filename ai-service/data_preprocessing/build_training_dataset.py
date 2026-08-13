import pandas as pd
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

food_df = pd.read_csv(BASE_DIR / "dataset" / "clean_food_dataset.csv")
users_df = pd.read_csv(BASE_DIR / "dataset" / "realistic_users.csv")

training_data = []

# -----------------------------
# Risk Calculation Function
# -----------------------------
def calculate_risk(user, food):

    score = 0

    # Goal Based Rules
    if user["Goal"] == "Cutting":
        if food["Caloric Value"] > 700:
            score += 2
        if food["Fat"] > 35:
            score += 1

    elif user["Goal"] == "Bulking":
        if food["Protein"] > 30:
            score -= 1
        if food["Caloric Value"] < 300:
            score += 1

    # Medical Conditions

    if user["Diabetes"] == 1 and food["Sugars"] > 20:
        score += 3

    if user["Hypertension"] == 1 and food["Sodium"] > 600:
        score += 3

    if user["High_Cholesterol"] == 1 and food["Cholesterol"] > 60:
        score += 2

    # BMI

    if user["BMI"] >= 30 and food["Fat"] > 30:
        score += 1

    # Final Label

    if score <= 1:
        return "Safe"

    elif score <= 3:
        return "Moderate Risk"

    return "High Risk"

# -----------------------------
# Build Dataset
# -----------------------------

for _, user in users_df.iterrows():

    sampled_foods = food_df.sample(20)

    for _, food in sampled_foods.iterrows():

        risk = calculate_risk(user, food)

        training_data.append({

            "Age": user["Age"],
            "BMI": user["BMI"],
            "Goal": user["Goal"],
            "Activity_Level": user["Activity_Level"],
            "Diabetes": user["Diabetes"],
            "Hypertension": user["Hypertension"],
            "High_Cholesterol": user["High_Cholesterol"],

            "Calories": food["Caloric Value"],
            "Protein": food["Protein"],
            "Fat": food["Fat"],
            "Carbs": food["Carbohydrates"],
            "Sugar": food["Sugars"],
            "Fiber": food["Dietary Fiber"],
            "Sodium": food["Sodium"],
            "Cholesterol": food["Cholesterol"],

            "Risk": risk
        })

training_df = pd.DataFrame(training_data)

output = BASE_DIR / "dataset" / "training_dataset.csv"

training_df.to_csv(output, index=False)

print(training_df.head())

print()

print("Rows:", len(training_df))

print("Training dataset created successfully!")