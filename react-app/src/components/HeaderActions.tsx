import type { RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { StudioIcon } from '../pages/shared';
import { useFinance } from '../context/FinanceContext';
import './HeaderActions.css';

export function HeaderActions({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  fromDateRef,
  toDateRef,
  startNextInvoice,
  exportPdf,
  isExporting,
  saveInvoiceToDb,
  isSaving,
  toggleAddRecord,
  isAddRecordOpen,
  isAddClientOpen,
  isChartOpen,
  toggleChart,
}: {
  fromDate: string;
  toDate: string;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  fromDateRef: RefObject<HTMLInputElement | null>;
  toDateRef: RefObject<HTMLInputElement | null>;
  startNextInvoice: () => void;
  exportPdf: () => void;
  isExporting: boolean;
  saveInvoiceToDb?: () => void;
  isSaving?: boolean;
  toggleAddRecord?: () => void;
  isAddRecordOpen?: boolean;
  isAddClientOpen?: boolean;
  isChartOpen?: boolean;
  toggleChart?: () => void;
}) {
  const location = useLocation();
  const { invoices, refreshInvoices, isLoadingInvoices, customers, refreshCustomers, isLoadingCustomers } = useFinance();

  const handleCsvExport = () => {
    if (!invoices || invoices.length === 0) {
      alert("No invoices to export!");
      return;
    }
    const headers = ["Invoice ID,Date,Client,Project,Amount (₹ (INR)),Status"];
    const rows = invoices.map(i => `${i.id},${i.date},"${i.customerName}","${i.projectName}",${i.totalAmount},${i.status}`);
    const csvData = headers.concat(rows).join("\n");
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoices_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (location.pathname === '/dashboard') {
    return (
      <div className="date-controls" aria-label="Dashboard range">
        <div className="date-pill" style={{ position: 'relative', overflow: 'hidden' }}>
          <span>From</span>
          <i aria-hidden="true" />
          <StudioIcon name="calendar_month" />
          {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          <input
            ref={fromDateRef}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onClick={(e) => {
              try {
                if ('showPicker' in e.target) {
                  (e.target as HTMLInputElement).showPicker();
                }
              } catch (err) {}
            }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          />
        </div>

        <div className="date-pill" style={{ position: 'relative', overflow: 'hidden' }}>
          <span>To</span>
          <i aria-hidden="true" />
          <StudioIcon name="calendar_month" />
          {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          <input
            ref={toDateRef}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onClick={(e) => {
              try {
                if ('showPicker' in e.target) {
                  (e.target as HTMLInputElement).showPicker();
                }
              } catch (err) {}
            }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          />
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/invoice')) {
    const isEditing = location.pathname.startsWith('/invoice/edit');
    return (
      <div className="invoice-actions">
        <button type="button" className="secondary-button" onClick={startNextInvoice}>
          <StudioIcon name="add" />
          New
        </button>
        {isEditing ? (
          <>
            <button type="button" className="secondary-button" onClick={exportPdf} disabled={isExporting || isSaving}>
              <StudioIcon name="download" />
              {isExporting ? 'Exporting...' : 'Re-Export'}
            </button>
            <button type="button" className="primary-button" onClick={saveInvoiceToDb} disabled={isSaving || isExporting}>
              <StudioIcon name="save" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button type="button" className="primary-button" onClick={exportPdf} disabled={isExporting || isSaving}>
            <StudioIcon name="download" />
            {isExporting ? 'Exporting...' : 'Upload & Export PDF'}
          </button>
        )}
      </div>
    );
  }

  if (location.pathname === '/transactions') {
    return (
      <div className="invoice-actions">
        <button type="button" className="secondary-button" onClick={refreshInvoices} disabled={isLoadingInvoices}>
          <StudioIcon name="refresh" />
          {isLoadingInvoices ? 'Refreshing' : 'Refresh'}
        </button>
        <button type="button" className="secondary-button" onClick={handleCsvExport}>
          <StudioIcon name="download" />
          Export in Excel
        </button>
        <button type="button" className={isChartOpen ? "primary-button" : "secondary-button"} onClick={toggleChart}>
          <StudioIcon name={isChartOpen ? "close" : "show_chart"} />
          {isChartOpen ? "Close Chart" : "View Chart"}
        </button>
        <button type="button" className={isAddRecordOpen ? "secondary-button" : "primary-button"} onClick={toggleAddRecord}>
          <StudioIcon name={isAddRecordOpen ? "close" : "add"} />
          {isAddRecordOpen ? "Close Panel" : "Add New Record"}
        </button>
      </div>
    );
  }

  const handleClientCsvExport = () => {
    if (!customers || customers.length === 0) {
      alert("No clients to export!");
      return;
    }
    const headers = ["Client ID,Name,Phone,Email,GSTIN,PAN,Billing Address"];
    const rows = customers.map(c => `"${c.id}","${c.name}","${c.phone || ''}","${c.email || ''}","${c.gstin || ''}","${c.pan || ''}","${(c.address || '').replace(/\n/g, ' ')}"`);
    const csvData = headers.concat(rows).join("\n");
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clients_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (location.pathname === '/clients') {
    return (
      <div className="invoice-actions">
        <button type="button" className="secondary-button" onClick={refreshCustomers} disabled={isLoadingCustomers}>
          <StudioIcon name="refresh" />
          {isLoadingCustomers ? 'Refreshing' : 'Refresh'}
        </button>
        <button type="button" className="secondary-button" onClick={handleClientCsvExport}>
          <StudioIcon name="download" />
          Export in Excel
        </button>
        <button type="button" className={isAddClientOpen ? "secondary-button" : "primary-button"} onClick={toggleAddRecord}>
          <StudioIcon name={isAddClientOpen ? "close" : "add"} />
          {isAddClientOpen ? "Close Panel" : "Add New Client"}
        </button>
      </div>
    );
  }

  return null;
}
