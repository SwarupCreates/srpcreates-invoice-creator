import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  formatDisplayDate, 
  formatLineAmount, 
  formatTotal, 
  DetailLine, 
  MailIcon, 
  PhoneIcon, 
  GlobeIcon, 
  bankDetails, 
  invoicePreviewAssets, 
  type ContactInfo, 
  type InvoiceItem 
} from '../pages/shared';

type InvoicePreviewProps = {
  invoiceDate: string;
  invoiceId: string;
  projectName: string;
  customerName: string;
  billingLines: string[];
  contactInfo: ContactInfo;
  items: InvoiceItem[];
  totalAmount: number;
  previewRef?: RefObject<HTMLDivElement | null>;
};

export function InvoicePreview({
  invoiceDate,
  invoiceId,
  projectName,
  customerName,
  billingLines,
  contactInfo,
  items,
  totalAmount,
  previewRef
}: InvoicePreviewProps) {
  const { settings } = useFinance();
  const [zoom, setZoom] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Fallback data
  const personalInfo = settings?.personalInfo || {
    name: 'SWARUP RANJAN PAUL',
    email: 'srpcreates@gmail.com',
    phone: '9051477045',
    website: 'srpcreates.framer.website',
    address: '' // not displayed in header currently
  };

  const bankInfoArray = settings?.bankInfo 
    ? [
        ['ACC NAME:', settings.bankInfo.accountName],
        ['ACC NO.:', settings.bankInfo.accountNo],
        ['BANK(BRANCH):', settings.bankInfo.bankBranch],
        ['IFSC CODE:', settings.bankInfo.ifscCode]
      ]
    : bankDetails;

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        // 794 is the hardcoded width of .invoice-sheet. 36 is the padding (18px * 2)
        const fitScale = Math.min(1, (containerWidth - 36) / 794);
        setZoom(fitScale);
      }
    });
    resizeObserver.observe(container);

    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prev) => Math.max(0.1, Math.min(prev - e.deltaY * 0.005, 3)));
      }
    };
    
    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    
    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  return (
    <div className="preview-scroll" ref={previewContainerRef}>
      <div style={{ width: 794 * zoom, height: 1123 * zoom, flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
        <div className="invoice-sheet" ref={previewRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <header className="invoice-letterhead">
            {settings?.logoSvg ? (
              <div 
                className="invoice-logo custom-logo" 
                style={{ width: 'auto', height: '60px', display: 'flex', alignItems: 'center' }} 
                dangerouslySetInnerHTML={{ __html: settings.logoSvg }} 
              />
            ) : (
              <img src={invoicePreviewAssets.letterheadLogo} alt="SRP Creates" className="invoice-logo" />
            )}
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
              <span>{personalInfo.email}</span>
            </div>
            <div>
              <PhoneIcon />
              <span>{personalInfo.phone}</span>
            </div>
            <div>
              <GlobeIcon />
              <span>{personalInfo.website}</span>
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
              <div className="invoice-date">DATE: {formatDisplayDate(invoiceDate || new Date().toISOString())}</div>
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
                  {items && items.length > 0 ? items.map((item, index) => (
                    <div key={item.id || index} className="invoice-table-row">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>{item.description || 'Item description'}</span>
                      <span>{item.type || 'Type'}</span>
                      <span>{formatLineAmount(item.price)}</span>
                    </div>
                  )) : (
                    <div className="invoice-table-row">
                      <span>01</span>
                      <span>Work Delivered as a whole</span>
                      <span>Consulting</span>
                      <span>{formatLineAmount(String(totalAmount))}</span>
                    </div>
                  )}
                </div>

                <div className="invoice-total-lockup">
                  <span>₹ (INR)</span>
                  <strong>{formatTotal(totalAmount)}</strong>
                </div>
              </div>
            </section>

            <footer className="invoice-footer">
              <div className="invoice-bank-details">
                {bankInfoArray.map(([label, value]) => (
                  <p key={label}>
                    <span>{label}</span>
                    <span className="bank-val">{value}</span>
                  </p>
                ))}
              </div>

              <div className="invoice-signature">
                <img src={invoicePreviewAssets.signatureImage} alt="" />
                <div />
                <span className="sig-name">{personalInfo.name || 'SWARUP RANJAN PAUL'}</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
