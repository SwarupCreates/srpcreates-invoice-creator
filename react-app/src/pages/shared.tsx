import React, { type ReactNode } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import letterheadLogo from '../assets/LetterheadLogo2.svg'
import logoMark from '../assets/LogoMark.svg'
import signatureImage from '../assets/signature.png'
import financeLogoColor from '../assets/icons/FinanceStudioColorLogoMark.svg'
import financeLogoWhite from '../assets/icons/FinanceStudioWhiteLogoMark.svg'

export { financeLogoColor, financeLogoWhite }

export type UserProfile = {
  login: string
  avatarUrl: string
}

import type { InvoiceItem } from '../api/types';
export type { InvoiceItem };

export type ContactInfo = {
  email: string
  phone: string
  website: string
  pan?: string
  gstin?: string
}

export type PageId = 'dashboard' | 'invoice' | 'pastInvoices' | 'transactions' | 'profile' | 'settings' | 'clients'

export type NavItem = {
  id: PageId
  label: string
  icon: string
  path: string
}

export const INVOICE_PREFIX = 'SPR'
export const defaultTypes = ['Static', 'Reel', 'Design', 'Consulting']

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { id: 'invoice', label: 'Create New Invoice', icon: 'add_circle', path: '/invoice' },
  { id: 'pastInvoices', label: 'Transactions', icon: 'history', path: '/transactions' },
  { id: 'clients', label: 'Client Manager', icon: 'person', path: '/clients' }
]

export const starterItems: InvoiceItem[] = [
  { id: 'starter-1', description: 'Write Product Description', type: 'Static', price: '0000' },
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
  const cleanDate = inputDate.split('T')[0]
  const [yyyy, mm, dd] = cleanDate.split('-')
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

export function getNextInvoiceCount(inputDate: string, invoices: import('../api/types').Invoice[]): number {
  const token = formatDateToken(inputDate)
  const prefix = `${INVOICE_PREFIX}${token}-`
  
  const matchingInvoices = invoices.filter(inv => inv.id.startsWith(prefix))
  
  if (matchingInvoices.length === 0) {
    return 1
  }
  
  const counts = matchingInvoices.map(inv => {
    const parts = inv.id.split('-')
    const count = parseInt(parts[parts.length - 1], 10)
    return isNaN(count) ? 0 : count
  })
  
  return Math.max(...counts) + 1
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
        <span className="detail-label">{line.slice(0, separatorIndex + 1)}</span>
        {line.slice(separatorIndex + 1)}
      </p>
    )
  }

  return <p>{line}</p>
}

export function StudioIcon({ name, filled = false, className = '' }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} data-filled={filled ? 'true' : 'false'} aria-hidden="true">
      {name}
    </span>
  )
}

export function FinanceStudioWordmark({ mark = financeLogoColor, muted = false }: { mark?: string; muted?: boolean }) {
  return (
    <div className={`studio-wordmark${muted ? ' muted' : ''}`}>
      <img src={mark} alt="" />
      <span>
        <span className="wordmark-bold">Finance</span>Studio
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

export async function exportInvoiceToPdf(previewRef: React.RefObject<HTMLDivElement | null>, invoiceId: string) {
  if (!previewRef.current) return
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
}
