require("dotenv").config();

const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const Food = require("../models/Food");
const env = require("../config/env");

const foods = [];

// CSV path
const csvPath = path.resolve(
  __dirname,
  "../../../ai-service/dataset/clean_food_dataset.csv"
);

console.log("Reading CSV from:");
console.log(csvPath);

function detectAllergens(foodName) {
  const name = (foodName || "").toLowerCase();

  const allergens = [];

  if (
    name.includes("milk") ||
    name.includes("cheese") ||
    name.includes("butter") ||
    name.includes("cream") ||
    name.includes("yogurt")
  ) {
    allergens.push("Milk");
  }

  if (name.includes("egg")) {
    allergens.push("Egg");
  }

  if (
    name.includes("peanut") ||
    name.includes("groundnut") ||
    name.includes("almond") ||
    name.includes("cashew") ||
    name.includes("walnut")
  ) {
    allergens.push("Peanut");
  }

  if (
    name.includes("bread") ||
    name.includes("burger") ||
    name.includes("pizza") ||
    name.includes("cake") ||
    name.includes("pasta") ||
    name.includes("wheat") ||
    name.includes("noodle") ||
    name.includes("bun")
  ) {
    allergens.push("Gluten");
  }

  return allergens;
}

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (row) => {

    // Find the food name column automatically
    const foodName =
      row.food ||
      row.Food ||
      row.Food_Name ||
      row["Food Name"] ||
      row.Description ||
      row.description ||
      row.Name ||
      row.name ||
      "";

    if (!foodName) return;

    const calories =
      Number(row["Caloric Value"]) ||
      Number(row.Calories) ||
      Number(row.calories) ||
      0;

    const protein =
      Number(row.Protein) ||
      Number(row.protein) ||
      0;

    const fat =
      Number(row.Fat) ||
      Number(row.fat) ||
      0;

    const carbs =
      Number(row.Carbohydrates) ||
      Number(row.Carbs) ||
      Number(row.carbs) ||
      0;

    const sugar =
      Number(row.Sugars) ||
      Number(row.Sugar) ||
      Number(row.sugar) ||
      0;

    const fiber =
      Number(row["Dietary Fiber"]) ||
      Number(row.Fiber) ||
      Number(row.fiber) ||
      0;

    const sodium =
      Number(row.Sodium) ||
      Number(row.sodium) ||
      0;

    const cholesterol =
      Number(row.Cholesterol) ||
      Number(row.cholesterol) ||
      0;

    const category =
      row.Category ||
      row.category ||
      "General";

    foods.push({
      name: foodName.trim(),
      category,
      calories,
      protein,
      fat,
      carbs,
      sugar,
      fiber,
      sodium,
      cholesterol,
      imageUrl: "",
      allergens: detectAllergens(foodName),
    });
  })

  .on("end", async () => {

    try {

      await mongoose.connect(env.mongoUri);

      console.log("Connected to MongoDB");

      await Food.deleteMany({});

      await Food.insertMany(foods);

      console.log("");

      console.log("====================================");
      console.log(`Imported ${foods.length} foods`);
      console.log("====================================");

      process.exit(0);

    } catch (err) {

      console.error(err);

      process.exit(1);

    }

  })

  .on("error", (err) => {

    console.error(err);

    process.exit(1);

  });