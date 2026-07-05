import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Invoice, Customer } from '../api/types';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';

type FinanceContextType = {
  invoices: Invoice[];
  isLoadingInvoices: boolean;
  refreshInvoices: () => Promise<void>;
  markInvoicePaid: (id: string) => Promise<boolean>;
  markInvoicePending: (id: string) => Promise<boolean>;
  addInvoice: (invoice: Invoice) => Promise<boolean>;
  
  customers: Customer[];
  isLoadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<boolean>;
  updateCustomer: (customer: Customer) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  const refreshInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const response = await invoiceApi.getAll();
      if (response.success && response.data) {
        setInvoices(response.data);
      } else {
        console.error("Failed to load invoices", response.message);
      }
    } catch (error) {
      console.error("Error fetching invoices", error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const markInvoicePaid = async (id: string) => {
    try {
      // Optimistic update locally
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Fulfilled' } : inv));
      
      const response = await invoiceApi.markPaid(id);
      if (!response.success) {
        // Revert if failed
        await refreshInvoices();
        alert(`Failed to mark invoice as paid: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error marking invoice paid", error);
      await refreshInvoices(); // Revert
      return false;
    }
  };

  const markInvoicePending = async (id: string) => {
    try {
      // Optimistic update locally
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Pending' } : inv));
      
      const response = await invoiceApi.markPending(id);
      if (!response.success) {
        // Revert if failed
        await refreshInvoices();
        alert(`Failed to mark invoice as pending: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error marking invoice pending", error);
      await refreshInvoices(); // Revert
      return false;
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    try {
      // Optimistic update locally
      setInvoices(prev => [invoice, ...prev]);
      
      const response = await invoiceApi.create(invoice);
      if (!response.success) {
        // Revert if failed
        await refreshInvoices();
        alert(`Failed to add invoice: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error adding invoice", error);
      await refreshInvoices(); // Revert
      return false;
    }
  };

  const refreshCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await customerApi.getAll();
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        console.error("Failed to load customers", response.message);
      }
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const addCustomer = async (customer: Customer) => {
    try {
      setCustomers(prev => [...prev, customer]);
      const response = await customerApi.create(customer);
      if (!response.success) {
        await refreshCustomers();
        alert(`Failed to add customer: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error adding customer", error);
      await refreshCustomers();
      return false;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
      const response = await customerApi.update(customer);
      if (!response.success) {
        await refreshCustomers();
        alert(`Failed to update customer: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating customer", error);
      await refreshCustomers();
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setCustomers(prev => prev.filter(c => c.id !== id));
      const response = await customerApi.remove(id);
      if (!response.success) {
        await refreshCustomers();
        alert(`Failed to delete customer: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error deleting customer", error);
      await refreshCustomers();
      return false;
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    refreshInvoices();
    refreshCustomers();
  }, []);

  return (
    <FinanceContext.Provider value={{ 
      invoices, isLoadingInvoices, refreshInvoices, markInvoicePaid, markInvoicePending, addInvoice,
      customers, isLoadingCustomers, refreshCustomers, addCustomer, updateCustomer, deleteCustomer
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
