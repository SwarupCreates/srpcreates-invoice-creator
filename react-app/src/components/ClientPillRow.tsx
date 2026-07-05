import { useState } from 'react';
import type { Customer } from '../api/types';
import { StudioIcon } from '../pages/shared';
import '../components/InvoicePillRow.css';

export function ClientPillRow({ 
  client, 
  onEdit, 
  onDelete 
}: { 
  client: Customer, 
  onEdit: (client: Customer) => void,
  onDelete: (id: string, name: string) => void 
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="invoice-pill-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="invoice-pill interactive" onClick={() => onEdit(client)}>
        <div className="pill-left pill-segment">
          <div className="pill-icon" style={{ color: 'var(--text)' }}>
            <StudioIcon name="person" />
          </div>
          <span className="pill-id" style={{ minWidth: '100px' }}>{client.id}</span>
        </div>

        <div className="pill-center pill-segment">
          <span style={{ fontWeight: 650 }}>
            {client.name.length > 25 ? client.name.substring(0, 25) + '...' : client.name}
          </span>
        </div>

        <div className="pill-center pill-segment hide-mobile">
          <span className="pill-date">{client.phone || 'No phone'}</span>
        </div>

        <div className="pill-center pill-segment hide-mobile">
          <span className="pill-date">{client.email || 'No email'}</span>
        </div>

        <div className="pill-center pill-segment hide-mobile">
          <span className="pill-date">{client.gstin ? `GST: ${client.gstin}` : 'No GSTIN'}</span>
        </div>

        <div className="pill-right pill-segment" style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: '30px' }}>
          <span className="pill-amount" style={{ visibility: isHovered ? 'hidden' : 'visible' }}>
            <StudioIcon name="chevron_right" />
          </span>
        </div>
      </div>

      <div className="pill-action">
        <button 
          className="pending-button"
          onClick={(e) => { e.stopPropagation(); onEdit(client); }}
          title="Edit Client"
          style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        >
          <StudioIcon name="edit" />
        </button>
        <button 
          className="pending-button"
          onClick={(e) => { e.stopPropagation(); onDelete(client.id, client.name); }}
          title="Delete Client"
          style={{ borderLeft: '1px solid var(--border)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, color: '#ff4d4d' }}
        >
          <StudioIcon name="delete" />
        </button>
      </div>
    </div>
  );
}
