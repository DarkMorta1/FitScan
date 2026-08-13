import pandas as pd
import random
import os

# Create a folder named dataset if it doesn't exist
os.makedirs("dataset", exist_ok=True)

data = []

for i in range(1000):

    calories = random.randint(100, 1000)
    protein = random.randint(5, 50)
    fat = random.randint(1, 60)
    carbs = random.randint(10, 120)

    allergy = random.randint(0, 1)

    milk = random.randint(0, 1)
    peanut = random.randint(0, 1)
    egg = random.randint(0, 1)
    gluten = random.randint(0, 1)

    # Simple rule to create labels
    if allergy == 1 and (milk or peanut or egg or gluten):
        risk = "High Risk"
    elif calories > 700 or fat > 40:
        risk = "Moderate Risk"
    else:
        risk = "Safe"

    data.append([
        calories,
        protein,
        fat,
        carbs,
        allergy,
        milk,
        peanut,
        egg,
        gluten,
        risk
    ])

columns = [
    "Calories",
    "Protein",
    "Fat",
    "Carbs",
    "User_Allergy",
    "Milk",
    "Peanut",
    "Egg",
    "Gluten",
    "Risk"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("dataset/food_dataset.csv", index=False)

print("Dataset created successfully!")
print(df.head())