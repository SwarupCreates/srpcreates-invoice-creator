import { useEffect, useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'
import letterheadLogo from './assets/LetterheadLogo.svg'

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

const defaultTypes = ['Static', 'Reel', 'Design', 'Consulting']

function formatInvoiceNumber(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `INV-${yyyy}${mm}${dd}`
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [invoiceNumber, setInvoiceNumber] = useState(() => formatInvoiceNumber(new Date()))
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', website: '' })
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [typeOptions] = useState<string[]>(defaultTypes)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
      const profile = { login, avatarUrl: avatar }
      setUser(profile)
      localStorage.setItem('gh_login', login)
      localStorage.setItem('gh_avatar', avatar)
      window.history.replaceState({}, document.title, '/')
    }
  }, [])

  useEffect(() => {
    setInvoiceNumber(formatInvoiceNumber(new Date(invoiceDate)))
  }, [invoiceDate])

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items])

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('gh_login')
    localStorage.removeItem('gh_avatar')
    setUser(null)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const updateItem = (id: string, key: keyof InvoiceItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now().toString(), description: '', type: typeOptions[0], price: '' }])
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id))

  const previewInvoice = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const exportPdf = async () => {
    if (!previewRef.current) return
    const canvas = await html2canvas(previewRef.current, { scale: 2 })
    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${invoiceNumber}.pdf`)
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="card centered-card">
          <p className="eyebrow">Hello world, please login.</p>
          <h1>Invoice Generator</h1>
          <p className="subtitle">Sign in with GitHub to continue using the app.</p>
          <button type="button" className="primary-button" onClick={handleGitHubLogin}>
            <span className="material-symbols-outlined">login</span>
            Continue with GitHub
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <p className="brand-title">Invoice Pulse</p>
            <p className="brand-subtitle">Clean billing workflow</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="nav-item active">
            <span className="material-symbols-outlined">home</span>
            Home
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">history</span>
            Past invoices
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">edit</span>
            Edit info
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="cta-button" onClick={openModal}>
            <span className="material-symbols-outlined">add_circle</span>
            Create invoice
          </button>
          <button type="button" className="secondary-button logout-button" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Log out
          </button>
        </div>
      </aside>

      <section className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Welcome back, {user.login}</p>
            <h1>Invoice dashboard</h1>
          </div>
          <div className="header-actions">
            <button type="button" className="primary-button" onClick={openModal}>
              <span className="material-symbols-outlined">add</span>
              New invoice
            </button>
            <button type="button" className="profile-pill" onClick={handleLogout}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.login} /> : <span>{user.login.charAt(0).toUpperCase()}</span>}
              <span>{user.login}</span>
            </button>
          </div>
        </header>

        <div className="hero-card">
          <div>
            <p className="eyebrow">Quick start</p>
            <h2>Create a professional invoice in seconds</h2>
            <p className="hero-copy">
              Open the form, add your invoice details and line items, then export a clean PDF ready to share.
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={openModal}>
            <span className="material-symbols-outlined">post_add</span>
            Create invoice
          </button>
        </div>

        <section className="content-grid">
          <div className="content-card">
            <div className="content-card-header">
              <h3>Recent actions</h3>
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <p className="content-copy">Open the invoice builder to begin. Your generated invoices will appear here once you add them.</p>
          </div>

          <div className="content-card">
            <div className="content-card-header">
              <h3>Billing settings</h3>
              <span className="material-symbols-outlined">settings</span>
            </div>
            <p className="content-copy">Update your business profile, payment details, and export preferences after invoice creation.</p>
          </div>
        </section>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Create invoice</p>
                <h2>New invoice details</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-grid">
                <div className="modal-fields">
                  <div className="field-row">
                    <label>
                      <span>Invoice date</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">calendar_month</span>
                        <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
                      </div>
                    </label>
                    <label>
                      <span>Invoice number</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">badge</span>
                        <input type="text" value={invoiceNumber} readOnly />
                      </div>
                    </label>
                  </div>

                  <div className="field-row">
                    <label>
                      <span>Project name</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">work</span>
                        <input type="text" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project or client title" />
                      </div>
                    </label>
                    <label>
                      <span>Client name</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">person</span>
                        <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Client or company" />
                      </div>
                    </label>
                  </div>

                  <label>
                    <span>Billing address</span>
                    <div className="input-icon-group textarea-group">
                      <span className="material-symbols-outlined">location_on</span>
                      <textarea value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} placeholder="Address, GST, city"></textarea>
                    </div>
                  </label>

                  <div className="field-row">
                    <label>
                      <span>Email</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">email</span>
                        <input type="email" value={contactInfo.email} onChange={(event) => setContactInfo({ ...contactInfo, email: event.target.value })} placeholder="example@mail.com" />
                      </div>
                    </label>
                    <label>
                      <span>Phone</span>
                      <div className="input-icon-group">
                        <span className="material-symbols-outlined">phone</span>
                        <input type="text" value={contactInfo.phone} onChange={(event) => setContactInfo({ ...contactInfo, phone: event.target.value })} placeholder="+91 90000 00000" />
                      </div>
                    </label>
                  </div>

                  <label>
                    <span>Website</span>
                    <div className="input-icon-group">
                      <span className="material-symbols-outlined">language</span>
                      <input type="text" value={contactInfo.website} onChange={(event) => setContactInfo({ ...contactInfo, website: event.target.value })} placeholder="yourdomain.com" />
                    </div>
                  </label>

                  <div className="section-divider">
                    <h3>Items</h3>
                    <button type="button" className="secondary-button" onClick={addItem}>
                      <span className="material-symbols-outlined">add</span>
                      Add row
                    </button>
                  </div>

                  <div className="items-table">
                    <div className="items-header">
                      <span>Description</span>
                      <span>Type</span>
                      <span>Price</span>
                      <span></span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="items-row">
                        <input type="text" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Enter item description" />
                        <div className="select-wrapper">
                          <span className="material-symbols-outlined">category</span>
                          <select value={item.type} onChange={(event) => updateItem(item.id, 'type', event.target.value)}>
                            {typeOptions.map((typeOption) => (
                              <option key={typeOption} value={typeOption}>{typeOption}</option>
                            ))}
                          </select>
                        </div>
                        <div className="input-icon-group">
                          <span className="material-symbols-outlined">currency_rupee</span>
                          <input type="number" value={item.price} min="0" onChange={(event) => updateItem(item.id, 'price', event.target.value)} placeholder="0" />
                        </div>
                        <button type="button" className="icon-button remove-icon" onClick={() => removeItem(item.id)}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="field-row total-row">
                    <div />
                    <div className="total-label">Total</div>
                    <div className="total-value">₹ {totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="modal-preview">
                  <div className="invoice-preview professional-invoice" ref={previewRef}>
                    {/* Header Section */}
                    <header className="inv-header">
                      <div className="inv-header-watermark">DESIGNS</div>
                      <div className="inv-logo-section">
                        <img src={letterheadLogo} alt="Logo" className="inv-logo-img" />
                      </div>
                      <div className="inv-invoice-title">
                        <h1>INVOICE</h1>
                        <div className="inv-no">
                          INVOICE_NO: <span>{invoiceNumber || 'INV-YYYYMMDD'}</span>
                        </div>
                      </div>
                    </header>

                    {/* Contact Bar */}
                    <div className="inv-contact-bar">
                      <div className="inv-contact-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span>{contactInfo.email || 'email@example.com'}</span>
                      </div>
                      <div className="inv-contact-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span>{contactInfo.phone || '+91 90000 00000'}</span>
                      </div>
                      <div className="inv-contact-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span>{contactInfo.website || 'yourdomain.com'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="inv-content">
                      <div className="inv-bg-watermark">SP</div>

                      {/* Billing Section */}
                      <div className="inv-billing-section">
                        <div className="inv-bill-to">
                          <div><strong>Bill To:</strong> <span>{customerName || 'Client / Company Name'}</span></div>
                          <div className="inv-billing-address">{billingAddress || 'Billing address, GST, city, state, ZIP'}</div>
                        </div>
                        <div className="inv-date-section">
                          DATE: <span>{invoiceDate}</span>
                        </div>
                      </div>

                      {/* Project Section */}
                      <div className="inv-project-section">
                        <div className="inv-project-label">Project Name:</div>
                        <div className="inv-project-name">{projectName || 'Project name or description'}</div>
                      </div>

                      {/* Table Section */}
                      <div className="inv-table-container">
                        <table className="inv-table">
                          <thead>
                            <tr>
                              <th className="inv-sl-col">Sl No.</th>
                              <th className="inv-desc-col">Job Item(s)</th>
                              <th className="inv-type-col">Type</th>
                              <th className="inv-price-col">Price</th>
                              <th className="inv-total-col">Total Compensation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.length ? (
                              items.map((item, index) => (
                                <tr key={item.id}>
                                  <td>{String(index + 1).padStart(2, '0')}</td>
                                  <td>{item.description || 'Item description'}</td>
                                  <td>{item.type}</td>
                                  <td>₹ {item.price ? Number(item.price).toLocaleString('en-IN') : '0'}</td>
                                  {index === 0 && (
                                    <td rowSpan={items.length} className="inv-total-compensation">
                                      <div className="inv-total-wrapper">
                                        <span className="inv-total-currency">INR</span>
                                        <span className="inv-total-amount">₹ {totalAmount.toLocaleString('en-IN')}</span>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Add item rows to preview here</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Section */}
                      <div className="inv-footer">
                        <div className="inv-bank-details">
                          <div><span>ACC NAME:</span> Swarup Ranjan Paul</div>
                          <div><span>ACC NO.:</span> 50496817504</div>
                          <div><span>BANK(BRANCH):</span> Indian Bank, Santospur, Kolkata, WB</div>
                          <div><span className="inv-light-text">IFSC CODE:</span> IDIB000K771</div>
                        </div>
                        <div className="inv-signature-section">
                          <div className="inv-signature-image">Authorized signature</div>
                          <div className="inv-signature-line" />
                          <div className="inv-signature-name">Swarup Ranjan Paul</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={previewInvoice}>
                  <span className="material-symbols-outlined">visibility</span>
                  Preview invoice
                </button>
                <button type="button" className="secondary-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="primary-button" onClick={exportPdf}>
                  <span className="material-symbols-outlined">file_download</span>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
