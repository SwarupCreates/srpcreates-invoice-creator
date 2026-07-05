import { api } from './api';
import type { DashboardSummary } from './types';

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('getDashboard')
};
