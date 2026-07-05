import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { StudioIcon, toInputDate, getNextInvoiceCount, formatInvoiceNumber } from './shared';
import type { Invoice } from '../api/types';
import { InvoicePillRow } from '../components/InvoicePillRow';
import '../styles/PastInvoicesPage.css';

export function PastInvoicesPage({ isAddRecordOpen }: { isAddRecordOpen?: boolean }) {
  const { invoices, isLoadingInvoices, markInvoicePaid, markInvoicePending, addInvoice } = useFinance();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    date: toInputDate(new Date()),
    customerName: '',
    projectName: '',
    totalAmount: '',
    status: 'Pending' as Invoice['status']
  });

  // Initialize auto-generated id when invoices load
  useEffect(() => {
    if (!isLoadingInvoices && invoices && invoices.length >= 0) {
      setFormData(prev => {
        // Only override if empty or already matches our auto-generation pattern for some date
        if (prev.id === '' || prev.id.startsWith('SPR')) {
          return {
            ...prev,
            id: formatInvoiceNumber(prev.date, getNextInvoiceCount(prev.date, invoices))
          };
        }
        return prev;
      });
    }
  }, [invoices, isLoadingInvoices, formData.date]);

  const handleMarkPaid = async (id: string) => {
    if (window.confirm(`Mark invoice ${id} as paid?`)) {
      await markInvoicePaid(id);
    }
  };

  const handleMarkPending = async (id: string) => {
    await markInvoicePending(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.customerName || !formData.totalAmount) {
      alert("Please fill in the required fields (Invoice #, Client, Amount)");
      return;
    }

    setIsSubmitting(true);
    const newInvoice: Invoice = {
      id: formData.id,
      date: formData.date,
      customerName: formData.customerName,
      projectName: formData.projectName,
      totalAmount: Number(formData.totalAmount),
      status: formData.status
    };

    const success = await addInvoice(newInvoice);
    if (success) {
      const nextDate = toInputDate(new Date());
      setFormData({
        id: invoices ? formatInvoiceNumber(nextDate, getNextInvoiceCount(nextDate, invoices)) : '',
        date: nextDate,
        customerName: '',
        projectName: '',
        totalAmount: '',
        status: 'Pending'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="past-invoices-page">
      <div className={`add-record-drawer ${isAddRecordOpen ? 'open' : ''}`}>
        <section className="add-invoice-inline-container">
          <div className="section-label" style={{ marginBottom: '16px' }}>
            <StudioIcon name="add" />
            <span>Adding New Record</span>
          </div>
          
          <form id="add-invoice-form" className="inline-add-form" onSubmit={handleSubmit}>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="invoice_id" required />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="calendar_month" />
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="person" />
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Enter Client Name" required />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="folder" />
              <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} placeholder="Enter Project Name" />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="currency_rupee" />
              <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} placeholder="Amount" required min="0" />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="currency_rupee" />
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Pending">Status: Pending</option>
                <option value="Fulfilled">Status: Fulfilled</option>
                <option value="Cancelled">Status: Cancelled</option>
              </select>
            </div>
            <button type="submit" className="inline-submit-btn" disabled={isSubmitting} title="Save Record">
              <StudioIcon name="check" />
            </button>
          </form>
        </section>
      </div>

      <div className="past-invoices-list-container">
        <div className="section-label" style={{ marginBottom: '16px' }}>
          <StudioIcon name="history_toggle_off" />
          <span>Recent Pending Invoices</span>
        </div>

        {isLoadingInvoices ? (
          <div className="loading-state">
            <StudioIcon name="hourglass_empty" />
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <StudioIcon name="receipt_long" />
            <p>No invoices found. Use the "+ Add New Record" button to log one!</p>
          </div>
        ) : (
          <div className="pill-list-container">
            <div className="pill-list">
              {invoices.map((invoice) => (
                <InvoicePillRow 
                  key={invoice.id} 
                  invoice={invoice} 
                  onMarkFulfilled={handleMarkPaid} 
                  onMarkPending={handleMarkPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
