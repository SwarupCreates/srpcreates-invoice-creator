import { api } from './api';
import type { Transaction } from './types';

export const transactionApi = {
  getAll: () => api.get<Transaction[]>('getTransactions'),
  
  create: (data: Partial<Transaction>) => api.post<Transaction>('createTransaction', data)
};
