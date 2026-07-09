import { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { StudioIcon } from './shared';
import type { PersonalInfo, BankInfo, Settings } from '../api/types';
import '../styles/TransactionManagerPage.css'; // Reuse form styles
import '../styles/AccountPage.css';

export function AccountPage({ isEditing }: { isEditing?: boolean }) {
  const { settings, isLoadingSettings, updateSettings } = useFinance();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '', address: '', email: '', phone: '', website: '', pan: '', gstin: '', upiId: ''
  });

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountName: '', accountNo: '', bankBranch: '', ifscCode: ''
  });

  const [logoSvg, setLogoSvg] = useState('');

  const [ghLogin, setGhLogin] = useState('');
  const [ghAvatar, setGhAvatar] = useState('');

  useEffect(() => {
    setGhLogin(localStorage.getItem('gh_login') || '');
    setGhAvatar(localStorage.getItem('gh_avatar') || '');
  }, []);

  useEffect(() => {
    if (settings && !isEditing) {
      if (settings.personalInfo) setPersonalInfo(settings.personalInfo);
      if (settings.bankInfo) setBankInfo(settings.bankInfo);
      if (settings.logoSvg) setLogoSvg(settings.logoSvg);
    }
  }, [settings, isEditing]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankInfo(prev => ({ ...prev, [name]: value }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setLogoSvg(result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newSettings: Partial<Settings> = {
      personalInfo,
      bankInfo,
      logoSvg
    };

    await updateSettings(newSettings);
    // State is managed in App.tsx, but the update itself provides feedback
  };

  if (isLoadingSettings) {
    return (
      <div className="account-loading-wrapper" style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="client-manager-page account-page-wrapper">
      <section className="add-invoice-inline-container account-page-container">
        <div className="account-scrollable-content">
          
          <div className="section-label account-section-title">
            <StudioIcon name="person" />
            <span>GitHub Account</span>
          </div>
          <div className="account-github-section">
            {ghAvatar ? (
              <img src={ghAvatar} alt="GitHub Avatar" className="account-github-avatar" />
            ) : (
              <div className="account-github-avatar-placeholder">
                <StudioIcon name="person" />
              </div>
            )}
            <div className="account-github-info">
              <p>Signed in via GitHub</p>
              <h3>{ghLogin || 'Not Signed In'}</h3>
            </div>
          </div>

          <form id="account-form" className="inline-add-form" onSubmit={handleSubmit}>
            <div className="section-label account-form-section-label first">
              <StudioIcon name="badge" />
              <span>Personal / Business Details</span>
            </div>
            
            <div className="inline-form-group wide">
              <StudioIcon name="person" />
              <input type="text" name="name" value={personalInfo.name} onChange={handlePersonalChange} placeholder="Full Name / Business Name" disabled={!isEditing} />
            </div>
            <div className="inline-form-group account-textarea-group">
              <StudioIcon name="add_location" />
              <textarea name="address" value={personalInfo.address} onChange={handlePersonalChange} placeholder="Full Address..." rows={2} disabled={!isEditing} className="account-textarea-input" />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="mail" />
              <input type="email" name="email" value={personalInfo.email} onChange={handlePersonalChange} placeholder="Email Address" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="phone" />
              <input type="text" name="phone" value={personalInfo.phone} onChange={handlePersonalChange} placeholder="Phone Number" disabled={!isEditing} />
            </div>
            <div className="inline-form-group wide">
              <StudioIcon name="language" />
              <input type="text" name="website" value={personalInfo.website} onChange={handlePersonalChange} placeholder="Website (e.g. yoursite.com)" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="pan" value={personalInfo.pan || ''} onChange={handlePersonalChange} placeholder="PAN Number" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="account_balance_wallet" />
              <input type="text" name="gstin" value={personalInfo.gstin || ''} onChange={handlePersonalChange} placeholder="GSTIN (Optional)" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="qr_code" />
              <input type="text" name="upiId" value={personalInfo.upiId || ''} onChange={handlePersonalChange} placeholder="UPI ID" disabled={!isEditing} />
            </div>

            <div className="section-label account-form-section-label">
              <StudioIcon name="account_balance" />
              <span>Bank Details</span>
            </div>
            
            <div className="inline-form-group wide">
              <StudioIcon name="person" />
              <input type="text" name="accountName" value={bankInfo.accountName} onChange={handleBankChange} placeholder="Account Name" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="accountNo" value={bankInfo.accountNo} onChange={handleBankChange} placeholder="Account Number" disabled={!isEditing} />
            </div>
            <div className="inline-form-group">
              <StudioIcon name="tag" />
              <input type="text" name="ifscCode" value={bankInfo.ifscCode} onChange={handleBankChange} placeholder="IFSC Code" disabled={!isEditing} />
            </div>
            <div className="inline-form-group wide">
              <StudioIcon name="domain" />
              <input type="text" name="bankBranch" value={bankInfo.bankBranch} onChange={handleBankChange} placeholder="Bank Name & Branch" disabled={!isEditing} />
            </div>

            <div className="section-label account-form-section-label">
              <StudioIcon name="image" />
              <span>Invoice Logo (SVG)</span>
            </div>
            
            <div className="account-logo-section">
              <div className="account-logo-preview">
                {logoSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: logoSvg }} className="account-logo-preview-svg" />
                ) : (
                  <p>No Logo Uploaded</p>
                )}
              </div>

              {isEditing && (
                <div className="account-logo-upload-prompt">
                  <p>
                    Upload an SVG file to use as your invoice header logo.
                  </p>
                  <input
                    type="file"
                    accept=".svg"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleSvgUpload}
                  />
                  <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()} style={{ alignSelf: 'flex-start' }}>
                    <StudioIcon name="upload" />
                    {logoSvg ? 'Re-upload SVG' : 'Upload SVG'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
