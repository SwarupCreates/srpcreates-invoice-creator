import type { RefObject } from 'react'
import { defaultTypes, formatDisplayDate, formatLineAmount, formatTotal, DetailLine, StudioIcon, MailIcon, PhoneIcon, GlobeIcon, bankDetails, invoicePreviewAssets, type ContactInfo, type InvoiceItem } from './shared'

export function InvoicePage({
  invoiceDate,
  setInvoiceDate,
  invoiceCount,
  invoiceNumber,
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
}: {
  invoiceDate: string
  setInvoiceDate: (value: string) => void
  invoiceCount: number
  invoiceNumber: string
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
}) {
  return (
    <div className="invoice-workspace">
      <section className="editor-panel" aria-label="Invoice editor">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Invoice details</span>
            <h2>{invoiceNumber}</h2>
          </div>
          <span className="total-pill">INR {formatTotal(totalAmount)}</span>
        </div>

        <div className="form-grid compact">
          <label>
            <span>Date</span>
            <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
          </label>
          <label>
            <span>Sequence</span>
            <input type="text" value={String(invoiceCount).padStart(2, '0')} readOnly />
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
            <span>Bill to</span>
            <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Client or company name" />
          </label>
          <label className="wide">
            <span>Address and tax details</span>
            <textarea value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} placeholder="Address, GSTIN, PAN" />
          </label>
        </div>

        <div className="section-heading">
          <h3>Contact bar</h3>
        </div>

        <div className="form-grid compact">
          <label>
            <span>Email</span>
            <input type="email" value={contactInfo.email} onChange={(event) => setContactInfo({ ...contactInfo, email: event.target.value })} />
          </label>
          <label>
            <span>Phone</span>
            <input type="text" value={contactInfo.phone} onChange={(event) => setContactInfo({ ...contactInfo, phone: event.target.value })} />
          </label>
          <label className="wide">
            <span>Website</span>
            <input type="text" value={contactInfo.website} onChange={(event) => setContactInfo({ ...contactInfo, website: event.target.value })} />
          </label>
        </div>

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
              <select value={item.type} onChange={(event) => updateItem(item.id, 'type', event.target.value)}>
                {defaultTypes.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
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

        <div className="preview-scroll">
          <div className="invoice-sheet" ref={previewRef}>
            <header className="invoice-letterhead">
              <img src={invoicePreviewAssets.letterheadLogo} alt="SRP Creates" className="invoice-logo" />
              {/* <div className="invoice-designs-text">DESIGNS</div> */}
              <div className="invoice-title-block">
                <h2>INVOICE</h2>
                <p>
                  INVOICE_NO: <span>{invoiceNumber}</span>
                </p>
              </div>
            </header>

            <div className="invoice-contact-strip">
              <div>
                <MailIcon />
                <span>{contactInfo.email || 'srpcreates@gmail.com'}</span>
              </div>
              <div>
                <PhoneIcon />
                <span>{contactInfo.phone || '9051477045'}</span>
              </div>
              <div>
                <GlobeIcon />
                <span>{contactInfo.website || 'srpcreates.framer.website'}</span>
              </div>
            </div>

            <main className="invoice-body">
              <img src={invoicePreviewAssets.logoMark} alt="" className="invoice-watermark" />

              <section className="invoice-bill-row">
                <div className="invoice-client">
                  <p>
                    <strong>Bill To:</strong> {customerName || 'CLIENT NAME'}
                  </p>
                  {billingLines.length ? billingLines.map((line) => <DetailLine key={line} line={line} />) : <p>Billing address</p>}
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
                    <span>INR</span>
                    <strong>{formatTotal(totalAmount)}</strong>
                  </div>
                </div>
              </section>

              <footer className="invoice-footer">
                <div className="invoice-bank-details">
                  {bankDetails.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </p>
                  ))}
                </div>

                <div className="invoice-signature">
                  <img src={invoicePreviewAssets.signatureImage} alt="" />
                  <div />
                  <strong>SWARUP RANJAN PAUL</strong>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
