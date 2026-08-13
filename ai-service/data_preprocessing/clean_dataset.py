import pandas as pd

# Load the original dataset
df = pd.read_csv("dataset/FOOD-DATA-GROUP1.csv")

print("Original Shape:", df.shape)

# Remove unwanted index columns
columns_to_remove = []

if "Unnamed: 0" in df.columns:
    columns_to_remove.append("Unnamed: 0")

if "Unnamed: 0.1" in df.columns:
    columns_to_remove.append("Unnamed: 0.1")

df.drop(columns=columns_to_remove, inplace=True)

# Remove duplicate foods
df.drop_duplicates(subset=["food"], inplace=True)

# Convert food names to lowercase
df["food"] = df["food"].str.lower()

# Save cleaned dataset
df.to_csv("dataset/clean_food_dataset.csv", index=False)

print("Cleaned Shape:", df.shape)
print("Dataset cleaned successfully!")