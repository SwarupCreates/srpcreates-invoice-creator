import { api } from './api';
import type { Product } from './types';

export const productApi = {
  getAll: () => api.get<Product[]>('getProducts')
};
