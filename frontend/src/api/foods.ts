import api from './client';
import type { Food } from '@/types';

export const foodApi = {
  search: (params: { search?: string; category?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; foods: Food[]; pagination: { page: number; total: number; pages: number } }>(
      '/foods',
      { params }
    ),

  getById: (id: string) => api.get<{ success: boolean; food: Food }>(`/foods/${id}`),

  getCategories: () => api.get<{ success: boolean; categories: string[] }>('/foods/categories'),

  create: (data: Partial<Food>) => api.post<{ success: boolean; food: Food }>('/foods', data),

  update: (id: string, data: Partial<Food>) => api.put<{ success: boolean; food: Food }>(`/foods/${id}`, data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/foods/${id}`),
};
