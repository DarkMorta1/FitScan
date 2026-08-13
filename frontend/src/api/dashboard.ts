import api from './client';
import type { DashboardData, Food } from '@/types';

export const dashboardApi = {
  get: () => api.get<{ success: boolean; dashboard: DashboardData }>('/dashboard'),

  logMeal: (foodId: string, mealType: string) =>
    api.post('/dashboard/meals', { foodId, mealType }),
};

export const recommendationApi = {
  getMeals: () =>
    api.get<{ success: boolean; recommendations: Record<string, Food[]> }>('/recommendations/meals'),

  getWorkouts: () =>
    api.get<{
      success: boolean;
      goal: string;
      fitnessLevel: string;
      daysPerWeek: number;
      activityLevel: string;
      workoutDurationMinutes?: number;
      preferredWorkoutType?: string;
      weeklyPlan: { day: string; focus: string; exercises: { name: string; muscleGroup: string; sets: number; reps: string; restSeconds: number; instructions: string[]; equipment: string[]; difficulty: string; durationMinutes: number }[]; estimatedDuration: number; estimatedCalories: number }[];
      estimatedWeeklyDuration: number;
      estimatedWeeklyCalories: number;
      planReason: string;
    }>('/recommendations/workouts'),

  getProgress: (range: 'weekly' | 'monthly' = 'weekly') =>
    api.get<{
      success: boolean;
      range: string;
      progress: { date: string; weight?: number; calories?: number; bmi?: number; waterIntake?: number; workoutsCompleted?: number }[];
      mealCompletion: { total: number; completed: number };
    }>('/recommendations/progress', { params: { range } }),

  updateProgress: (data: {
    weight?: number;
    calories?: number;
    waterIntake?: number;
    workoutsCompleted?: number;
    mealsCompleted?: number;
  }) => api.post('/recommendations/progress', data),
};

export const adminApi = {
  getStats: () =>
    api.get<{
      success: boolean;
      stats: {
        users: number;
        foods: number;
        scans: number;
        meals: number;
        riskDistribution: { _id: string; count: number }[];
        recentUsers: unknown[];
      };
    }>('/admin/stats'),

  getUsers: () => api.get<{ success: boolean; users: unknown[] }>('/admin/users'),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};
