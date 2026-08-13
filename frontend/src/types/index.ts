export interface UserProfile {
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number;
  weight?: number;
  goal?: 'Bulking' | 'Cutting' | 'Maintain';
  activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
  dietaryPreference?: 'Vegan' | 'Vegetarian' | 'Non-Vegetarian';
  medicalConditions?: string[];
  allergies?: string[];
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  workoutDays?: number;
  workoutDurationMinutes?: number;
  equipment?: string[];
  preferredWorkoutType?: 'Strength' | 'Cardio' | 'Mixed' | 'Bodyweight';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  profile?: UserProfile;
  onboardingComplete?: boolean;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  sodium: number;
  cholesterol: number;
  imageUrl: string;
  allergens: string[];
}

export interface ScanResult {
  _id: string;
  foodId: string;
  imageUrl: string;
  detectedFoodName?: string;
  prediction: string;
  confidence: number;
  reasons: string[];
  alternatives: string[];
  allergenWarnings: string[];
  allergyWarnings?: string[];
  dietaryWarnings?: string[];
  medicalWarnings?: string[];
  personalizationReasons?: string[];
  food?: Food;
  createdAt: string;
}

export interface DashboardData {
  bmi: number;
  dailyCalories: number;
  consumedCalories: number;
  waterIntake: number;
  todayMeals: { _id: string; mealType: string; foodName?: string; calories?: number }[];
  nutritionSummary: { protein: number; fat: number; carbs: number };
  workoutSummary: { completed: number; target: number };
  weightProgress: number;
  riskSummary: { safe: number; moderate: number; high: number };
  recentScans: ScanResult[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: T | boolean | string | undefined;
}
