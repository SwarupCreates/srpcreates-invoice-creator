import { useState } from 'react';
import { StudioIcon } from '../pages/shared';
import type { Invoice } from '../api/types';
import './InvoicePillRow.css';

export function InvoicePillRow({ 
  invoice, 
  onMarkFulfilled,
  onMarkPending,
  onEdit,
  onDelete,
  onClick 
}: { 
  invoice: Invoice | { id: string, date?: string, projectName?: string, customerName?: string, totalAmount: number | string, status: string, project?: string, amount?: number | string, client?: string };
  onMarkFulfilled?: (id: string) => void;
  onMarkPending?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleAction = (e: React.MouseEvent, action: 'fulfill' | 'pending') => {
    e.stopPropagation();
    if (action === 'fulfill' && onMarkFulfilled) {
      setIsDismissing(true);
      setTimeout(() => {
        onMarkFulfilled(invoice.id);
        setIsDismissing(false); // Reset in case it stays in DOM
      }, 400); 
    } else if (action === 'pending' && onMarkPending) {
      setIsDismissing(true);
      setTimeout(() => {
        onMarkPending(invoice.id);
        setIsDismissing(false);
      }, 400);
    }
  };

  const status = invoice.status || 'Pending';
  const isFulfilled = status === 'Fulfilled';

  let iconClass = 'status-pending';

  if (status === 'Cancelled') {
    iconClass = 'status-cancelled';
  } else if (isFulfilled) {
    iconClass = 'status-fulfilled';
  }

  const projectStr = ('project' in invoice ? invoice.project : invoice.projectName) || 'Unknown';
  const clientStr = ('client' in invoice ? invoice.client : ('customerName' in invoice ? invoice.customerName : 'Unknown'));
  const amount = 'amount' in invoice ? invoice.amount : invoice.totalAmount;
  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date';

  return (
    <div className={`invoice-pill-wrapper ${isDismissing ? 'dismissing' : ''}`}>
      <div 
        className={`invoice-pill ${onClick ? 'interactive' : ''}`} 
        onClick={() => onClick && onClick(invoice.id)}
      >
        <div className="pill-segment pill-left">
          <span className={`pill-icon ${iconClass}`}>
            <StudioIcon name="forward_to_inbox" filled />
          </span>
          <span className="pill-id">{invoice.id}</span>
        </div>
        <div className="pill-segment hide-mobile">
          <span className="pill-project">{projectStr}</span>
        </div>
        <div className="pill-segment hide-mobile">
          <span className="pill-client">{clientStr}</span>
        </div>
        <div className="pill-segment hide-mobile">
          <span className="pill-date">{dateStr}</span>
        </div>
        <div className="pill-segment pill-right">
          <b className="pill-amount">{amount} ₹ (INR)</b>
        </div>
      </div>
      
      <div className="pill-actions-group">
        {!isFulfilled && onMarkFulfilled && (
          <button type="button" className="success-button icon-only" onClick={(e) => handleAction(e, 'fulfill')} title="Mark as fulfilled">
            <StudioIcon name="approval_delegation" filled />
          </button>
        )}

        {isFulfilled && onMarkPending && (
          <button type="button" className="pending-button icon-only" onClick={(e) => handleAction(e, 'pending')} title="Mark as pending">
            <StudioIcon name="history_toggle_off" filled />
          </button>
        )}

        {onEdit && (
          <button type="button" className="edit-button icon-only" onClick={(e) => { e.stopPropagation(); onEdit(invoice.id); }} title="Edit transaction">
            <StudioIcon name="edit" />
          </button>
        )}

        {onDelete && (
          <button type="button" className="delete-button icon-only" onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); }} title="Delete transaction">
            <StudioIcon name="delete" />
          </button>
        )}
      </div>
    </div>
  );
}
