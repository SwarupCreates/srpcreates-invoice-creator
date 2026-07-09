import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudioIcon, formatTotal, exportInvoiceToPdf } from './shared'
import { useFinance } from '../context/FinanceContext'
import { InvoicePillRow } from '../components/InvoicePillRow'
import { IncomeChartCard } from '../components/IncomeChartCard'
import { InvoicePreview } from '../components/InvoicePreview'
import { invoiceApi } from '../api/invoiceApi'
import type { Invoice } from '../api/types'

export type DashboardLineItem = {
  label: string
  amount: number
}

// We will use a state variable for this instead of a constant.

function getDynamicScale(value: number, benchmark: number) {
  const step = benchmark / 2;
  if (value <= benchmark || step === 0) {
    return {
      min: 0,
      max: benchmark,
      scale: ['0L', `${(step / 100000).toFixed(1).replace(/\.0$/, '')}L`, `${(benchmark / 100000).toFixed(1).replace(/\.0$/, '')}L`]
    };
  }
  const diff = value - benchmark;
  const stepsToShift = Math.floor(diff / step) + 1;
  const newMax = benchmark + (stepsToShift * step);
  const mid = newMax - step;
  const newMin = mid - step;
  return {
    min: newMin,
    max: newMax,
    scale: [
      `${(newMin / 100000).toFixed(1).replace(/\.0$/, '')}L`, 
      `${(mid / 100000).toFixed(1).replace(/\.0$/, '')}L`, 
      `${(newMax / 100000).toFixed(1).replace(/\.0$/, '')}L`
    ]
  };
}

// Shared utility to calculate color based on value vs benchmark
function getProgressAccent(value: number, benchmark: number): 'red' | 'orange' | 'gold' | 'green' {
  const ratio = value / benchmark;
  if (ratio >= 0.95) return 'green';
  if (ratio >= 0.5) return 'gold';
  if (ratio >= 0.25) return 'orange';
  return 'red';
}

function DashboardMetricCard({
  title,
  icon,
  value,
  min = 0,
  max,
  accent,
  scale,
  items,
  emptyLabel,
  itemIcon,
  itemAccent,
  listClassName,
}: {
  title: string
  icon: string
  value: number
  min?: number
  max: number
  accent: 'red' | 'orange' | 'gold' | 'green'
  scale: string[]
  items: DashboardLineItem[]
  emptyLabel: string
  itemIcon: string
  itemAccent: 'red' | 'orange' | 'gold' | 'green' | 'muted'
  listClassName?: string
}) {
  const range = max - min;
  const progress = range > 0 ? Math.max(0, Math.min(((value - min) / range) * 100, 100)) : 0;

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
          {scale.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>
      </div>

      <div className={`metric-list ${listClassName || ''}`}>
        {items.length ? (
          items.map((item, idx) => (
            <div className="metric-row" key={item.label + idx}>
              <span className={`status-dot ${itemAccent}`}>
                <StudioIcon name={itemIcon} filled />
              </span>
              <span className="metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              <span>{formatTotal(item.amount)} INR</span>
            </div>
          ))
        ) : (
          <div className="metric-row empty">
            <span className="status-dot muted">
              <StudioIcon name="remove" />
            </span>
            <span className="metric-label">{emptyLabel}</span>
            <span>0 INR</span>
          </div>
        )}
      </div>
    </article>
  )
}

function RatingCard({ predictedTotal, benchmark }: { predictedTotal: number, benchmark: number }) {
  // Calculate dynamic rating 0-5
  const rating = benchmark > 0 
    ? Math.min((predictedTotal / benchmark) * 5, 5) 
    : 0;
  
  const filledCount = Math.floor(rating);

  return (
    <div className="rating-card">
      <span className="rating-label">Month Rating</span>
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

function RecentPendingInvoices({ invoices, onOpenInvoice, onDismiss }: { invoices: Invoice[], onOpenInvoice: (id: string) => void, onDismiss: (id: string) => void }) {
  return (
    <div className="metric-card span-2 pending-invoices-card">
      <div className="section-label">
        <StudioIcon name="history_toggle_off" />
        <span>Recent Pending Invoices</span>
      </div>
      {invoices.length > 0 ? (
        <div className="pill-list-container">
          <div className="pill-list">
            {invoices.map(inv => (
              <InvoicePillRow 
                key={inv.id}
                invoice={inv} 
                onMarkFulfilled={onDismiss} 
                onView={onOpenInvoice} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <StudioIcon name="task_alt" />
          <p>No pending invoices. You're all caught up!</p>
        </div>
      )}
    </div>
  );
}

function MoreTools({ onCreateInvoice, onChangeBenchmark }: { onCreateInvoice: () => void, onChangeBenchmark: () => void }) {
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
        <button type="button" className="tool-button" onClick={onChangeBenchmark}>
          <StudioIcon name="star_shine" filled />
          Change Monthly Benchmark
        </button>
      </div>
    </section>
  )
}

export function DashboardPage({ 
  onCreateInvoice,
  fromDate: _fromDate,
  toDate: _toDate
}: { 
  onCreateInvoice: () => void;
  fromDate?: string;
  toDate?: string;
}) {
  // Using a state to manage which invoice is being viewed in the modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  
  // Benchmark state
  const [monthlyBenchmark, setMonthlyBenchmark] = useState<number>(() => {
    const saved = localStorage.getItem('srp_monthly_benchmark');
    return saved ? parseInt(saved, 10) : 100000;
  });
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);

  const { invoices, markInvoicePaid, customers } = useFinance();

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (_fromDate) {
      const from = new Date(_fromDate).getTime();
      result = result.filter(inv => new Date(inv.date).getTime() >= from);
    }
    if (_toDate) {
      const to = new Date(_toDate).getTime();
      result = result.filter(inv => new Date(inv.date).getTime() <= to);
    }
    return result;
  }, [invoices, _fromDate, _toDate]);

  const { totalEarnings, pendingAmounts, settledItems, pendingItems, pendingInvoicesData } = useMemo(() => {
    const paid = filteredInvoices.filter(i => i.status === 'Fulfilled' || i.status === 'Paid');
    const pending = filteredInvoices.filter(i => i.status === 'Pending' || i.status === 'Sent' || i.status === 'Overdue');
    
    return {
      totalEarnings: paid.reduce((sum, inv) => sum + inv.totalAmount, 0),
      pendingAmounts: pending.reduce((sum, inv) => sum + inv.totalAmount, 0),
      settledItems: paid.map(inv => ({ 
        label: inv.customerName.length > 12 ? inv.customerName.substring(0, 12) + '...' : inv.customerName, 
        amount: inv.totalAmount 
      })),
      pendingItems: pending.map(inv => ({ 
        label: inv.customerName.length > 12 ? inv.customerName.substring(0, 12) + '...' : inv.customerName, 
        amount: inv.totalAmount 
      })),
      pendingInvoicesData: pending
    };
  }, [filteredInvoices]);

  const predictedTotal = totalEarnings + pendingAmounts;

  const handleDismissPending = async (id: string) => {
    await markInvoicePaid(id);
  };

  const handleViewClick = async (id: string) => {
    setSelectedInvoiceId(id);
    setIsPreviewLoading(true);
    const res = await invoiceApi.getById(id);
    if (res.success && res.data) {
      setPreviewInvoice(res.data);
    } else {
      alert("Failed to load invoice details: " + res.message);
      setSelectedInvoiceId(null);
    }
    setIsPreviewLoading(false);
  };

  const handleExportPdf = async () => {
    if (!selectedInvoiceId || !previewRef.current) return;
    try {
      setIsExporting(true);
      await exportInvoiceToPdf(previewRef, selectedInvoiceId);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const earningsAccent = getProgressAccent(totalEarnings, monthlyBenchmark);
  const pendingAccent = getProgressAccent(pendingAmounts, monthlyBenchmark);
  const forecastAccent = getProgressAccent(predictedTotal, monthlyBenchmark);

  const earningsScaleData = getDynamicScale(totalEarnings, monthlyBenchmark);
  const pendingScaleData = getDynamicScale(pendingAmounts, monthlyBenchmark);
  const forecastScaleData = getDynamicScale(predictedTotal, monthlyBenchmark);

  const forecastRange = forecastScaleData.max - forecastScaleData.min;
  const forecastProgress = forecastRange > 0 
    ? Math.max(0, Math.min(((predictedTotal - forecastScaleData.min) / forecastRange) * 100, 100)) 
    : 0;
  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <DashboardMetricCard
          title="Total Earnings"
          icon="payment_arrow_down"
          value={totalEarnings}
          min={earningsScaleData.min}
          max={earningsScaleData.max}
          accent={earningsAccent}
          scale={earningsScaleData.scale}
          items={settledItems}
          emptyLabel="No earnings yet"
          itemIcon="check"
          itemAccent="green"
        />
        <DashboardMetricCard
          title="Pending Amount"
          icon="sync"
          value={pendingAmounts}
          min={pendingScaleData.min}
          max={pendingScaleData.max}
          accent={pendingAccent}
          scale={pendingScaleData.scale}
          items={pendingItems}
          emptyLabel="No pending amounts"
          itemIcon="sync"
          itemAccent="gold"
          listClassName="pending-amount-list"
        />
        <article className="metric-card forecast-card">
          <div className="metric-title">
            <StudioIcon name="account_balance_wallet" />
            <span>Predicted Total by July 01, 2026</span>
          </div>

          <div className="amount-panel">
            <div className="amount-lockup">
              <strong>{formatTotal(predictedTotal)}</strong>
              <span> INR</span>
            </div>
            <div className="range-track">
              <span className={`range-fill ${forecastAccent}`} style={{ width: `${forecastProgress}%` }} />
            </div>
            <div className="range-scale">
              {forecastScaleData.scale.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
          </div>

          <RatingCard predictedTotal={predictedTotal} benchmark={monthlyBenchmark} />
        </article>
      </div>

      <IncomeChartCard invoices={invoices} />

      <RecentPendingInvoices invoices={pendingInvoicesData} onOpenInvoice={handleViewClick} onDismiss={handleDismissPending} />
      <MoreTools onCreateInvoice={onCreateInvoice} onChangeBenchmark={() => setIsBenchmarkModalOpen(true)} />

      {/* MODAL OVERLAY */}
      {selectedInvoiceId && (
        <div className="invoice-modal-backdrop benchmark-modal-backdrop" onClick={() => { setSelectedInvoiceId(null); }}>
          <div className="invoice-modal-container benchmark-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-heading" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', margin: 0 }}>
              <div>
                <h2>{selectedInvoiceId}</h2>
              </div>
              <div className="modal-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="secondary-button" onClick={() => { setSelectedInvoiceId(null); }}>
                  Close
                </button>
                <button type="button" className="secondary-button" onClick={() => {
                  navigate(`/invoice/edit/${selectedInvoiceId}`);
                  setSelectedInvoiceId(null); 
                }}>
                  <StudioIcon name="edit" />
                  Edit as Invoice
                </button>
                <button type="button" className="primary-button" onClick={handleExportPdf} disabled={isExporting || !previewInvoice}>
                  <StudioIcon name="download" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>
            
            <div className="invoice-modal-body" style={{ padding: 0, flex: 1, overflowY: 'auto', background: 'rgba(230,230,230, 0.1)', width: '100%', display: 'block' }}>
              {isPreviewLoading || !previewInvoice ? (
                <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <StudioIcon name="hourglass_empty" />
                  <p>Loading invoice details...</p>
                </div>
              ) : (
                (() => {
                  const previewCustomer = customers.find(c => c.name === previewInvoice.customerName);
                  const billingAddress = previewCustomer?.address || '';
                  const billingLines = billingAddress.split(/\r?\n/).filter(Boolean);
                  const contactInfo = {
                    email: previewCustomer?.email || 'srpcreates@gmail.com',
                    phone: previewCustomer?.phone || '9051477045',
                    website: 'srpcreates.framer.website',
                    pan: previewCustomer?.pan || '',
                    gstin: previewCustomer?.gstin || ''
                  };
                  return (
                    <InvoicePreview 
                      invoiceDate={previewInvoice.date}
                      invoiceId={previewInvoice.id}
                      projectName={previewInvoice.projectName}
                      customerName={previewInvoice.customerName}
                      billingLines={billingLines}
                      contactInfo={contactInfo}
                      items={previewInvoice.items || []}
                      totalAmount={previewInvoice.totalAmount}
                      previewRef={previewRef}
                    />
                  )
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* BENCHMARK MODAL */}
      {isBenchmarkModalOpen && (
        <div className="invoice-modal-backdrop benchmark-modal-backdrop" onClick={() => setIsBenchmarkModalOpen(false)}>
          <div className="invoice-modal-container benchmark-modal-container" onClick={e => e.stopPropagation()}>
            <button className="icon-button modal-close-absolute" onClick={() => setIsBenchmarkModalOpen(false)}>
              <StudioIcon name="close" />
            </button>
            <div className="invoice-modal-body benchmark-modal-body">
              <div className="benchmark-display">
                {/* <StudioIcon name="star_shine" /> */}
                <h3>{formatTotal(monthlyBenchmark)} INR</h3>
                <p>Set your target earnings for the month</p>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="400000" 
                step="10000" 
                value={monthlyBenchmark}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setMonthlyBenchmark(val);
                  localStorage.setItem('srp_monthly_benchmark', val.toString());
                }}
                className="benchmark-slider"
              />
              <div className="slider-labels">
                <span>10K</span>
                <span>1L</span>
                <span>2L</span>
                <span>3L</span>
                <span>4L</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}