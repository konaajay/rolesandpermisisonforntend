import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';
import { usePermissions } from '../auth/usePermissions';

export default function TemplateFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('SETTINGS_MANAGE_TEMPLATES') || hasPermission('SUPER_ADMIN');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    templateCode: '',
    templateName: '',
    templateType: 'DOCUMENT',
    contentHtml: '',
    backgroundImageUrl: '',
    active: true
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/templates/${id}`);
      setFormData({
        templateCode: res.data.templateCode || '',
        templateName: res.data.templateName || '',
        templateType: res.data.templateType || 'DOCUMENT',
        contentHtml: res.data.contentHtml || '',
        backgroundImageUrl: res.data.backgroundImageUrl || '',
        active: res.data.active !== false
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canUpdate) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/templates/${id}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      navigate('/settings/templates');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSaving(false);
    }
  };

  const sampleData = {
    FIRST_NAME: "John",
    LAST_NAME: "Doe",
    EMAIL: "john.doe@example.com",
    EMPLOYEE_ID: "EMP-2026-001",
    ROLE: "Software Engineer",
    DEPARTMENT: "Engineering",
    CURRENT_DATE: new Date().toLocaleDateString(),
    TENANT_NAME: "Acme Corp",
    COMPANY_ADDRESS: "123 Tech Lane, Silicon Valley, CA 94025"
  };

  const getPreviewHtml = () => {
    let html = formData.contentHtml;
    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, `<span style="background: #e9ecef; padding: 2px 4px; border-radius: 4px;">${value}</span>`);
    }
    return html;
  };

  return (
    <EntityFormPage
      title={isEdit ? "Edit Template" : "Create Template"}
      description="Design HTML templates using placeholders like {{FIRST_NAME}} and {{EMPLOYEE_ID}}"
      onBack={() => navigate('/settings/templates')}
      loading={loading}
      error={error}
    >
      <form onSubmit={handleSave}>
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Template Settings</h6>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" name="active" checked={formData.active} onChange={handleChange} disabled={!canUpdate} id="activeSwitch" />
              <label className="form-check-label" htmlFor="activeSwitch" style={{ fontSize: '13px' }}>Active</label>
            </div>
          </div>
          <div className="card-body px-4 py-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Template Type *</label>
                <select className="form-select form-select-sm" name="templateType" value={formData.templateType} onChange={handleChange} required disabled={!canUpdate}>
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Template Code *</label>
                <input type="text" className="form-control form-control-sm" name="templateCode" value={formData.templateCode} onChange={handleChange} required disabled={!canUpdate || isEdit} placeholder="e.g. OFFER_LETTER" />
                <div className="form-text" style={{ fontSize: '11px' }}>Immutable unique code for business logic.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Template Name *</label>
                <input type="text" className="form-control form-control-sm" name="templateName" value={formData.templateName} onChange={handleChange} required disabled={!canUpdate} placeholder="e.g. Standard Offer Letter" />
              </div>
              <div className="col-md-12">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Background Image URL</label>
                <input type="url" className="form-control form-control-sm" name="backgroundImageUrl" value={formData.backgroundImageUrl} onChange={handleChange} disabled={!canUpdate} placeholder="https://example.com/certificate-bg.png" />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">HTML Content</h6>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewOpen(!previewOpen)} style={{ fontSize: '12px' }}>
              {previewOpen ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          <div className="card-body px-0 py-0 row g-0">
            <div className="col-md-9 border-end p-4">
              <textarea 
                id="htmlEditor"
                className="form-control font-monospace border-0 bg-light" 
                name="contentHtml" 
                rows="15" 
                value={formData.contentHtml} 
                onChange={handleChange} 
                required 
                disabled={!canUpdate || (formData.isSystemTemplate && !formData.isEditable)}
                style={{ fontSize: '13px', resize: 'vertical' }}
                placeholder="<h1>Offer Letter for {{FIRST_NAME}}</h1>..."
              ></textarea>

              {previewOpen && (
                <div className="mt-4 border rounded p-4 bg-light position-relative" style={{ minHeight: '300px' }}>
                  <h6 className="text-muted mb-3" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Live Preview</h6>
                  <div 
                    className="bg-white shadow-sm border p-5"
                    style={{ 
                      backgroundImage: formData.backgroundImageUrl ? `url(${formData.backgroundImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '400px'
                    }}
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              )}
            </div>
            <div className="col-md-3 p-4 bg-white">
              <h6 className="fw-semibold text-dark" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Available Placeholders</h6>
              <p className="text-muted mb-3" style={{ fontSize: '11px' }}>Click to insert at cursor position</p>
              <div className="d-flex flex-column gap-2">
                {Object.keys(sampleData).map(key => (
                  <button 
                    key={key} 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary text-start text-truncate"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    onClick={() => {
                      const editor = document.getElementById('htmlEditor');
                      if (!editor) return;
                      const start = editor.selectionStart;
                      const end = editor.selectionEnd;
                      const text = formData.contentHtml;
                      const before = text.substring(0, start);
                      const after = text.substring(end, text.length);
                      const insertion = `{{${key}}}`;
                      setFormData(prev => ({ ...prev, contentHtml: before + insertion + after }));
                      setTimeout(() => {
                        editor.focus();
                        editor.setSelectionRange(start + insertion.length, start + insertion.length);
                      }, 0);
                    }}
                    disabled={!canUpdate || (formData.isSystemTemplate && !formData.isEditable)}
                    title={`Insert {{${key}}}`}
                  >
                    {`{{${key}}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mb-5 gap-2">
          <button type="button" className="btn btn-light btn-sm px-4 border" onClick={() => navigate('/settings/templates')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm px-4" disabled={saving || !canUpdate}>
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </EntityFormPage>
  );
}
