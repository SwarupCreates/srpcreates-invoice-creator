export type Invoice = {
  id: string;
  date: string;
  customerName: string;
  projectName: string;
  totalAmount: number;
  status: 'Pending' | 'Cancelled' | 'Fulfilled';
  items?: InvoiceItem[];
};

export type InvoiceItem = {
  id: string;
  invoiceId?: string;
  description: string;
  type: string;
  price: string;
};

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  pan?: string;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: 'Income' | 'Expense';
  category?: string;
  description?: string;
};

export type DashboardSummary = {
  totalRevenue: number;
  pendingInvoices: number;
  recentActivity: any[]; // refine later
};

export type Product = {
  id: string;
  name: string;
  defaultPrice: number;
  type: string;
};

export type Settings = {
  bankDetails?: string[][];
  contactInfo?: {
    email: string;
    phone: string;
    website: string;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error_code?: number;
};
