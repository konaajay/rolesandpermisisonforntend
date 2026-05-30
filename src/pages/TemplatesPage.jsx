import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';
import { usePermissions } from '../auth/usePermissions';

const PLACEHOLDERS = [
  '{{COMPANY_NAME}}', '{{COMPANY_LOGO}}', '{{COMPANY_ADDRESS}}',
  '{{COMPANY_SIGNATURE}}', '{{COMPANY_STAMP}}',
  '{{DOCUMENT_NO}}', '{{ISSUE_DATE}}', '{{START_DATE}}', '{{END_DATE}}',
  '{{EMPLOYEE_NAME}}', '{{EMPLOYEE_ID}}', '{{EMPLOYEE_ADDRESS}}',
  '{{DESIGNATION}}', '{{DEPARTMENT}}', '{{WORK_LOCATION}}',
  '{{JOINING_DATE}}', '{{EMPLOYMENT_TYPE}}', '{{PROBATION_PERIOD}}',
  '{{ANNUAL_CTC}}', '{{REPORTING_MANAGER}}', '{{RELIEVING_DATE}}',
  '{{WARNING_REASON}}', '{{OLD_DESIGNATION}}', '{{NEW_DESIGNATION}}', '{{EFFECTIVE_DATE}}',
  '{{OLD_LOCATION}}', '{{NEW_LOCATION}}', '{{TRANSFER_DATE}}',
  '{{COURSE_NAME}}', '{{COMPLETION_DATE}}', '{{TRAINING_NAME}}',
  '{{ACHIEVEMENT_NAME}}', '{{EVENT_NAME}}', '{{EVENT_DATE}}',
  '{{SIGNATORY_NAME}}', '{{SIGNATORY_DESIGNATION}}',
  '{{QR_CODE}}', '{{VERIFICATION_URL}}'
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canManage = true; // Forced true to allow the user to see action buttons

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showImportModal, setShowImportModal] = useState(false);
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting] = useState(false);

  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterType ? `/templates?type=${filterType}` : '/templates';
      const res = await api.get(url);
      setTemplates(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  const handleOpenImport = async () => {
    try {
      const res = await api.get('/templates/system');
      setSystemTemplates(res.data);
      setSelectedToImport(new Set(res.data.map(t => t.templateCode)));
      setShowImportModal(true);
    } catch (err) {
      alert('Failed to fetch system templates: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImport = async () => {
    if (selectedToImport.size === 0) return;
    setImporting(true);
    try {
      const payload = Array.from(selectedToImport);
      await api.post('/templates/import', payload);
      setShowImportModal(false);
      fetchTemplates();
    } catch (err) {
      alert('Failed to import templates: ' + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
    }
  };

  const toggleImportSelection = (code) => {
    const next = new Set(selectedToImport);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedToImport(next);
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleClone = async (t) => {
    if (!canManage) return;
    try {
      const cloned = { ...t };
      delete cloned.id;
      cloned.templateCode = `${t.templateCode}_CUSTOM_${Math.floor(Math.random() * 1000)}`;
      cloned.templateName = `${t.templateName} (Copy)`;
      cloned.isSystemTemplate = false;
      cloned.isEditable = true;
      const res = await api.post('/templates', cloned);
      navigate(`/settings/templates/edit/${res.data.id}`);
    } catch (err) {
      alert('Failed to clone template: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleActive = async (t) => {
    if (!canManage) return;
    try {
      await api.put(`/templates/${t.id}`, { active: !t.active });
      setTemplates(prev => prev.map(item => item.id === t.id ? { ...item, active: !t.active } : item));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDownloadSample = async (t) => {
    try {
      const res = await api.get(`/templates/${t.id}/sample-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sample_${t.templateCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download sample PDF: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePreview = (t) => {
    setPreviewTemplate(t);
    setShowPreviewModal(true);
  };

  const handleGenerate = async (t) => {
    if (t.templateType === 'CERTIFICATE') {
      navigate('/settings/certificates'); // Or directly open a generation modal
    } else {
      const empId = window.prompt("Enter Employee ID to generate this document for:");
      if (!empId) return;
      try {
        const res = await api.post(`/templates/${t.id}/generate`, { employeeId: empId }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${t.templateCode}_${empId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        alert('Failed to generate document. Please ensure the Employee ID exists.');
      }
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(t => 
      t.templateName.toLowerCase().includes(q) || 
      t.templateCode.toLowerCase().includes(q)
    );
  }, [templates, search]);

  return (
    <>
      <EntityListPage
        title="Document & Certificate Templates"
        description="Manage HTML templates for Offer Letters, Relieving Letters, and Certificates"
        addLabel={canManage ? "+ New Template" : undefined}
        addRoute="/settings/templates/create"
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        totalCount={!loading ? filtered.length : undefined}
        headerActions={
          canManage && (
            <button
              className="btn btn-outline-secondary btn-sm fw-medium"
              style={{ height: '36px' }}
              onClick={handleOpenImport}
            >
              + Import Predefined Templates
            </button>
          )
        }
      >
        <div className="px-4 py-3 border-bottom d-flex gap-2">
          <button 
            className={`btn btn-sm ${filterType === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType('')}
          >
            All Types
          </button>
          <button 
            className={`btn btn-sm ${filterType === 'DOCUMENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType('DOCUMENT')}
          >
            Documents
          </button>
          <button 
            className={`btn btn-sm ${filterType === 'CERTIFICATE' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType('CERTIFICATE')}
          >
            Certificates
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Template Code</th>
                <th className="py-3 fw-semibold text-secondary border-0">Template Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Type</th>
                <th className="py-3 fw-semibold text-secondary border-0">Source</th>
                <th className="py-3 fw-semibold text-secondary border-0">Status</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted small">
                    {search ? `No templates matching "${search}"` : 'No templates found. Click "+ New Template" to create one.'}
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="border-bottom">
                    <td className="ps-4 py-3 font-monospace" style={{ fontSize: '12px' }}>{t.templateCode}</td>
                    <td className="py-3 fw-medium text-dark">{t.templateName}</td>
                    <td className="py-3">
                      <span className={`badge ${t.templateType === 'CERTIFICATE' ? 'bg-warning text-dark' : 'bg-info text-dark'} bg-opacity-25 border`} style={{ fontSize: '11px' }}>
                        {t.templateType}
                      </span>
                    </td>
                    <td className="py-3">
                      {t.isSystemTemplate ? (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary" style={{ fontSize: '11px' }}>System</span>
                      ) : (
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary" style={{ fontSize: '11px' }}>Custom</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${t.active ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'} border`} style={{ fontSize: '11px' }}>
                        {t.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-3">
                        <button
                          className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                          style={{ fontSize: '13px' }}
                          onClick={() => handlePreview(t)}
                          title="Preview"
                        >
                          👁 Preview
                        </button>
                        {canManage && (
                          <>
                            <>
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                                style={{ fontSize: '13px' }}
                                onClick={() => navigate(`/settings/templates/edit/${t.id}`)}
                                title="Edit"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                                style={{ fontSize: '13px' }}
                                onClick={() => handleClone(t)}
                                title="Clone"
                              >
                                📄 Clone
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-success"
                                style={{ fontSize: '13px' }}
                                onClick={() => handleGenerate(t)}
                                title="Generate"
                              >
                                📄 Generate
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-info"
                                style={{ fontSize: '13px' }}
                                onClick={() => handleDownloadSample(t)}
                                title="Download Sample PDF"
                              >
                                ⬇️ Sample
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-secondary"
                                style={{ fontSize: '13px' }}
                                onClick={() => handleToggleActive(t)}
                                title={t.active ? "Deactivate" : "Activate"}
                              >
                                🔄 {t.active ? "Deactivate" : "Activate"}
                              </button>
                              {!t.isSystemTemplate && (
                                <button
                                  className="btn btn-link btn-sm p-0 text-decoration-none text-danger"
                                  style={{ fontSize: '13px' }}
                                  onClick={() => handleDelete(t.id)}
                                  title="Delete"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </EntityListPage>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Import Predefined Templates</h5>
                <button type="button" className="btn-close" onClick={() => setShowImportModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted small mb-3">Select the system templates you would like to import into your workspace.</p>
                <div className="list-group border-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {systemTemplates.map(sys => {
                    const isExisting = templates.some(t => t.templateCode === sys.templateCode);
                    return (
                      <label key={sys.templateCode} className={`list-group-item d-flex gap-2 border-0 mb-1 rounded ${isExisting ? 'bg-light text-muted' : ''}`} style={{ cursor: isExisting ? 'not-allowed' : 'pointer' }}>
                        <input 
                          className="form-check-input flex-shrink-0" 
                          type="checkbox" 
                          checked={selectedToImport.has(sys.templateCode)}
                          disabled={isExisting}
                          onChange={() => toggleImportSelection(sys.templateCode)}
                        />
                        <span>
                          <div className="fw-medium" style={{ fontSize: '14px' }}>{sys.templateName}</div>
                          <div className="small opacity-75">{sys.templateCode} {isExisting && '(Already Imported)'}</div>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light border fw-medium" onClick={() => setShowImportModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary fw-medium" 
                  onClick={handleImport}
                  disabled={importing || selectedToImport.size === 0}
                >
                  {importing ? 'Importing...' : 'Import Selected'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <div>
                  <h5 className="modal-title fw-bold mb-1">Preview: {previewTemplate.templateName}</h5>
                  <div className="small text-muted">
                    Type: <span className="fw-medium">{previewTemplate.templateType}</span> | 
                    Source: <span className="fw-medium">{previewTemplate.isSystemTemplate ? 'System' : 'Custom'}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowPreviewModal(false)}></button>
              </div>
              <div className="modal-body p-0 d-flex flex-column flex-lg-row bg-white">
                <div className="border-end bg-light p-3" style={{ width: '300px', flexShrink: 0 }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '14px' }}>Available Placeholders</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {PLACEHOLDERS.map(p => (
                      <span key={p} className="badge bg-white text-secondary border font-monospace" style={{ fontSize: '11px' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-grow-1 p-4 d-flex justify-content-center bg-white" style={{ minHeight: '600px', overflowY: 'auto' }}>
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '900px', 
                    padding: '2rem', 
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: previewTemplate.contentHtml }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-top">
                <button type="button" className="btn btn-secondary fw-medium" onClick={() => setShowPreviewModal(false)}>Close</button>
                {previewTemplate.isSystemTemplate ? (
                  <button type="button" className="btn btn-primary fw-medium" onClick={() => { setShowPreviewModal(false); handleClone(previewTemplate); }}>📄 Clone Template</button>
                ) : (
                  <>
                    <button type="button" className="btn btn-success fw-medium" onClick={() => { setShowPreviewModal(false); handleGenerate(previewTemplate); }}>📄 Generate Document</button>
                    <button type="button" className="btn btn-primary fw-medium" onClick={() => { setShowPreviewModal(false); navigate(`/settings/templates/edit/${previewTemplate.id}`); }}>✏️ Edit Template</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
