import { api } from './api';
import type { Settings } from './types';

export const settingsApi = {
  get: () => api.get<Settings>('getSettings'),
  update: (data: Partial<Settings>) => api.post<Settings>('updateSettings', data)
};
