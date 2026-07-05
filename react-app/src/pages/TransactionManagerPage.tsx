import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { StudioIcon, toInputDate, getNextInvoiceCount, formatInvoiceNumber } from './shared';
import type { Invoice } from '../api/types';
import { InvoicePillRow } from '../components/InvoicePillRow';
import { useNavigate } from 'react-router-dom';
import '../styles/TransactionManagerPage.css';

export function TransactionManagerPage({ isAddRecordOpen, setIsAddRecordOpen, forceEditId, setForceEditId }: { isAddRecordOpen?: boolean, setIsAddRecordOpen?: (v: boolean) => void, forceEditId?: string, setForceEditId?: (id: string) => void }) {
  const { invoices, isLoadingInvoices, markInvoicePaid, markInvoicePending, addInvoice, updateInvoice, deleteInvoice, customers } = useFinance();
  const navigate = useNavigate();

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    date: toInputDate(new Date()),
    customerName: '',
    projectName: '',
    totalAmount: '',
    status: 'Pending' as Invoice['status']
  });

  // Initialize auto-generated id when invoices load OR when forceEditId changes
  useEffect(() => {
    if (forceEditId) {
      handleEditClick(forceEditId);
      if (setForceEditId) setForceEditId(''); // clear it so we don't loop
      return;
    }

    if (!editingTransactionId && !isLoadingInvoices && invoices && invoices.length >= 0) {
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
  }, [invoices, isLoadingInvoices, formData.date, forceEditId, editingTransactionId]);

  const handleMarkPaid = async (id: string) => {
    await markInvoicePaid(id);
  };

  const handleMarkPending = async (id: string) => {
    await markInvoicePending(id);
  };

  const handleEditClick = (inv: any) => {
    // If inv is a string (e.g. from forceEditId), fall back to finding by ID
    let targetInv = inv;
    if (typeof inv === 'string') {
      targetInv = invoices.find(i => i.id === inv);
    }
    
    if (targetInv) {
      setEditingTransactionId(targetInv.id);
      setIsAddRecordOpen?.(true);
      
      const clientStr = ('client' in targetInv ? targetInv.client : ('customerName' in targetInv ? targetInv.customerName : ''));
      const projectStr = ('project' in targetInv ? targetInv.project : targetInv.projectName) || '';
      const amount = 'amount' in targetInv ? targetInv.amount : targetInv.totalAmount;
      
      setFormData({
        id: targetInv.id,
        date: toInputDate(new Date(targetInv.date || new Date())),
        customerName: clientStr,
        projectName: projectStr,
        totalAmount: String(amount),
        status: targetInv.status || 'Pending'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      await deleteInvoice(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    const nextDate = toInputDate(new Date());
    setFormData({
      id: invoices ? formatInvoiceNumber(nextDate, getNextInvoiceCount(nextDate, invoices)) : '',
      date: nextDate,
      customerName: '',
      projectName: '',
      totalAmount: '',
      status: 'Pending'
    });
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
    const payload: Invoice = {
      id: formData.id,
      date: formData.date,
      customerName: formData.customerName,
      projectName: formData.projectName,
      totalAmount: Number(formData.totalAmount),
      status: formData.status
    };

    let success = false;
    if (editingTransactionId) {
      success = await updateInvoice(payload);
    } else {
      success = await addInvoice(payload);
    }

    if (success) {
      handleCancelEdit();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="past-invoices-page">
      <div className={`add-record-drawer ${isAddRecordOpen ? 'open' : ''}`}>
        <section className="add-invoice-inline-container">
          <div className="section-label" style={{ marginBottom: '16px' }}>
            <StudioIcon name={editingTransactionId ? "edit" : "add"} />
            <span>{editingTransactionId ? "Editing Record" : "Adding New Record"}</span>
            {editingTransactionId && (
              <button className="icon-button" onClick={handleCancelEdit} style={{ marginLeft: 'auto', background: 'var(--panel)' }} title="Cancel Edit">
                <StudioIcon name="close" />
              </button>
            )}
          </div>
          
          <form id="add-invoice-form" className="inline-add-form" onSubmit={handleSubmit}>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="invoice_id" required disabled={!!editingTransactionId} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="calendar_month" />
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="person" />
              <input type="text" name="customerName" list="client-list" value={formData.customerName} onChange={handleInputChange} placeholder="Enter Client Name" required />
              <datalist id="client-list">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
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
            <div className="form-actions-row" style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="inline-submit-btn" disabled={isSubmitting} title="Save Record" style={{ flex: 1 }}>
                <StudioIcon name="check" />
              </button>
              {editingTransactionId && (
                <button 
                  type="button" 
                  className="inline-submit-btn edit-full-btn" 
                  onClick={() => navigate(`/invoice/edit/${editingTransactionId}`)}
                  title="Edit using Invoice editor"
                  style={{ flex: 1, background: 'var(--accent)' }}
                >
                  <StudioIcon name="edit_document" />
                </button>
              )}
            </div>
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
                  onEdit={handleEditClick}
                  onDelete={(id) => setTransactionToDelete(id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {transactionToDelete && (
        <div className="invoice-modal-backdrop benchmark-modal-backdrop" onClick={() => setTransactionToDelete(null)}>
          <div className="invoice-modal-container benchmark-modal-container" onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-body benchmark-modal-body" style={{ textAlign: 'center', padding: '32px' }}>
              <StudioIcon name="delete_forever" />
              <h3 style={{ margin: '16px 0', color: 'var(--text)' }}>Delete Transaction?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Are you sure you want to delete <strong>{transactionToDelete}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button type="button" className="action-button secondary" onClick={() => setTransactionToDelete(null)}>
                  Cancel
                </button>
                <button type="button" className="action-button danger" onClick={handleDeleteConfirm} style={{ background: 'var(--alert-red, #ff4a4a)' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
