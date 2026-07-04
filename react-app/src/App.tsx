import { useEffect, useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'
import letterheadLogo from './assets/LetterheadLogo.svg'
import logoMark from './assets/LogoMark.svg'
import signatureImage from './assets/signature.png'

type UserProfile = {
  login: string
  avatarUrl: string
}

type InvoiceItem = {
  id: string
  description: string
  type: string
  price: string
}

type ContactInfo = {
  email: string
  phone: string
  website: string
}

const INVOICE_PREFIX = 'SRP'
const COUNT_STORAGE_KEY = 'srp_invoice_counts'
const defaultTypes = ['Static', 'Reel', 'Design', 'Consulting']

const starterItems: InvoiceItem[] = [
  { id: 'starter-1', description: 'JomjomatiMenu Announcement', type: 'Static', price: '2000' },
  { id: 'starter-2', description: 'JomjomatiMenu Thank You', type: 'Static', price: '2000' },
  { id: 'starter-3', description: 'JomjomatiMenu KV', type: 'Static', price: '1600' },
  { id: 'starter-4', description: 'JomjomatiMenu Endslate', type: 'Reel', price: '2600' },
  { id: 'starter-5', description: 'JomjomatiMenu Announcement', type: 'Reel', price: '2600' },
  { id: 'starter-6', description: 'JomjomatiMenu Contest Reminder', type: 'Reel', price: '2600' },
  { id: 'starter-7', description: 'JomjomatiMenu Winners Stories', type: 'Static', price: '2000' },
]

const bankDetails = [
  ['ACC NAME:', 'SWARUP RANJAN PAUL'],
  ['ACC NO.:', '50496817504'],
  ['BANK(BRANCH):', 'INDIAN BANK, SANTOSPUR, KOLKATA, WB'],
  ['IFSC CODE:', 'IFSC: IDIB000K771'],
  ['UPI ID:', 'SUVO25TH@OKSBI / 9051477045'],
  ['PAN NO.:', 'FJUPP8540N'],
]

function createItem(): InvoiceItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return { id, description: '', type: defaultTypes[0], price: '' }
}

function toInputDate(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getDateParts(inputDate: string) {
  const [yyyy, mm, dd] = inputDate.split('-')
  return { yyyy, mm, dd }
}

function formatDateToken(inputDate: string) {
  const { yyyy, mm, dd } = getDateParts(inputDate)
  return `${dd}${mm}${yyyy}`
}

function formatDisplayDate(inputDate: string) {
  const { yyyy, mm, dd } = getDateParts(inputDate)
  return `${dd}-${mm}-${yyyy}`
}

function readInvoiceCounts(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(COUNT_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function getNextInvoiceCount(inputDate: string) {
  const counts = readInvoiceCounts()
  return (counts[formatDateToken(inputDate)] || 0) + 1
}

function saveInvoiceCount(inputDate: string, count: number) {
  const token = formatDateToken(inputDate)
  const counts = readInvoiceCounts()
  counts[token] = Math.max(counts[token] || 0, count)
  localStorage.setItem(COUNT_STORAGE_KEY, JSON.stringify(counts))
}

function formatInvoiceNumber(inputDate: string, count: number) {
  return `${INVOICE_PREFIX}${formatDateToken(inputDate)}-${String(count).padStart(2, '0')}`
}

function formatTotal(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function formatLineAmount(value: string) {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0, useGrouping: false })
}

function DetailLine({ line }: { line: string }) {
  const separatorIndex = line.indexOf(':')

  if (separatorIndex > 0 && separatorIndex <= 14) {
    return (
      <p>
        <strong>{line.slice(0, separatorIndex + 1)}</strong>
        {line.slice(separatorIndex + 1)}
      </p>
    )
  }

  return <p>{line}</p>
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.8" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.92v2.4a1.7 1.7 0 0 1-1.86 1.7 17.2 17.2 0 0 1-7.48-2.66 16.8 16.8 0 0 1-5.02-5.02 17.2 17.2 0 0 1-2.66-7.52A1.7 1.7 0 0 1 6.68 4h2.4a1.7 1.7 0 0 1 1.68 1.46c.11.82.3 1.62.57 2.38a1.7 1.7 0 0 1-.38 1.74l-1.02 1.02a13.6 13.6 0 0 0 5.47 5.47l1.02-1.02a1.7 1.7 0 0 1 1.74-.38c.76.27 1.56.46 2.38.57A1.7 1.7 0 0 1 22 16.92Z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" />
      <path d="M3.5 11h15M11 3.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5c-2-2-3-4.5-3-7.5s1-5.5 3-7.5Z" />
      <path d="m17 17 3.5 3.5" />
    </svg>
  )
}

function App() {
  const initialDate = toInputDate(new Date())
  const [user, setUser] = useState<UserProfile | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(initialDate)
  const [invoiceCount, setInvoiceCount] = useState(() => getNextInvoiceCount(initialDate))
  const [projectName, setProjectName] = useState('Aashirvaad Jomjomati Menu April Actuals - 2026')
  const [customerName, setCustomerName] = useState('ICE MEDIA LAB & ANALYTICS PVT. LTD.')
  const [billingAddress, setBillingAddress] = useState('C25, SECTOR 8, GAUTAM BUDDHA NAGAR\nNOIDA - 201301, Uttar Pradesh\nGSTIN : 09AAFCII224E`ZZ\nPAN NO. : AAFCII224E')
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'srpcreates@gmail.com',
    phone: '9051477045',
    website: 'srpcreates.framer.website',
  })
  const [items, setItems] = useState<InvoiceItem[]>(starterItems)
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const storedLogin = localStorage.getItem('gh_login')
    const storedAvatar = localStorage.getItem('gh_avatar')

    if (storedLogin && storedAvatar) {
      setUser({ login: storedLogin, avatarUrl: storedAvatar })
      return
    }

    const params = new URLSearchParams(window.location.search)
    const login = params.get('login')
    const avatar = params.get('avatar')

    if (login && avatar) {
      setUser({ login, avatarUrl: avatar })
      localStorage.setItem('gh_login', login)
      localStorage.setItem('gh_avatar', avatar)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    setInvoiceCount(getNextInvoiceCount(invoiceDate))
  }, [invoiceDate])

  const invoiceNumber = useMemo(() => formatInvoiceNumber(invoiceDate, invoiceCount), [invoiceDate, invoiceCount])
  const billingLines = useMemo(() => billingAddress.split(/\r?\n/).filter(Boolean), [billingAddress])
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items])

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('gh_login')
    localStorage.removeItem('gh_avatar')
    setUser(null)
  }

  const startNextInvoice = () => {
    saveInvoiceCount(invoiceDate, invoiceCount)
    const nextCount = getNextInvoiceCount(invoiceDate)
    setInvoiceCount(nextCount)
    setProjectName('')
    setCustomerName('')
    setBillingAddress('')
    setItems([createItem()])
  }

  const updateItem = (id: string, key: keyof InvoiceItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const addItem = () => {
    setItems((prev) => [...prev, createItem()])
  }

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : [createItem()]))
  }

  const exportPdf = async () => {
    if (!previewRef.current || isExporting) return

    setIsExporting(true)

    try {
      await document.fonts?.ready
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        logging: false,
        scale: 3,
        useCORS: true,
        windowHeight: previewRef.current.scrollHeight,
        windowWidth: previewRef.current.scrollWidth,
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
      pdf.save(`${invoiceNumber}.pdf`)
      saveInvoiceCount(invoiceDate, invoiceCount)
    } finally {
      setIsExporting(false)
    }
  }

  if (!user) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <img src={letterheadLogo} alt="SRP Creates" className="login-logo" />
          <div>
            <p className="eyebrow">Invoice Studio</p>
            <h1>SRP Creates billing</h1>
          </div>
          <button type="button" className="primary-button" onClick={handleGitHubLogin}>
            <span className="material-symbols-outlined" aria-hidden="true">login</span>
            Continue with GitHub
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="side-rail">
        <div className="rail-brand">
          <img src={letterheadLogo} alt="SRP Creates" />
          <span>Invoice Studio</span>
        </div>

        <nav className="rail-nav" aria-label="Workspace">
          <button type="button" className="rail-link active">
            <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
            Invoice
          </button>
          <button type="button" className="rail-link">
            <span className="material-symbols-outlined" aria-hidden="true">account_balance</span>
            Payout
          </button>
        </nav>

        <button type="button" className="profile-card" onClick={handleLogout}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{user.login.charAt(0).toUpperCase()}</span>}
          <strong>{user.login}</strong>
          <small>Log out</small>
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Current invoice</p>
            <h1>{invoiceNumber}</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="secondary-button" onClick={startNextInvoice}>
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              New
            </button>
            <button type="button" className="primary-button" onClick={exportPdf} disabled={isExporting}>
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
              {isExporting ? 'Exporting' : 'Export PDF'}
            </button>
          </div>
        </header>

        <div className="builder-grid">
          <section className="editor-panel" aria-label="Invoice editor">
            <div className="panel-heading">
              <h2>Invoice details</h2>
              <span>INR {formatTotal(totalAmount)}</span>
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
                <span>Invoice number</span>
                <input type="text" value={invoiceNumber} readOnly />
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
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
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
                      <option key={typeOption} value={typeOption}>{typeOption}</option>
                    ))}
                  </select>
                  <input type="number" min="0" value={item.price} onChange={(event) => updateItem(item.id, 'price', event.target.value)} placeholder="0" />
                  <button type="button" className="icon-button danger" onClick={() => removeItem(item.id)} aria-label="Remove row">
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="preview-panel" aria-label="Invoice preview">
            <div className="preview-toolbar">
              <div>
                <p className="eyebrow">A4 preview</p>
                <h2>PDF output</h2>
              </div>
              <span>{formatDisplayDate(invoiceDate)}</span>
            </div>

            <div className="preview-scroll">
              <div className="invoice-sheet" ref={previewRef}>
                <header className="invoice-letterhead">
                  <img src={letterheadLogo} alt="SRP Creates" className="invoice-logo" />
                  <div className="invoice-designs-text">DESIGNS</div>
                  <div className="invoice-title-block">
                    <h2>INVOICE</h2>
                    <p>INVOICE_NO: <span>{invoiceNumber}</span></p>
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
                  <img src={logoMark} alt="" className="invoice-watermark" />

                  <section className="invoice-bill-row">
                    <div className="invoice-client">
                      <p><strong>Bill To:</strong> {customerName || 'CLIENT NAME'}</p>
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
                      <img src={signatureImage} alt="" />
                      <div />
                      <strong>SWARUP RANJAN PAUL</strong>
                    </div>
                  </footer>
                </main>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
