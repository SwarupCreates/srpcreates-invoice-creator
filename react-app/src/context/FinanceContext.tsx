import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Invoice, Customer, Settings } from '../api/types';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { settingsApi } from '../api/settingsApi';

type FinanceContextType = {
  invoices: Invoice[];
  isLoadingInvoices: boolean;
  refreshInvoices: () => Promise<void>;
  markInvoicePaid: (id: string) => Promise<boolean>;
  markInvoicePending: (id: string) => Promise<boolean>;
  addInvoice: (invoice: Invoice) => Promise<boolean>;
  updateInvoice: (invoice: Invoice) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  
  customers: Customer[];
  isLoadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<boolean>;
  updateCustomer: (customer: Customer) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  settings: Settings | null;
  isLoadingSettings: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (settingsData: Partial<Settings>) => Promise<boolean>;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

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

  const updateInvoice = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
      
      const response = await invoiceApi.update(invoice);
      if (!response.success) {
        await refreshInvoices();
        alert(`Failed to update invoice: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating invoice", error);
      await refreshInvoices();
      return false;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      
      const response = await invoiceApi.delete(id);
      if (!response.success) {
        await refreshInvoices();
        alert(`Failed to delete invoice: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error deleting invoice", error);
      await refreshInvoices();
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

  const refreshSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await settingsApi.get();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        console.error("Failed to load settings", response.message);
      }
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateSettings = async (settingsData: Partial<Settings>) => {
    try {
      // Optimistic update locally
      setSettings(prev => ({ ...prev, ...settingsData }));
      
      const response = await settingsApi.update(settingsData);
      if (!response.success) {
        // Revert if failed
        await refreshSettings();
        alert(`Failed to update settings: ${response.message}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating settings", error);
      await refreshSettings(); // Revert
      return false;
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    refreshInvoices();
    refreshCustomers();
    refreshSettings();
  }, []);

  return (
    <FinanceContext.Provider value={{ 
      invoices, isLoadingInvoices, refreshInvoices, markInvoicePaid, markInvoicePending,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      
      customers, isLoadingCustomers, refreshCustomers, addCustomer, updateCustomer, deleteCustomer,

      settings, isLoadingSettings, refreshSettings, updateSettings
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
