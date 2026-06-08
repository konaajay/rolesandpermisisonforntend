import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';
import Select from 'react-select';
import JoditEditor from 'jodit-react';
import SettingsNav from '../components/SettingsNav';

export default function CertificatesList() {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState({
    employeeId: '',
    templateId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    customHtml: '',
    sendEmail: false
  });
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef(null);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certRes, tempRes, empRes] = await Promise.all([
        api.get('/certificates'),
        api.get('/templates'),
        api.get('/users')
      ]);
      setCertificates(certRes.data);
      setTemplates(tempRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!generateData.employeeId || !generateData.templateId) {
      alert("Please select both Employee and Template.");
      return;
    }
    setPreviewing(true);
    try {
      const payload = {
        employeeId: generateData.employeeId,
        templateId: generateData.templateId,
        issuedDate: new Date(generateData.issuedDate).toISOString()
      };
      const res = await api.post('/certificates/preview', payload);
      setGenerateData(prev => ({ ...prev, customHtml: res.data }));
      setIsPreviewMode(true);
    } catch (err) {
      alert('Failed to load preview: ' + (err.response?.data?.message || err.message));
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        employeeId: generateData.employeeId,
        templateId: generateData.templateId,
        issuedDate: new Date(generateData.issuedDate).toISOString(),
        customHtml: generateData.customHtml,
        sendEmail: generateData.sendEmail
      };
      await api.post('/certificates/generate', payload);
      setShowGenerateModal(false);
      setIsPreviewMode(false);
      fetchData();
    } catch (err) {
      alert('Failed to generate document: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF.');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this document?")) return;
    try {
      await api.put(`/certificates/${id}/revoke`);
      fetchData();
    } catch (err) {
      alert('Failed to revoke document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerify = (cert) => {
    setVerifyData(cert);
    setShowVerifyModal(true);
  };

  const filtered = certificates.filter(c => 
    c.certificateNo.toLowerCase().includes(search.toLowerCase()) ||
    c.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SettingsNav />
      <EntityListPage
        title="Employee Documents & Certificates"
        description="Generate, view, and revoke documents and certificates for employees."
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        totalCount={!loading ? filtered.length : undefined}
        headerActions={
          <button
            className="btn btn-primary btn-sm fw-medium"
            onClick={() => {
              setGenerateData({ employeeId: '', templateId: '', issuedDate: new Date().toISOString().split('T')[0], customHtml: '', sendEmail: false });
              setIsPreviewMode(false);
              setShowGenerateModal(true);
            }}
          >
            + Generate Document / Cert
          </button>
        }
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 border-0">Document No</th>
                <th className="py-3 border-0">Employee ID</th>
                <th className="py-3 border-0">Template</th>
                <th className="py-3 border-0">Issued Date</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 pe-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted small">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td className="ps-4 font-monospace">{c.certificateNo}</td>
                    <td>{c.employeeId}</td>
                    <td>{c.template?.templateName || 'Unknown'}</td>
                    <td>{new Date(c.issuedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} border`} style={{ fontSize: '11px' }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-3">
                        <button className="btn btn-sm btn-link text-info p-0 text-decoration-none" onClick={() => handleVerify(c)}>
                          🔍 Verify
                        </button>
                        <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none" onClick={() => handleDownload(c.id)}>
                          ⬇️ Download PDF
                        </button>
                        {c.status === 'ACTIVE' && (
                          <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" onClick={() => handleRevoke(c.id)}>
                            🚫 Revoke
                          </button>
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

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow" style={{ minHeight: '400px' }}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{isPreviewMode ? 'Preview & Edit Document' : 'Generate Document / Certificate'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <form onSubmit={isPreviewMode ? handleGenerate : handlePreview}>
                <div className="modal-body py-4">
                  {!isPreviewMode ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Employee</label>
                        <Select
                          options={employees.map(emp => ({ value: emp.employeeId, label: `${emp.firstName} ${emp.lastName} (${emp.employeeId})` }))}
                          onChange={option => setGenerateData({...generateData, employeeId: option ? option.value : ''})}
                          placeholder="Search Employee..."
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Document / Certificate Template</label>
                        <Select
                          options={templates.map(t => ({ value: t.id, label: t.templateName }))}
                          onChange={option => setGenerateData({...generateData, templateId: option ? option.value : ''})}
                          placeholder="Search Template..."
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Issue Date</label>
                        <input 
                          className="form-control"
                          type="date" 
                          required 
                          value={generateData.issuedDate}
                          onChange={e => setGenerateData({...generateData, issuedDate: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Edit Document Content</label>
                        <div className="border rounded">
                          <JoditEditor
                            ref={editorRef}
                            value={generateData.customHtml}
                            config={{ readonly: false, height: 400, showCharsCounter: false, showWordsCounter: false, showXPathInStatusbar: false }}
                            onBlur={newContent => setGenerateData({...generateData, customHtml: newContent})}
                          />
                        </div>
                      </div>
                      <div className="form-check mt-3">
                        <input className="form-check-input" type="checkbox" id="sendEmail" checked={generateData.sendEmail} onChange={e => setGenerateData({...generateData, sendEmail: e.target.checked})} />
                        <label className="form-check-label fw-medium" htmlFor="sendEmail">
                          Send PDF directly to employee's email
                        </label>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer pt-0 border-0 d-flex justify-content-between">
                  {isPreviewMode ? (
                    <button type="button" className="btn btn-light border" onClick={() => setIsPreviewMode(false)}>Back</button>
                  ) : <div></div>}
                  
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light border" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                    {!isPreviewMode ? (
                      <button type="submit" className="btn btn-primary" disabled={previewing}>
                        {previewing ? 'Loading Preview...' : 'Preview & Edit'}
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-primary" disabled={generating}>
                        {generating ? 'Generating...' : 'Finalize & Generate'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && verifyData && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold">Verification Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowVerifyModal(false)}></button>
              </div>
              <div className="modal-body py-4 text-center">
                <div className="mb-4">
                  <h6 className="text-secondary small fw-bold text-uppercase mb-1">Certificate Number</h6>
                  <p className="fs-5 fw-medium text-dark font-monospace mb-0">{verifyData.certificateNo}</p>
                </div>
                
                <div className="mb-4">
                  <h6 className="text-secondary small fw-bold text-uppercase mb-1">Status</h6>
                  <span className={`badge ${verifyData.status === 'ACTIVE' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} border fs-6`} style={{ padding: '8px 16px' }}>
                    {verifyData.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h6 className="text-secondary small fw-bold text-uppercase mb-2">Verification URL</h6>
                  <a href={`${window.location.origin}/verify/${verifyData.verificationToken}`} target="_blank" rel="noreferrer" className="text-primary text-decoration-none fw-medium" style={{ wordBreak: 'break-all' }}>
                    {`${window.location.origin}/verify/${verifyData.verificationToken}`}
                  </a>
                </div>

                <div className="mb-2">
                  <h6 className="text-secondary small fw-bold text-uppercase mb-3">Scan QR Code</h6>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/verify/${verifyData.verificationToken}`)}`} 
                    alt="QR Code" 
                    className="border p-2 rounded shadow-sm bg-white"
                  />
                </div>
              </div>
              <div className="modal-footer pt-0 border-0 d-flex justify-content-center">
                <button type="button" className="btn btn-secondary w-50" onClick={() => setShowVerifyModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
