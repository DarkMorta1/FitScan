import api from './client';
import type { User } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/login', data),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, password }),

  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
};
