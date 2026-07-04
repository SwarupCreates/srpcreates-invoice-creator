import { type ReactNode } from 'react'
import letterheadLogo from '../assets/LetterheadLogo2.svg'
import logoMark from '../assets/LogoMark.svg'
import signatureImage from '../assets/signature.png'
import financeLogoColor from '../assets/icons/FinanceStudioColorLogoMark.svg'
import financeLogoWhite from '../assets/icons/FinanceStudioWhiteLogoMark.svg'

export type UserProfile = {
  login: string
  avatarUrl: string
}

export type InvoiceItem = {
  id: string
  description: string
  type: string
  price: string
}

export type ContactInfo = {
  email: string
  phone: string
  website: string
}

export type PageId = 'dashboard' | 'invoice' | 'pastInvoices' | 'transactions' | 'profile' | 'settings'

export type NavItem = {
  id: PageId
  label: string
  icon: string
}

export const INVOICE_PREFIX = 'SRP'
export const COUNT_STORAGE_KEY = 'srp_invoice_counts'
export const defaultTypes = ['Static', 'Reel', 'Design', 'Consulting']

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'invoice', label: 'Create New Invoice', icon: 'add_circle' },
  { id: 'pastInvoices', label: 'Past Invoices', icon: 'history' },
  { id: 'transactions', label: 'Transaction tracker', icon: 'payments' },
]

export const starterItems: InvoiceItem[] = [
  { id: 'starter-1', description: 'JomjomatiMenu Announcement', type: 'Static', price: '2000' },
  { id: 'starter-2', description: 'JomjomatiMenu Thank You', type: 'Static', price: '2000' },
  { id: 'starter-3', description: 'JomjomatiMenu KV', type: 'Static', price: '1600' },
  { id: 'starter-4', description: 'JomjomatiMenu Endslate', type: 'Reel', price: '2600' },
  { id: 'starter-5', description: 'JomjomatiMenu Announcement', type: 'Reel', price: '2600' },
  { id: 'starter-6', description: 'JomjomatiMenu Contest Reminder', type: 'Reel', price: '2600' },
  { id: 'starter-7', description: 'JomjomatiMenu Winners Stories', type: 'Static', price: '2000' },
]

export const bankDetails = [
  ['ACC NAME:', 'SWARUP RANJAN PAUL'],
  ['ACC NO.:', '50496817504'],
  ['BANK(BRANCH):', 'INDIAN BANK, SANTOSPUR, KOLKATA, WB'],
  ['IFSC CODE:', 'IFSC: IDIB000K771'],
  ['UPI ID:', 'SUVO25TH@OKSBI / 9051477045'],
  ['PAN NO.:', 'FJUPP8540N'],
]

export function createItem(): InvoiceItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return { id, description: '', type: defaultTypes[0], price: '' }
}

export function toInputDate(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getDateParts(inputDate: string) {
  const [yyyy, mm, dd] = inputDate.split('-')
  return { yyyy, mm, dd }
}

export function formatDateToken(inputDate: string) {
  const { yyyy, mm, dd } = getDateParts(inputDate)
  return `${dd}${mm}${yyyy}`
}

export function formatDisplayDate(inputDate: string) {
  const { yyyy, mm, dd } = getDateParts(inputDate)
  return `${dd}-${mm}-${yyyy}`
}

export function readInvoiceCounts(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(COUNT_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getNextInvoiceCount(inputDate: string) {
  const counts = readInvoiceCounts()
  return (counts[formatDateToken(inputDate)] || 0) + 1
}

export function saveInvoiceCount(inputDate: string, count: number) {
  const token = formatDateToken(inputDate)
  const counts = readInvoiceCounts()
  counts[token] = Math.max(counts[token] || 0, count)
  localStorage.setItem(COUNT_STORAGE_KEY, JSON.stringify(counts))
}

export function formatInvoiceNumber(inputDate: string, count: number) {
  return `${INVOICE_PREFIX}${formatDateToken(inputDate)}-${String(count).padStart(2, '0')}`
}

export function formatTotal(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatLineAmount(value: string) {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0, useGrouping: false })
}

export function DetailLine({ line }: { line: string }) {
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

export function StudioIcon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span className="material-symbols-outlined" data-filled={filled ? 'true' : 'false'} aria-hidden="true">
      {name}
    </span>
  )
}

export function FinanceStudioWordmark({ mark = financeLogoColor, muted = false }: { mark?: string; muted?: boolean }) {
  return (
    <div className={`studio-wordmark${muted ? ' muted' : ''}`}>
      <img src={mark} alt="" />
      <span>
        <strong>Finance</strong>Studio
      </span>
    </div>
  )
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.8" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.92v2.4a1.7 1.7 0 0 1-1.86 1.7 17.2 17.2 0 0 1-7.48-2.66 16.8 16.8 0 0 1-5.02-5.02 17.2 17.2 0 0 1-2.66-7.52A1.7 1.7 0 0 1 6.68 4h2.4a1.7 1.7 0 0 1 1.68 1.46c.11.82.3 1.62.57 2.38a1.7 1.7 0 0 1-.38 1.74l-1.02 1.02a13.6 13.6 0 0 0 5.47 5.47l1.02-1.02a1.7 1.7 0 0 1 1.74-.38c.76.27 1.56.46 2.38.57A1.7 1.7 0 0 1 22 16.92Z" />
    </svg>
  )
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" />
      <path d="M3.5 11h15M11 3.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5c-2-2-3-4.5-3-7.5s1-5.5 3-7.5Z" />
      <path d="m17 17 3.5 3.5" />
    </svg>
  )
}

export const invoicePreviewAssets = {
  letterheadLogo,
  logoMark,
  signatureImage,
  financeLogoColor,
  financeLogoWhite,
}

export function renderSectionTitle(title: string, icon: string, action?: ReactNode) {
  return (
    <div className="section-heading">
      <div className="section-label">
        <StudioIcon name={icon} />
        <span>{title}</span>
      </div>
      {action}
    </div>
  )
}
