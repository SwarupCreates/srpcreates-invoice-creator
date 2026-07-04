import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'
import { DashboardPage } from './pages/DashboardPage'
import { EmptyFeaturePage } from './pages/EmptyFeaturePage'
import { InvoicePage } from './pages/InvoicePage'
import {
  FinanceStudioWordmark,
  StudioIcon,
  createItem,
  formatInvoiceNumber,
  getNextInvoiceCount,
  navItems,
  saveInvoiceCount,
  starterItems,
  toInputDate,
  type ContactInfo,
  type InvoiceItem,
  type PageId,
  type UserProfile,
} from './pages/shared'

function App() {
  const initialDate = toInputDate(new Date())
  
  // Dynamically calculate the last day of the previous month for the default From Date
  const lastDayOfLastMonth = useMemo(() => {
    const today = new Date();
    // Setting day to 0 in Date constructor gives the last day of the previous month
    return toInputDate(new Date(today.getFullYear(), today.getMonth(), 0));
  }, []);

  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(initialDate)
  const [invoiceCount, setInvoiceCount] = useState(() => getNextInvoiceCount(initialDate))
  
  // Dashboard Date Range State initialized dynamically
  const [fromDate, setFromDate] = useState(lastDayOfLastMonth)
  const [toDate, setToDate] = useState(initialDate)
  
  // Refs to trigger the native date pickers seamlessly
  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)
  
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

  const activeNavItem = navItems.find((item) => item.id === activePage) ?? navItems[0]

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('gh_login')
    localStorage.removeItem('gh_avatar')
    setUser(null)
    setActivePage('dashboard')
  }

  const startNextInvoice = () => {
    saveInvoiceCount(invoiceDate, invoiceCount)
    const nextCount = getNextInvoiceCount(invoiceDate)
    setInvoiceCount(nextCount)
    setProjectName('')
    setCustomerName('')
    setBillingAddress('')
    setItems([createItem()])
    setActivePage('invoice')
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
          <FinanceStudioWordmark />
          <div>
            <p>Freelance billing workspace</p>
            <h1>FinanceStudio</h1>
          </div>
          <button type="button" className="primary-button" onClick={handleGitHubLogin}>
            <StudioIcon name="login" />
            Continue with GitHub
          </button>
        </section>
      </main>
    )
  }

  const renderPage = () => {
    if (activePage === 'dashboard') {
      return <DashboardPage onCreateInvoice={() => setActivePage('invoice')} fromDate={fromDate} toDate={toDate} />
    }

    if (activePage === 'invoice') {
      return (
        <InvoicePage
          invoiceDate={invoiceDate}
          setInvoiceDate={setInvoiceDate}
          invoiceCount={invoiceCount}
          invoiceNumber={invoiceNumber}
          projectName={projectName}
          setProjectName={setProjectName}
          customerName={customerName}
          setCustomerName={setCustomerName}
          billingAddress={billingAddress}
          setBillingAddress={setBillingAddress}
          billingLines={billingLines}
          contactInfo={contactInfo}
          setContactInfo={setContactInfo}
          items={items}
          totalAmount={totalAmount}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
          previewRef={previewRef}
        />
      )
    }

    if (activePage === 'pastInvoices') {
      return <EmptyFeaturePage title="Past Invoices" icon="history" />
    }

    return <EmptyFeaturePage title="Transaction tracker" icon="payments" />
  }

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <FinanceStudioWordmark />
        <div className="session-chip">
          <span>Logged in as {user.login}</span>
          <i aria-hidden="true" />
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <span className="avatar-fallback">
              <StudioIcon name="person" filled />
            </span>
          )}
        </div>
      </header>

      <div className="studio-layout">
        <aside className="side-rail">
          <nav className="rail-nav" aria-label="Workspace">
            {navItems.map((item) => (
              <button key={item.id} type="button" className={`rail-link${activePage === item.id ? ' active' : ''}`} onClick={() => setActivePage(item.id)}>
                <StudioIcon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="rail-footer">
            <div className="release-card">
              <FinanceStudioWordmark mark="/src/assets/icons/FinanceStudioWhiteLogoMark.svg" muted />
              <span>release-v1.0</span>
            </div>

            <button type="button" className="rail-link utility">
              <StudioIcon name="account_circle" />
              Account Manager
            </button>

            <button type="button" className="rail-link sign-out" onClick={handleLogout}>
              <StudioIcon name="logout" />
              Sign Out
            </button>
          </div>
        </aside>

        <section className="workspace">
          <header className="workspace-header">
            <div className="page-title-pill">
              <StudioIcon name={activeNavItem.icon} />
              <h1>{activeNavItem.label}</h1>
            </div>

            {activePage === 'dashboard' ? (
              <div className="date-controls" aria-label="Dashboard range" style={{ position: 'relative' }}>
                <button type="button" className="date-pill" onClick={() => fromDateRef.current?.showPicker()}>
                  <span>From</span>
                  <i aria-hidden="true" />
                  <StudioIcon name="calendar_month" />
                  {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </button>
                
                {/* Hidden native date input anchored beneath the 'From' button */}
                <input
                  ref={fromDateRef}
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ position: 'absolute', bottom: 0, left: '25%', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                  aria-hidden="true"
                />

                <button type="button" className="date-pill" onClick={() => toDateRef.current?.showPicker()}>
                  <span>To</span>
                  <i aria-hidden="true" />
                  <StudioIcon name="calendar_month" />
                  {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </button>
                
                {/* Hidden native date input anchored beneath the 'To' button */}
                <input
                  ref={toDateRef}
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ position: 'absolute', bottom: 0, right: '25%', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            ) : null}

            {activePage === 'invoice' ? (
              <div className="invoice-actions">
                <button type="button" className="secondary-button" onClick={startNextInvoice}>
                  <StudioIcon name="add" />
                  New
                </button>
                <button type="button" className="primary-button" onClick={exportPdf} disabled={isExporting}>
                  <StudioIcon name="download" />
                  {isExporting ? 'Exporting' : 'Export PDF'}
                </button>
              </div>
            ) : null}
          </header>

          {/* New Content Wrapper specifically locking internally clipped scrolling! */}
          <div style={{ minHeight: 0, height: '100%', overflowY: 'auto', padding: 0 }}>
            {renderPage()}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App