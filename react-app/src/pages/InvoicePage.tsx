import { useEffect, useRef, useState, type RefObject } from 'react'
import { defaultTypes, formatDisplayDate, formatLineAmount, formatTotal, DetailLine, StudioIcon, MailIcon, PhoneIcon, GlobeIcon, bankDetails, invoicePreviewAssets, type ContactInfo, type InvoiceItem } from './shared'
import { CustomDropdown } from '../components/CustomDropdown'

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
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    // Auto-fit to container width initially and on resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        // 794 is the hardcoded width of .invoice-sheet. 36 is the padding (18px * 2)
        const fitScale = Math.min(1, (containerWidth - 36) / 794)
        setZoom(fitScale)
      }
    })
    resizeObserver.observe(container)

    // Free-hand zoom with Ctrl/Cmd + scroll
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom((prev) => Math.max(0.1, Math.min(prev - e.deltaY * 0.005, 3)))
      }
    }
    
    container.addEventListener('wheel', handleNativeWheel, { passive: false })
    
    return () => {
      resizeObserver.disconnect()
      container.removeEventListener('wheel', handleNativeWheel)
    }
  }, [])

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

        <div className="preview-scroll" ref={previewContainerRef}>
          <div style={{ width: 794 * zoom, height: 1123 * zoom, flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <div className="invoice-sheet" ref={previewRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <header className="invoice-letterhead">
              <img src={invoicePreviewAssets.letterheadLogo} alt="SRP Creates" className="invoice-logo" />
              {/* <div className="invoice-designs-text">DESIGNS</div> */}
              <div className="invoice-title-block">
                <h2>INVOICE</h2>
                <p>
                  INVOICE_NO: <span>{invoiceId}</span>
                </p>
              </div>
            </header>

            <div className="invoice-contact-strip">
              <div>
                <MailIcon />
                <span>srpcreates@gmail.com</span>
              </div>
              <div>
                <PhoneIcon />
                <span>9051477045</span>
              </div>
              <div>
                <GlobeIcon />
                <span>srpcreates.framer.website</span>
              </div>
            </div>

            <main className="invoice-body">
              <img src={invoicePreviewAssets.logoMark} alt="" className="invoice-watermark" />

              <section className="invoice-bill-row">
                <div className="invoice-client">
                  <p>
                    <span className="invoice-label">Bill To:</span> {customerName || 'CLIENT NAME'}
                  </p>
                  {billingLines.length ? billingLines.filter(line => line !== 'NIL').map((line) => <DetailLine key={line} line={line} />) : <p>Billing address</p>}
                  {contactInfo.gstin && contactInfo.gstin !== 'NIL' && <DetailLine key="gstin" line={`GSTIN: ${contactInfo.gstin}`} />}
                  {contactInfo.pan && contactInfo.pan !== 'NIL' && <DetailLine key="pan" line={`PAN NO.: ${contactInfo.pan}`} />}
                  {contactInfo.email && contactInfo.email !== 'NIL' && <DetailLine key="email" line={`Email: ${contactInfo.email}`} />}
                </div>
                <div className="invoice-date">DATE: {formatDisplayDate(invoiceDate)}</div>
              </section>

              <section className="invoice-project">
                <p>Project Name:</p>
                <h1>{projectName || 'Project name'}</h1>
              </section>

              <section className="invoice-items">
                <div className="invoice-table-head">
                  <span>Sl No.</span>
                  <span>Job Item(s)</span>
                  <span>Type</span>
                  <span>Price</span>
                  <span>Total Compensation</span>
                </div>

                <div className="invoice-table-body">
                  <div className="invoice-line-items">
                    {items.map((item, index) => (
                      <div key={item.id} className="invoice-table-row">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span>{item.description || 'Item description'}</span>
                        <span>{item.type}</span>
                        <span>{formatLineAmount(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="invoice-total-lockup">
                    <span>₹ (INR)</span>
                    <strong>{formatTotal(totalAmount)}</strong>
                  </div>
                </div>
              </section>

              <footer className="invoice-footer">
                <div className="invoice-bank-details">
                  {bankDetails.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <span className="bank-val">{value}</span>
                    </p>
                  ))}
                </div>

                <div className="invoice-signature">
                  <img src={invoicePreviewAssets.signatureImage} alt="" />
                  <div />
                  <span className="sig-name">SWARUP RANJAN PAUL</span>
                </div>
              </footer>
            </main>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
