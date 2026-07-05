import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { StudioIcon } from './shared';
import type { Customer } from '../api/types';
import { ClientPillRow } from '../components/ClientPillRow';
import '../styles/ClientManagerPage.css';

export function ClientManagerPage({ isAddClientOpen, setIsAddClientOpen }: { isAddClientOpen?: boolean, setIsAddClientOpen?: (val: boolean) => void }) {
  const { customers, isLoadingCustomers, addCustomer, updateCustomer, deleteCustomer } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState: Customer = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: ''
  };
  
  const [formData, setFormData] = useState<Customer>(initialFormState);

  useEffect(() => {
    if (isAddClientOpen && !isEditing && !formData.id) {
      setFormData(prev => ({ ...prev, id: `CUST-${Date.now()}` }));
    }
  }, [isAddClientOpen, isEditing, formData.id]);

  const openEdit = (client: Customer) => {
    setFormData(client);
    setIsEditing(true);
    if (setIsAddClientOpen) {
      setIsAddClientOpen(true);
    }
  };

  const closePanel = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    if (setIsAddClientOpen) {
      setIsAddClientOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Client Name is required");
      return;
    }

    setIsSubmitting(true);
    if (isEditing) {
      await updateCustomer(formData);
    } else {
      await addCustomer({ ...formData, id: formData.id || `CUST-${Date.now()}` });
    }
    setIsSubmitting(false);
    closePanel();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="client-manager-page">
      <div className={`add-record-drawer ${isAddClientOpen ? 'open' : ''}`}>
        <section className="add-invoice-inline-container">
          <div className="section-label" style={{ marginBottom: '16px' }}>
            <StudioIcon name={isEditing ? 'edit' : 'person_add'} />
            <span>{isEditing ? 'Edit Client' : 'Add New Client'}</span>
            {/* <button type="button" className="icon-btn" onClick={closePanel} style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <StudioIcon name="close" />
            </button> */}
          </div>
          
          <form id="add-client-form" className="inline-add-form" onSubmit={handleSubmit}>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="CUST-ID" disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="inline-form-group wide">
              <StudioIcon name="person" />
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Client Name" required />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="phone" />
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Phone Number" />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="email" />
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="Email Address" />
            </div>
            
            <div className="inline-form-group">
              <StudioIcon name="receipt" />
              <input type="text" name="gstin" value={formData.gstin || ''} onChange={handleInputChange} placeholder="GSTIN" />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="badge" />
              <input type="text" name="pan" value={formData.pan || ''} onChange={handleInputChange} placeholder="PAN" />
            </div>

            <div className="inline-form-group full-width" style={{ gridColumn: '1 / -1' }}>
              <StudioIcon name="add_location" />
              <textarea name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Billing Address..." rows={2} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
            </div>

            <button type="submit" className="form-button" disabled={isSubmitting} style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '8px' }}>
              <StudioIcon name="save" />
              {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Client')}
            </button>
          </form>
        </section>
      </div>

      <div className="pill-list-container">
        <div className="section-label">
          <StudioIcon name="groups" />
          <span>Saved Clients</span>
        </div>
        
        {isLoadingCustomers ? (
          <div className="empty-state">Loading clients...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No clients found. Add one to get started!</div>
        ) : (
          <div className="pill-list">
            {customers.map(client => (
              <ClientPillRow 
                key={client.id} 
                client={client} 
                onEdit={openEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
