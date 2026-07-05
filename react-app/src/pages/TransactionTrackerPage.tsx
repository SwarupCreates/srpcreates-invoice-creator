import { useFinance } from '../context/FinanceContext';
import { StudioIcon } from './shared';
import '../styles/TransactionTrackerPage.css';

export function TransactionTrackerPage() {
  const { invoices, isLoadingInvoices } = useFinance();

  return (
    <div className="transaction-tracker-page" style={{ padding: '24px', color: 'var(--text)' }}>
      <h2>Transaction Tracker (Raw Data)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Ready for Figma styles!
      </p>

      {isLoadingInvoices ? (
        <div>Loading transactions...</div>
      ) : invoices.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '12px 8px' }}>Invoice #</th>
              <th style={{ padding: '12px 8px' }}>Date</th>
              <th style={{ padding: '12px 8px' }}>Client</th>
              <th style={{ padding: '12px 8px' }}>Project</th>
              <th style={{ padding: '12px 8px' }}>Amount (₹ (INR))</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 8px' }}>{inv.id}</td>
                <td style={{ padding: '12px 8px' }}>{new Date(inv.date).toLocaleDateString()}</td>
                <td style={{ padding: '12px 8px' }}>{inv.customerName}</td>
                <td style={{ padding: '12px 8px' }}>{inv.projectName}</td>
                <td style={{ padding: '12px 8px' }}>{inv.totalAmount}</td>
                <td style={{ padding: '12px 8px' }}>{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
