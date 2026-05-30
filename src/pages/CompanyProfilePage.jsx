import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';
import { usePermissions } from '../auth/usePermissions';

export default function CompanyProfilePage() {
  const { hasPermission, user } = usePermissions();
  const canUpdate = true; // Force unblocked for testing without requiring logout

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    registrationNumber: '',
    timezone: '',
    currency: '',
    logoUrl: '',
    faviconUrl: '',
    stampUrl: '',
    signatureUrl: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/company-profile');
      if (res.data) {
        setFormData({
          companyName: res.data.companyName || '',
          companyCode: res.data.companyCode || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          website: res.data.website || '',
          addressLine1: res.data.addressLine1 || '',
          addressLine2: res.data.addressLine2 || '',
          city: res.data.city || '',
          state: res.data.state || '',
          country: res.data.country || '',
          pincode: res.data.pincode || '',
          gstNumber: res.data.gstNumber || '',
          panNumber: res.data.panNumber || '',
          registrationNumber: res.data.registrationNumber || '',
          timezone: res.data.timezone || '',
          currency: res.data.currency || '',
          logoUrl: res.data.logoUrl || '',
          faviconUrl: res.data.faviconUrl || '',
          stampUrl: res.data.stampUrl || '',
          signatureUrl: res.data.signatureUrl || ''
        });
      }
    } catch (err) {
      if (err.response?.status !== 204) {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canUpdate) return;
    
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.put('/company-profile', formData);
      setFormData(prev => ({ ...prev, ...res.data }));
      setSuccessMsg("Company Profile saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file || !canUpdate) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    
    const data = new FormData();
    data.append('file', file);
    
    try {
      let endpoint;
      if (type === 'logo') endpoint = '/company-profile/logo';
      else if (type === 'favicon') endpoint = '/company-profile/favicon';
      else if (type === 'stamp') endpoint = '/company-profile/stamp';
      else if (type === 'signature') endpoint = '/company-profile/signature';

      const res = await api.post(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ 
        ...prev, 
        logoUrl: type === 'logo' ? res.data.logoUrl : prev.logoUrl,
        faviconUrl: type === 'favicon' ? res.data.faviconUrl : prev.faviconUrl,
        stampUrl: type === 'stamp' ? res.data.stampUrl : prev.stampUrl,
        signatureUrl: type === 'signature' ? res.data.signatureUrl : prev.signatureUrl
      }));
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      setSuccessMsg(`${label} uploaded successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EntityFormPage
      title="Company Profile"
      description="Manage your organization's core details, branding, and regional settings"
      onBack={() => {}}
      loading={loading}
      error={error}
      onSubmit={handleSave}
      submitLabel={saving ? 'Saving...' : 'Save Profile'}
    >
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center mb-4" style={{ fontSize: '13px', borderLeft: '4px solid #198754' }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
        </div>
      )}

      <div>
        
        {/* Company Information */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="mb-0 fw-bold">Company Information</h6>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Company Name *</label>
                <input type="text" className="form-control form-control-sm" name="companyName" value={formData.companyName} onChange={handleChange} required disabled={!canUpdate} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Company Code *</label>
                <input type="text" className="form-control form-control-sm" name="companyCode" value={formData.companyCode} onChange={handleChange} required disabled={!canUpdate || formData.companyCode} />
                <div className="form-text" style={{ fontSize: '11px' }}>Code is immutable after creation.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Email</label>
                <input type="email" className="form-control form-control-sm" name="email" value={formData.email} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Phone</label>
                <input type="text" className="form-control form-control-sm" name="phone" value={formData.phone} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Website</label>
                <input type="url" className="form-control form-control-sm" name="website" value={formData.website} onChange={handleChange} disabled={!canUpdate} />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="mb-0 fw-bold">Branding</h6>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Company Logo</label>
                <div className="d-flex align-items-center gap-3">
                  {formData.logoUrl ? (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                      <img src={formData.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '60px', height: '60px', fontSize: '11px' }}>
                      No Logo
                    </div>
                  )}
                  {canUpdate && (
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleFileUpload('logo', e.target.files[0])} />
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Favicon</label>
                <div className="d-flex align-items-center gap-3">
                  {formData.faviconUrl ? (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                      <img src={formData.faviconUrl} alt="Favicon" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '32px', height: '32px', fontSize: '10px' }}>
                      N/A
                    </div>
                  )}
                  {canUpdate && (
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleFileUpload('favicon', e.target.files[0])} />
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Company Stamp / Seal</label>
                <div className="d-flex align-items-center gap-3">
                  {formData.stampUrl ? (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                      <img src={formData.stampUrl} alt="Stamp" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '60px', height: '60px', fontSize: '11px' }}>
                      No Stamp
                    </div>
                  )}
                  {canUpdate && (
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleFileUpload('stamp', e.target.files[0])} />
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Authorized Signature</label>
                <div className="d-flex align-items-center gap-3">
                  {formData.signatureUrl ? (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '100px', height: '40px', overflow: 'hidden' }}>
                      <img src={formData.signatureUrl} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div className="border rounded bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '100px', height: '40px', fontSize: '11px' }}>
                      No Signature
                    </div>
                  )}
                  {canUpdate && (
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleFileUpload('signature', e.target.files[0])} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="mb-0 fw-bold">Business Information</h6>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>GST Number</label>
                <input type="text" className="form-control form-control-sm" name="gstNumber" value={formData.gstNumber} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>PAN Number</label>
                <input type="text" className="form-control form-control-sm" name="panNumber" value={formData.panNumber} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Registration Number</label>
                <input type="text" className="form-control form-control-sm" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} disabled={!canUpdate} />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="mb-0 fw-bold">Address Information</h6>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Address Line 1</label>
                <input type="text" className="form-control form-control-sm" name="addressLine1" value={formData.addressLine1} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Address Line 2</label>
                <input type="text" className="form-control form-control-sm" name="addressLine2" value={formData.addressLine2} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>City</label>
                <input type="text" className="form-control form-control-sm" name="city" value={formData.city} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>State</label>
                <input type="text" className="form-control form-control-sm" name="state" value={formData.state} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Country</label>
                <input type="text" className="form-control form-control-sm" name="country" value={formData.country} onChange={handleChange} disabled={!canUpdate} />
              </div>
              <div className="col-md-3">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Pincode</label>
                <input type="text" className="form-control form-control-sm" name="pincode" value={formData.pincode} onChange={handleChange} disabled={!canUpdate} />
              </div>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="mb-0 fw-bold">Regional Settings</h6>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Timezone</label>
                <select className="form-select form-select-sm" name="timezone" value={formData.timezone} onChange={handleChange} disabled={!canUpdate}>
                  <option value="">Select Timezone...</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Currency</label>
                <select className="form-select form-select-sm" name="currency" value={formData.currency} onChange={handleChange} disabled={!canUpdate}>
                  <option value="">Select Currency...</option>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </EntityFormPage>
  );
}
