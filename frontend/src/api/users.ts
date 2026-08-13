import api from './client';
import type { User, UserProfile } from '@/types';

export const userApi = {
  getProfile: () =>
    api.get<{ success: boolean; user: User; metrics: { bmi: number; dailyCalories: number; waterIntake: number } }>(
      '/users/profile'
    ),

  updateProfile: (data: { name?: string; phone?: string; profile?: UserProfile }) =>
    api.put<{ success: boolean; user: User }>('/users/profile', data),
};
