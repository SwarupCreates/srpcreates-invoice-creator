import { useState } from 'react'
import { StudioIcon, formatTotal } from './shared'

export type DashboardLineItem = {
  label: string
  amount: number
}

type DashboardInvoice = {
  id: string
  project: string
  amount: number
}

// TODO: This benchmark will eventually be saved/fetched from the backend DB.
// Hardcoded to 1 Lakh (100,000 INR) for now to drive the color and scale states.
const MONTHLY_BENCHMARK = 100000;

// Shared utility to calculate color based on value vs benchmark
function getProgressAccent(value: number, benchmark: number): 'red' | 'orange' | 'gold' | 'green' {
  const ratio = value / benchmark;
  if (ratio >= 0.95) return 'green';
  if (ratio >= 0.5) return 'gold';
  if (ratio >= 0.25) return 'orange';
  return 'red';
}

const settledItems: DashboardLineItem[] = []
const pendingItems: DashboardLineItem[] = []
const recentPendingInvoices: DashboardInvoice[] = [
  // 💡 UNCOMMENT THESE DUMMY ITEMS TO TEST THE HOVER AND DISMISS ANIMATIONS 💡
  // { id: 'SRP22052026-01', project: 'Sunrise Bengal April Actuals 2026', amount: 9000 },
  // { id: 'SRP22052026-02', project: 'Sunrise Bengal Poila Baishakh Curated Gifting - 2026', amount: 9000 },
]

function DashboardMetricCard({
  title,
  icon,
  value,
  max,
  accent,
  scale,
  items,
  emptyLabel,
}: {
  title: string
  icon: string
  value: number
  max: number
  accent: 'red' | 'orange' | 'gold' | 'green'
  scale: string[]
  items: DashboardLineItem[]
  emptyLabel: string
}) {
  const progress = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <article className="metric-card">
      <div className="metric-title">
        <StudioIcon name={icon} />
        <span>{title}</span>
      </div>

      <div className="amount-panel">
        <div className="amount-lockup">
          <strong>{formatTotal(value)}</strong>
          <span>INR</span>
        </div>
        <div className="range-track">
          <span className={`range-fill ${accent}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="range-scale">
          {scale.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="metric-list">
        {items.length ? (
          items.map((item) => (
            <div className="metric-row" key={item.label}>
              <span className={`status-dot ${accent}`}>
                <StudioIcon name={accent === 'green' ? 'check' : 'schedule'} filled />
              </span>
              <strong>{item.label}</strong>
              <span>{formatTotal(item.amount)} INR</span>
            </div>
          ))
        ) : (
          <div className="metric-row empty">
            <span className="status-dot muted">
              <StudioIcon name="remove" />
            </span>
            <strong>{emptyLabel}</strong>
            <span>0 INR</span>
          </div>
        )}
      </div>
    </article>
  )
}

function RatingCard({ predictedTotal }: { predictedTotal: number }) {
  // Calculate dynamic rating 0-5
  const rating = MONTHLY_BENCHMARK > 0 
    ? Math.min((predictedTotal / MONTHLY_BENCHMARK) * 5, 5) 
    : 0;
  
  const filledCount = Math.floor(rating);

  return (
    <div className="rating-card">
      <strong>Month Rating</strong>
      <div className="stars" aria-label={`${rating} star month rating`}>
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled = index < filledCount;
          return (
             <span key={index} className={isFilled ? 'filled' : 'muted'}>
                <StudioIcon name="star" filled={isFilled} />
             </span>
          )
        })}
      </div>
      <span>{rating === 0 ? 'Awaiting data' : rating >= 4 ? 'Awesome!' : 'On track'}</span>
    </div>
  )
}

function PendingInvoiceRow({ 
  invoice, 
  onDismiss, 
  onClick 
}: { 
  invoice: DashboardInvoice, 
  onDismiss: (id: string) => void, 
  onClick: (id: string) => void 
}) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleMarkReceived = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    setIsDismissing(true);
    // Wait for the slide-out animation to finish before removing from state
    setTimeout(() => onDismiss(invoice.id), 400); 
  };

  return (
    <div 
      className={`pending-row interactive ${isDismissing ? 'dismissing' : ''}`} 
      onClick={() => onClick(invoice.id)}
    >
      <span className="pending-icon">
        <StudioIcon name="outgoing_mail" filled />
      </span>
      <strong>{invoice.id}</strong>
      <span>{invoice.project}</span>
      <b>{formatTotal(invoice.amount)} INR</b>
      
      <div className="action-cell">
        <button type="button" className="success-button" onClick={handleMarkReceived}>
          <StudioIcon name="handshake" filled />
          Mark as received
        </button>
      </div>
    </div>
  )
}

function RecentPendingInvoices({ onOpenInvoice }: { onOpenInvoice: (id: string) => void }) {
  // Local state to handle the dismissal animations instantly
  const [invoices, setInvoices] = useState<DashboardInvoice[]>(recentPendingInvoices);

  const handleDismiss = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    // TODO: Trigger actual backend mark-as-paid sync here
  };

  return (
    <section className="studio-section pending-section">
      <div className="section-label">
        <StudioIcon name="history_toggle_off" />
        <span>Recent Pending Invoices</span>
      </div>

      <div className="pending-list">
        {invoices.length ? (
          invoices.map((invoice) => (
            <PendingInvoiceRow 
              key={invoice.id} 
              invoice={invoice} 
              onDismiss={handleDismiss} 
              onClick={onOpenInvoice} 
            />
          ))
        ) : (
          <div className="pending-row empty">
            <span className="pending-icon">
              <StudioIcon name="outgoing_mail" filled />
            </span>
            <strong>No pending invoices</strong>
            <span>Sheet data pending</span>
            <b>0 INR</b>
          </div>
        )}
      </div>
    </section>
  )
}

function MoreTools({ onCreateInvoice }: { onCreateInvoice: () => void }) {
  return (
    <section className="studio-section tools-section">
      <div className="section-label">
        <StudioIcon name="construction" />
        <span>More tools</span>
      </div>

      <div className="tool-grid">
        <button type="button" className="tool-button">
          <StudioIcon name="approval_delegation" filled />
          Bulk Update Invoices
        </button>
        <button type="button" className="tool-button">
          <StudioIcon name="outgoing_mail" filled />
          Send Reminder Mail
        </button>
        <button type="button" className="tool-button" onClick={onCreateInvoice}>
          <StudioIcon name="add_circle" filled />
          Create New Invoice
        </button>
        <button type="button" className="tool-button">
          <StudioIcon name="star_shine" filled />
          Change Monthly Benchmark
        </button>
      </div>
    </section>
  )
}

export function DashboardPage({ 
  onCreateInvoice,
  fromDate,
  toDate
}: { 
  onCreateInvoice: () => void;
  fromDate?: string;
  toDate?: string;
}) {
  // Using a state to manage which invoice is being viewed in the modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // TODO: Use `fromDate` and `toDate` to fetch and filter metric data from the backend here!
  // Example: useEffect(() => { fetchMetrics(fromDate, toDate) }, [fromDate, toDate])

  const totalEarnings = 0;
  const pendingAmounts = 0;
  const predictedTotal = 0;

  const earningsAccent = getProgressAccent(totalEarnings, MONTHLY_BENCHMARK);
  const pendingAccent = getProgressAccent(pendingAmounts, MONTHLY_BENCHMARK);
  const forecastAccent = getProgressAccent(predictedTotal, MONTHLY_BENCHMARK);

  const standardScale = ['0.0L', '0.5L', '1.0L'];
  const forecastScale = ['0.5L', '1.0L', '1.5L'];

  const forecastProgress = MONTHLY_BENCHMARK > 0 
    ? Math.min((predictedTotal / (MONTHLY_BENCHMARK * 1.5)) * 100, 100) 
    : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <DashboardMetricCard
          title="Total Earnings"
          icon="payment_arrow_down"
          value={totalEarnings}
          max={MONTHLY_BENCHMARK}
          accent={earningsAccent}
          scale={standardScale}
          items={settledItems}
          emptyLabel="No synced earnings"
        />
        <DashboardMetricCard
          title="Pending Amounts"
          icon="hourglass_arrow_down"
          value={pendingAmounts}
          max={MONTHLY_BENCHMARK}
          accent={pendingAccent}
          scale={standardScale}
          items={pendingItems}
          emptyLabel="No pending amounts"
        />
        <article className="metric-card forecast-card">
          <div className="metric-title">
            <StudioIcon name="account_balance_wallet" />
            <span>Predicted Total by July 01, 2026</span>
          </div>

          <div className="amount-panel">
            <div className="amount-lockup">
              <strong>{formatTotal(predictedTotal)}</strong>
              <span>INR</span>
            </div>
            <div className="range-track">
              <span className={`range-fill ${forecastAccent}`} style={{ width: `${forecastProgress}%` }} />
            </div>
            <div className="range-scale">
              {forecastScale.map(label => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <RatingCard predictedTotal={predictedTotal} />
        </article>
      </div>

      <RecentPendingInvoices onOpenInvoice={setSelectedInvoiceId} />
      <MoreTools onCreateInvoice={onCreateInvoice} />

      {/* MODAL OVERLAY */}
      {selectedInvoiceId && (
        <div className="invoice-modal-backdrop" onClick={() => setSelectedInvoiceId(null)}>
          <div className="invoice-modal-container" onClick={e => e.stopPropagation()}>
            <header className="invoice-modal-header">
              <h2>Invoice: {selectedInvoiceId}</h2>
              <button className="icon-button" onClick={() => setSelectedInvoiceId(null)}>
                <StudioIcon name="close" />
              </button>
            </header>
            <div className="invoice-modal-body">
              <div className="empty-feature" style={{ minHeight: '400px' }}>
                <StudioIcon name="receipt_long" />
                <h2>Invoice Preview Ready</h2>
                <p>Modularly insert your extracted <b>&lt;InvoicePreview /&gt;</b> component here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}