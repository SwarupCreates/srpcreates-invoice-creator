import { api } from './api';
import type { Customer } from './types';

export const customerApi = {
  getAll: () => api.get<Customer[]>('getCustomers'),
  
  create: (data: Partial<Customer>) => api.post<Customer>('createCustomer', data),
  
  update: (data: Partial<Customer>) => api.post<Customer>('updateCustomer', data),
  
  remove: (id: string) => api.post<{id: string}>('deleteCustomer', { id })
};
