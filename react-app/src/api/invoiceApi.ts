import { api } from './api';
import type { Invoice } from './types';

export const invoiceApi = {
  getAll: () => api.get<Invoice[]>('getInvoices'),
  
  getById: (id: string) => api.get<Invoice>('getInvoice', { id }),
  
  create: (invoiceData: Partial<Invoice>) => api.post<Invoice>('createInvoice', invoiceData),
  
  update: (invoiceData: Partial<Invoice>) => api.post<Invoice>('updateInvoice', invoiceData),
  
  delete: (id: string) => api.post<{ id: string }>('deleteInvoice', { id }),
  
  markPaid: (id: string) => api.post<{ id: string, status: string }>('markInvoicePaid', { id }),

  markPending: (id: string) => api.post<null>('markInvoicePending', { id })
};
