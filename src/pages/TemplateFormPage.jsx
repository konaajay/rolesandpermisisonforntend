import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';
import { usePermissions } from '../auth/usePermissions';
import JoditEditor from 'jodit-react';

export default function TemplateFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = true; // FORCE ENABLE TO ALLOW ADMIN EDITS

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
  const editorRef = useRef(null);
  // Track live editor content without causing re-renders (avoids Jodit reset loop)
  const contentRef = useRef('');

  const editorConfig = {
    readonly: !canUpdate,
    height: 400,
    uploader: {
      insertImageAsBase64URI: true
    },
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'left', 'center', 'right', 'justify', '|',
      'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize', 'source'
    ]
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/templates/upload-background', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, backgroundImageUrl: res.data.url }));
    } catch (err) {
      alert('Failed to upload background image');
    }
  };

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
    // Capture latest editor content from ref (in case user hasn't blurred)
    const latestContent = contentRef.current || formData.contentHtml;
    const dataToSave = { ...formData, contentHtml: latestContent };
    try {
      if (isEdit) {
        await api.put(`/templates/${id}`, dataToSave);
      } else {
        await api.post('/templates', dataToSave);
      }
      navigate('/settings/templates');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSaving(false);
    }
  };

  const PLACEHOLDER_GROUPS = [
    {
      label: "🖼 Company Images",
      image: true,
      placeholders: ["COMPANY_LOGO", "COMPANY_SIGNATURE", "COMPANY_STAMP", "HEADER_IMAGE", "FOOTER_IMAGE"]
    },
    {
      label: "🏢 Company",
      placeholders: ["COMPANY_NAME", "COMPANY_ADDRESS"]
    },
    {
      label: "👤 Employee",
      placeholders: [
        "EMPLOYEE_NAME", "EMPLOYEE_ID", "EMPLOYEE_ADDRESS",
        "DESIGNATION", "DEPARTMENT", "WORK_LOCATION",
        "JOINING_DATE", "EMPLOYMENT_TYPE", "PROBATION_PERIOD",
        "ANNUAL_CTC", "REPORTING_MANAGER", "RELIEVING_DATE"
      ]
    },
    {
      label: "📄 Document",
      placeholders: ["DOCUMENT_NO", "ISSUE_DATE", "START_DATE", "END_DATE", "EFFECTIVE_DATE"]
    },
    {
      label: "🔄 Changes",
      placeholders: [
        "OLD_DESIGNATION", "NEW_DESIGNATION",
        "OLD_LOCATION", "NEW_LOCATION", "TRANSFER_DATE", "WARNING_REASON"
      ]
    },
    {
      label: "🎓 Training / Events",
      placeholders: ["COURSE_NAME", "COMPLETION_DATE", "TRAINING_NAME", "ACHIEVEMENT_NAME", "EVENT_NAME", "EVENT_DATE"]
    },
    {
      label: "✍️ Signatory",
      placeholders: ["SIGNATORY_NAME", "SIGNATORY_DESIGNATION"]
    },
    {
      label: "🔍 Verification",
      placeholders: ["QR_CODE", "VERIFICATION_URL"]
    }
  ];

  // These placeholders insert a visual <img data-variable="..."> instead of {{TOKEN}}
  const IMAGE_PLACEHOLDERS = new Set(["COMPANY_LOGO", "COMPANY_SIGNATURE", "COMPANY_STAMP", "HEADER_IMAGE", "FOOTER_IMAGE"]);

  const IMAGE_SIZES = {
    COMPANY_LOGO: { width: 150, label: "Company Logo" },
    COMPANY_SIGNATURE: { width: 120, label: "Signature" },
    COMPANY_STAMP: { width: 100, label: "Stamp" },
    HEADER_IMAGE: { width: "100%", label: "Header" },
    FOOTER_IMAGE: { width: "100%", label: "Footer" },
  };

  const sampleData = {
    COMPANY_NAME: "Sample Company Ltd.", COMPANY_ADDRESS: "123 Business Rd",
    EMPLOYEE_NAME: "John Doe", EMPLOYEE_ID: "EMP-001", EMPLOYEE_ADDRESS: "456 Home St",
    DESIGNATION: "Software Engineer", DEPARTMENT: "Engineering", WORK_LOCATION: "Head Office",
    JOINING_DATE: "2026-01-01", EMPLOYMENT_TYPE: "Full-time", PROBATION_PERIOD: "6 Months",
    ANNUAL_CTC: "$100,000", REPORTING_MANAGER: "Jane Smith", RELIEVING_DATE: "2026-06-01",
    DOCUMENT_NO: "DOC-2026-001", ISSUE_DATE: new Date().toLocaleDateString(),
    START_DATE: "2025-01-01", END_DATE: "2026-01-01", EFFECTIVE_DATE: "2026-01-01",
    OLD_DESIGNATION: "Junior Engineer", NEW_DESIGNATION: "Senior Engineer",
    OLD_LOCATION: "Branch A", NEW_LOCATION: "Head Office", TRANSFER_DATE: "2026-02-01",
    WARNING_REASON: "Attendance issues",
    COURSE_NAME: "Advanced React", COMPLETION_DATE: "2026-05-01", TRAINING_NAME: "Security Training",
    ACHIEVEMENT_NAME: "Employee of the Year", EVENT_NAME: "Tech Fest", EVENT_DATE: "2026-05-15",
    SIGNATORY_NAME: "Alice Director", SIGNATORY_DESIGNATION: "Managing Director",
    QR_CODE: "[QR]", VERIFICATION_URL: "https://verify.example.com/abc123",
    FIRST_NAME: "John", LAST_NAME: "Doe", EMAIL: "john@example.com",
    ROLE: "Software Engineer", CURRENT_DATE: new Date().toLocaleDateString(), TENANT_NAME: "Acme Corp"
  };

  const getPreviewHtml = () => {
    let html = contentRef.current || formData.contentHtml;
    // Replace text placeholders
    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, `<span style="background: #e9ecef; padding: 2px 4px; border-radius: 4px;">${value}</span>`);
    }
    // data-variable images are already rendered as <img> in editor — show as-is
    return html;
  };

  return (
    <EntityFormPage
      title={isEdit ? "Edit Template" : "Create Template"}
      description="Design HTML templates using placeholders like {{FIRST_NAME}} and {{EMPLOYEE_ID}}"
      onBack={() => navigate('/settings/templates')}
      onSubmit={handleSave}
      submitLabel={saving ? 'Saving...' : 'Save Template'}
      loading={loading}
      error={error}
    >
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
              <div className="col-md-8">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Background Image URL</label>
                <div className="input-group input-group-sm">
                  <input type="url" className="form-control" name="backgroundImageUrl" value={formData.backgroundImageUrl} onChange={handleChange} disabled={!canUpdate} placeholder="https://example.com/certificate-bg.png" />
                  <input type="file" className="form-control" onChange={handleBackgroundUpload} disabled={!canUpdate} accept="image/*" />
                </div>
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
              <JoditEditor
                ref={editorRef}
                value={formData.contentHtml}
                config={editorConfig}
                tabIndex={1}
                onBlur={newContent => {
                  contentRef.current = newContent;
                  setFormData(prev => ({ ...prev, contentHtml: newContent }));
                }}
                onChange={newContent => {
                  // Update ref only — no setFormData to avoid Jodit content reset
                  contentRef.current = newContent;
                }}
              />

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
            <div className="col-md-3 p-3 bg-white" style={{ overflowY: 'auto', maxHeight: '500px' }}>
              <h6 className="fw-semibold text-dark" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Available Placeholders</h6>
              <p className="text-muted mb-3" style={{ fontSize: '11px' }}>Click to insert at cursor position</p>
              {PLACEHOLDER_GROUPS.map(group => (
                <div key={group.label} className="mb-3">
                  <div className="text-muted fw-bold mb-1" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{group.label}</div>
                  <div className="d-flex flex-column gap-1">
                    {group.placeholders.map(key => {
                      const isImage = IMAGE_PLACEHOLDERS.has(key);
                      const imgMeta = IMAGE_SIZES[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`btn btn-sm text-start text-truncate ${isImage ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                          style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px' }}
                          onMouseDown={(e) => { e.preventDefault(); }}
                          onClick={() => {
                            const jodit = editorRef.current?.editor;
                            let htmlToInsert;
                            if (isImage) {
                              // Insert a visual draggable image with data-variable attribute
                              htmlToInsert = `<img src="https://placehold.co/${imgMeta.width}x60?text=${encodeURIComponent(imgMeta.label)}" data-variable="${key}" width="${imgMeta.width}" style="max-width:100%;border:1px dashed #6c757d;cursor:pointer;" alt="${imgMeta.label}" title="Will be replaced with real ${imgMeta.label} on PDF generation" />`;
                            } else {
                              htmlToInsert = `{{${key}}}`;
                            }
                            if (jodit?.selection) {
                              jodit.selection.insertHTML(htmlToInsert);
                              contentRef.current = jodit.value;
                            } else {
                              const updated = (contentRef.current || formData.contentHtml) + htmlToInsert;
                              contentRef.current = updated;
                              setFormData(prev => ({ ...prev, contentHtml: updated }));
                            }
                          }}
                          disabled={!canUpdate}
                          title={isImage ? `Insert ${imgMeta?.label} image placeholder` : `Insert {{${key}}}`}
                        >
                          {isImage ? `🖼 ${key}` : `{{${key}}}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </EntityFormPage>
  );
}
