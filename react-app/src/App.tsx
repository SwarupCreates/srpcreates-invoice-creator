import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, matchPath } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'
import { DashboardPage } from './pages/DashboardPage'
import { InvoicePage } from './pages/InvoicePage'
import { TransactionManagerPage } from './pages/TransactionManagerPage'
import { ClientManagerPage } from './pages/ClientManagerPage'
import { TopNav } from './components/TopNav'
import { Sidebar } from './components/Sidebar'
import { HeaderActions } from './components/HeaderActions'
import {
  FinanceStudioWordmark,
  StudioIcon,
  createItem,
  formatInvoiceNumber,
  getNextInvoiceCount,
  starterItems,
  toInputDate,
  navItems,
  type ContactInfo,
  type InvoiceItem,
  type UserProfile,
} from './pages/shared'
import { authApi } from './api/api'
import { invoiceApi } from './api/invoiceApi'
import { transactionApi } from './api/transactionApi'
import { useFinance } from './context/FinanceContext'

function App() {
  const initialDate = toInputDate(new Date())
  
  // Dynamically calculate the last day of the previous month for the default From Date
  const lastDayOfLastMonth = useMemo(() => {
    const today = new Date();
    // Setting day to 0 in Date constructor gives the last day of the previous month
    return toInputDate(new Date(today.getFullYear(), today.getMonth(), 0));
  }, []);

  const [user, setUser] = useState<UserProfile | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(initialDate)
  const [invoiceId, setInvoiceId] = useState('')
  
  // Dashboard Date Range State initialized dynamically
  const [fromDate, setFromDate] = useState(lastDayOfLastMonth)
  const [toDate, setToDate] = useState(initialDate)
  
  // Refs to trigger the native date pickers seamlessly
  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)
  
  const [projectName, setProjectName] = useState('Enter your Project Name')
  const [customerName, setCustomerName] = useState('ICE MEDIA LAB & ANALYTICS PVT. LTD.')
  const [billingAddress, setBillingAddress] = useState('C25, SECTOR 8, GAUTAM BUDDHA NAGAR\nNOIDA - 201301, Uttar Pradesh\nGSTIN : 09AAFCII224E`ZZ\nPAN NO. : AAFCII224E')
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'srpcreates@gmail.com',
    phone: '9051477045',
    website: 'srpcreates.framer.website',
  })
  const [items, setItems] = useState<InvoiceItem[]>(starterItems)

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const [selectedClientId, setSelectedClientId] = useState('')
  const [saveNewClient, setSaveNewClient] = useState(true)
  const [isLoadingInvoiceDetails, setIsLoadingInvoiceDetails] = useState(false)

  const previewRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [forceEditId, setForceEditId] = useState<string>('')
  const { invoices, refreshInvoices, customers, addCustomer } = useFinance()

  const handleClientSelect = (id: string) => {
    setSelectedClientId(id)
    if (id !== 'NEW') {
      const cust = customers.find(c => c.id === id)
      if (cust) {
        setCustomerName(cust.name)
        setBillingAddress(cust.address || '')
        setContactInfo(prev => ({
          ...prev,
          email: cust.email || '',
          phone: cust.phone || '',
          pan: cust.pan || '',
          gstin: cust.gstin || ''
        }))
      }
    } else {
      setCustomerName('')
      setBillingAddress('')
      setContactInfo(prev => ({
        ...prev,
        email: '',
        phone: '',
        pan: '',
        gstin: ''
      }))
    }
  }

  useEffect(() => {
    const storedLogin = localStorage.getItem('gh_login')
    const storedAvatar = localStorage.getItem('gh_avatar')

    // Check for SPA OAuth callback code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const login = urlParams.get('login');
    const avatar = urlParams.get('avatar');

    if (code) {
      // SPA Exchange Flow: send code to Apps Script in background
      authApi.exchangeGithubCode(code).then(res => {
        if (res.success && res.data) {
          localStorage.setItem('gh_login', res.data.login);
          localStorage.setItem('gh_avatar', res.data.avatar_url);
          setUser({ login: res.data.login, avatarUrl: res.data.avatar_url });
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        } else {
          alert("GitHub login failed: " + res.message);
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
      });
    } else if (login && avatar) {
      // Legacy support just in case
      localStorage.setItem('gh_login', login);
      localStorage.setItem('gh_avatar', avatar);
      setUser({ login, avatarUrl: avatar });
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    } else if (storedLogin && storedAvatar) {
      setUser({ login: storedLogin, avatarUrl: storedAvatar })
    }
  }, [])

  useEffect(() => {
    if (invoices) {
      setInvoiceId(prev => {
        if (prev === '' || prev.startsWith('SPR')) {
          return formatInvoiceNumber(invoiceDate, getNextInvoiceCount(invoiceDate, invoices));
        }
        return prev;
      });
    }
  }, [invoiceDate, invoices])

  useEffect(() => {
    if (location.pathname.startsWith('/invoice')) {
      const match = matchPath("/invoice/edit/:editId", location.pathname);
      const editId = match?.params.editId;
      const isFromEdit = location.state?.fromEdit;

      if (editId && invoices && invoices.length > 0) {
        if (isFromEdit) return; // already loaded
        
        const invToEdit = invoices.find(i => i.id === editId);
        if (invToEdit) {
          setIsLoadingInvoiceDetails(true);
          setInvoiceId(invToEdit.id);
          setInvoiceDate(toInputDate(new Date(invToEdit.date)));
          
          const cust = customers.find(c => c.name === invToEdit.customerName);
          if (cust) {
            setSelectedClientId(cust.id);
            setCustomerName(cust.name);
            setBillingAddress(cust.address || '');
            setContactInfo(prev => ({
              ...prev,
              email: cust.email || '',
              phone: cust.phone || '',
              pan: cust.pan || '',
              gstin: cust.gstin || ''
            }));
          } else {
            setCustomerName(invToEdit.customerName || '');
            setSelectedClientId('NEW');
          }

          setProjectName(invToEdit.projectName || '');
          
          // Fetch full invoice details from backend to get items
          invoiceApi.getById(editId).then(res => {
            if (res.success && res.data && res.data.items && res.data.items.length > 0) {
              setItems(res.data.items);
            } else {
              setItems([{
                id: `item-${Date.now()}`,
                description: 'Work Delivered as a whole',
                type: 'Consulting',
                price: String(invToEdit.totalAmount || 0)
              }]);
            }
            setIsLoadingInvoiceDetails(false);
            // clear state so it doesn't trigger a reset
            navigate(`/invoice/edit/${editId}`, { state: { fromEdit: true }, replace: true });
          }).catch(() => {
            setIsLoadingInvoiceDetails(false);
          });
        }
      } else if (!isFromEdit && !editId) {
        // Reset form for "New Invoice"
        setInvoiceId('');
        setInvoiceDate(toInputDate(new Date()));
        setCustomerName('');
        setSelectedClientId('');
        setBillingAddress('');
        setProjectName('');
        setContactInfo({ email: '', phone: '', website: '', pan: '', gstin: '' });
        setItems(starterItems);
      }
    }
  }, [location.pathname, location.state, invoices, navigate, customers]);

  const billingLines = useMemo(() => billingAddress.split(/\r?\n/).filter(Boolean), [billingAddress])
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items])

  const handleGitHubLogin = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
      window.location.href = 'http://localhost:5000/api/auth/github/login'
    } else {
      const clientId = import.meta.env.VITE_PROD_GITHUB_CLIENT_ID;
      
      if (!clientId || clientId.includes('your_prod_')) {
        alert("Production GitHub OAuth is not fully configured yet! Please set VITE_PROD_GITHUB_CLIENT_ID.");
        return;
      }

      // SPA redirect: GitHub redirects right back to the frontend URL!
      const redirectUri = window.location.origin + window.location.pathname;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'read:user user:email',
        allow_signup: 'true',
      });
      window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('gh_login')
    localStorage.removeItem('gh_avatar')
    setUser(null)
    navigate('/dashboard')
  }

  const startNextInvoice = () => {
    setProjectName('')
    setCustomerName('')
    setBillingAddress('')
    setItems([createItem()])
    navigate('/invoice')
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
      pdf.save(`${invoiceId}.pdf`)

      if (selectedClientId === 'NEW' && saveNewClient && customerName.trim()) {
        await addCustomer({
          id: `CUST-${Date.now()}`,
          name: customerName,
          address: billingAddress,
          email: contactInfo.email,
          phone: contactInfo.phone,
          pan: contactInfo.pan,
          gstin: contactInfo.gstin
        })
      }

      // Create backend entry for the invoice
      await invoiceApi.create({
        id: invoiceId,
        date: invoiceDate,
        customerName: customerName,
        projectName: projectName,
        totalAmount: totalAmount,
        status: 'Pending',
        items: items.map(item => ({ ...item, invoiceId: invoiceId }))
      })

      // Generate a distinct transaction record as requested
      await transactionApi.create({
        id: `TXN-${invoiceId}`,
        date: invoiceDate,
        amount: totalAmount,
        type: 'Income',
        category: 'Invoice',
        description: `Invoice ${invoiceId} for ${projectName || customerName}`
      })

      // Refresh list if applicable
      await refreshInvoices()

    } catch (error) {
      console.error("Failed to export invoice:", error)
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

  const currentNav = navItems.find((n) => n.path === location.pathname) || navItems[0]

  return (
    <main className="app-shell">
      <TopNav user={user} />

      <div className="studio-layout">
        <Sidebar onLogout={handleLogout} />

        <section className="workspace">
          <header className="workspace-header">
            <div className="page-title-pill">
              <StudioIcon name={currentNav.icon} />
              <h1>{currentNav.label}</h1>
            </div>

            <HeaderActions
              fromDate={fromDate}
              toDate={toDate}
              setFromDate={setFromDate}
              setToDate={setToDate}
              fromDateRef={fromDateRef}
              toDateRef={toDateRef}
              startNextInvoice={startNextInvoice}
              exportPdf={exportPdf}
              isExporting={isExporting}
              toggleAddRecord={() => location.pathname === '/clients' ? setIsAddClientOpen(prev => !prev) : setIsAddRecordOpen(prev => !prev)}
              isAddRecordOpen={isAddRecordOpen}
              isAddClientOpen={isAddClientOpen}
            />
          </header>

          <div style={{ minHeight: 0, height: '100%', overflowY: 'auto', padding: 0 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage onCreateInvoice={() => navigate('/invoice')} fromDate={fromDate} toDate={toDate} />} />
              <Route path="/invoice" element={
                <InvoicePage
                  invoiceDate={invoiceDate}
                  setInvoiceDate={setInvoiceDate}
                  invoiceId={invoiceId}
                  setInvoiceId={setInvoiceId}
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
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  totalAmount={totalAmount}
                  previewRef={previewRef}
                  selectedClientId={selectedClientId}
                  onClientSelect={handleClientSelect}
                  saveNewClient={saveNewClient}
                  setSaveNewClient={setSaveNewClient}
                  customers={customers}
                  isLoading={isLoadingInvoiceDetails}
                />
              } />
              <Route path="/invoice/edit/:editId" element={
                <InvoicePage
                  invoiceDate={invoiceDate}
                  setInvoiceDate={setInvoiceDate}
                  invoiceId={invoiceId}
                  setInvoiceId={setInvoiceId}
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
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  totalAmount={totalAmount}
                  previewRef={previewRef}
                  selectedClientId={selectedClientId}
                  onClientSelect={handleClientSelect}
                  saveNewClient={saveNewClient}
                  setSaveNewClient={setSaveNewClient}
                  customers={customers}
                  isLoading={isLoadingInvoiceDetails}
                />
              } />
              <Route path="/transactions" element={<TransactionManagerPage isAddRecordOpen={isAddRecordOpen} setIsAddRecordOpen={setIsAddRecordOpen} forceEditId={forceEditId} setForceEditId={setForceEditId} />} />
              <Route path="/clients" element={<ClientManagerPage isAddClientOpen={isAddClientOpen} setIsAddClientOpen={setIsAddClientOpen} />} />
            </Routes>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App