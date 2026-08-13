import api from './client';
import type { ScanResult } from '@/types';

export const scanApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{
      success: boolean;
      detected: boolean;
      imageUrl?: string;
      message?: string;
      scan?: ScanResult;
      items?: { food: any; matchedText: string; confidence: number }[];
      detectionConfidence?: number;
    }>('/scans/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  analyze: (foodId: string, manualSelection = false) =>
    api.post<{ success: boolean; scan: ScanResult }>('/scans/analyze', { foodId, manualSelection }),

  getHistory: () => api.get<{ success: boolean; scans: ScanResult[] }>('/scans/history'),

  getById: (id: string) => api.get<{ success: boolean; scan: ScanResult }>(`/scans/${id}`),
};
