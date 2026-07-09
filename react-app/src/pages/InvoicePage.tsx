import { type RefObject } from 'react'
import { formatTotal, StudioIcon, defaultTypes, formatDisplayDate, type ContactInfo, type InvoiceItem } from './shared'
import { CustomDropdown } from '../components/CustomDropdown'
import { InvoicePreview } from '../components/InvoicePreview'

export function InvoicePage({
  invoiceDate,
  setInvoiceDate,
  invoiceId,
  setInvoiceId,
  projectName,
  setProjectName,
  customerName,
  setCustomerName,
  billingAddress,
  setBillingAddress,
  billingLines,
  contactInfo,
  setContactInfo,
  items,
  totalAmount,
  addItem,
  updateItem,
  removeItem,
  previewRef,
  selectedClientId,
  onClientSelect,
  saveNewClient,
  setSaveNewClient,
  customers,
  isLoading
}: {
  invoiceDate: string
  setInvoiceDate: (value: string) => void
  invoiceId: string
  setInvoiceId: (value: string) => void
  projectName: string
  setProjectName: (value: string) => void
  customerName: string
  setCustomerName: (value: string) => void
  billingAddress: string
  setBillingAddress: (value: string) => void
  billingLines: string[]
  contactInfo: ContactInfo
  setContactInfo: (value: ContactInfo) => void
  items: InvoiceItem[]
  totalAmount: number
  addItem: () => void
  updateItem: (id: string, key: keyof InvoiceItem, value: string) => void
  removeItem: (id: string) => void
  previewRef: RefObject<HTMLDivElement | null>
  selectedClientId: string
  onClientSelect: (id: string) => void
  saveNewClient: boolean
  setSaveNewClient: (value: boolean) => void
  customers: import('../api/types').Customer[]
  isLoading?: boolean
}) {
  return (
    <div className="invoice-workspace" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="invoice-loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '18px' }}>Loading invoice data...</p>
        </div>
      )}
      <section className="editor-panel" aria-label="Invoice editor">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Invoice details</span>
            <h2>{invoiceId}</h2>
          </div>
          <span className="total-pill">₹ (INR) {formatTotal(totalAmount)}</span>
        </div>

        <div className="form-grid compact">
          <label>
            <span>Date</span>
            <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }} />
          </label>
          <label>
            <span>invoice_id</span>
            <input type="text" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} />
          </label>
          <label className="wide">
            <span>Project name</span>
            <input type="text" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" />
          </label>
        </div>

        <div className="section-heading">
          <h3>Client</h3>
        </div>

        <div className="form-grid">
          <label className="wide">
            <span>Select Client</span>
            <CustomDropdown
              value={selectedClientId}
              onChange={(value) => onClientSelect(value)}
              placeholder="Please select a client"
              options={[
                { label: "-- Create New Client --", value: "NEW" },
                ...customers.map(c => ({ label: c.name, value: c.id }))
              ]}
            />
          </label>
        </div>

        {selectedClientId === 'NEW' && (
          <>
            <div className="form-grid" style={{ marginTop: '16px' }}>
              <label className="wide">
                <span>Client Name</span>
                <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Client or company name" required />
              </label>
              <label className="wide">
                <span>Phone Number</span>
                <input type="text" value={contactInfo.phone || ''} onChange={(event) => setContactInfo({ ...contactInfo, phone: event.target.value })} placeholder="Phone Number" />
              </label>
              <label className="wide">
                <span>Email Address</span>
                <input type="email" value={contactInfo.email || ''} onChange={(event) => setContactInfo({ ...contactInfo, email: event.target.value })} placeholder="Email Address" />
              </label>
              <label className="wide">
                <span>GSTIN (Optional)</span>
                <input type="text" value={contactInfo.gstin || ''} onChange={(event) => setContactInfo({ ...contactInfo, gstin: event.target.value })} placeholder="GSTIN" />
              </label>
              <label className="wide">
                <span>PAN NO. (Optional)</span>
                <input type="text" value={contactInfo.pan || ''} onChange={(event) => setContactInfo({ ...contactInfo, pan: event.target.value })} placeholder="PAN NO." />
              </label>
              <label className="wide">
                <span>Billing Address</span>
                <textarea value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} placeholder="Full Billing Address" />
              </label>
              
              <label className="wide" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  checked={saveNewClient} 
                  onChange={(e) => setSaveNewClient(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ margin: 0, textTransform: 'none', color: 'var(--text)' }}>Save client information</span>
              </label>
            </div>
          </>
        )}

        <div className="items-toolbar">
          <h3>Job items</h3>
          <button type="button" className="icon-text-button" onClick={addItem}>
            <StudioIcon name="add" />
            Add row
          </button>
        </div>

        <div className="item-editor-table">
          <div className="item-editor-head">
            <span>Item</span>
            <span>Type</span>
            <span>Price</span>
            <span aria-hidden="true" />
          </div>

          {items.map((item) => (
            <div key={item.id} className="item-editor-row">
              <input type="text" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Job item" />
              <CustomDropdown
                value={item.type}
                onChange={(value) => updateItem(item.id, 'type', value)}
                options={defaultTypes.map(typeOption => ({ label: typeOption, value: typeOption }))}
              />
              <input type="number" min="0" value={item.price} onChange={(event) => updateItem(item.id, 'price', event.target.value)} placeholder="0" />
              <button type="button" className="icon-button danger" onClick={() => removeItem(item.id)} aria-label="Remove row">
                <StudioIcon name="delete" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="preview-panel" aria-label="Invoice preview">
        <div className="preview-toolbar">
          <div>
            <span className="section-kicker">A4 preview</span>
            <h2>PDF output</h2>
          </div>
          <span>{formatDisplayDate(invoiceDate)}</span>
        </div>

        <InvoicePreview 
          invoiceDate={invoiceDate}
          invoiceId={invoiceId}
          projectName={projectName}
          customerName={customerName}
          billingLines={billingLines}
          contactInfo={contactInfo}
          items={items}
          totalAmount={totalAmount}
          previewRef={previewRef}
        />
      </section>
    </div>
  )
}
