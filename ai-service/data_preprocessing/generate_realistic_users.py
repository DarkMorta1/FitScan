import pandas as pd
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

users = []

for _ in range(1000):

    age = random.randint(18, 60)
    gender = random.choice(["Male", "Female"])
    height = random.randint(150, 190)

    # Generate realistic weight based on height
    bmi_target = random.uniform(18, 35)
    weight = round(bmi_target * ((height / 100) ** 2), 1)

    bmi = round(weight / ((height / 100) ** 2), 1)

    # Goal based on BMI
    if bmi < 18.5:
        goal = "Bulking"
    elif bmi < 25:
        goal = random.choice(["Maintain", "Bulking"])
    elif bmi < 30:
        goal = random.choice(["Maintain", "Cutting"])
    else:
        goal = "Cutting"

    # Activity level
    if age < 30:
        activity = random.choice(["Moderate", "Active", "Very Active"])
    elif age < 45:
        activity = random.choice(["Light", "Moderate", "Active"])
    else:
        activity = random.choice(["Sedentary", "Light", "Moderate"])

    # Medical conditions become more likely with age/BMI
    diabetes = 1 if (bmi > 30 and random.random() < 0.40) else 0
    hypertension = 1 if (age > 40 and random.random() < 0.35) else 0
    high_cholesterol = 1 if (bmi > 28 and random.random() < 0.30) else 0

    # Allergies (low probability)
    milk = 1 if random.random() < 0.08 else 0
    peanut = 1 if random.random() < 0.03 else 0
    egg = 1 if random.random() < 0.02 else 0
    gluten = 1 if random.random() < 0.02 else 0

    users.append({
        "Age": age,
        "Gender": gender,
        "Height": height,
        "Weight": weight,
        "BMI": bmi,
        "Goal": goal,
        "Activity_Level": activity,
        "Diabetes": diabetes,
        "Hypertension": hypertension,
        "High_Cholesterol": high_cholesterol,
        "Milk_Allergy": milk,
        "Peanut_Allergy": peanut,
        "Egg_Allergy": egg,
        "Gluten_Allergy": gluten
    })

df = pd.DataFrame(users)

output = BASE_DIR / "dataset" / "realistic_users.csv"

df.to_csv(output, index=False)

print(df.head())
print()
print("Total Users:", len(df))
print("Saved to:", output)