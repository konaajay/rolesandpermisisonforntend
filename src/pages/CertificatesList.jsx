import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';

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
    issuedDate: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState(false);

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
        api.get('/templates?type=CERTIFICATE'),
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        ...generateData,
        issuedDate: new Date(generateData.issuedDate).toISOString()
      };
      await api.post('/certificates/generate', payload);
      setShowGenerateModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to generate certificate: ' + (err.response?.data?.message || err.message));
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
    if (!window.confirm("Are you sure you want to revoke this certificate? This action cannot be fully undone (it will show as revoked publicly).")) return;
    try {
      await api.put(`/certificates/${id}/revoke`);
      fetchData();
    } catch (err) {
      alert('Failed to revoke certificate: ' + (err.response?.data?.message || err.message));
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
      <EntityListPage
        title="Employee Certificates"
        description="Generate, view, and revoke certificates for employees."
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        totalCount={!loading ? filtered.length : undefined}
        headerActions={
          <button
            className="btn btn-primary btn-sm fw-medium"
            onClick={() => setShowGenerateModal(true)}
          >
            + Generate Certificate
          </button>
        }
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 border-0">Certificate No</th>
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
                    No certificates found.
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
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Generate Certificate</h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <form onSubmit={handleGenerate}>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Employee</label>
                    <select 
                      className="form-select"
                      required 
                      value={generateData.employeeId}
                      onChange={e => setGenerateData({...generateData, employeeId: e.target.value})}
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.employeeId}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Certificate Template</label>
                    <select 
                      className="form-select"
                      required 
                      value={generateData.templateId}
                      onChange={e => setGenerateData({...generateData, templateId: e.target.value})}
                    >
                      <option value="">Select Template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.templateName}
                        </option>
                      ))}
                    </select>
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
                </div>
                <div className="modal-footer pt-0 border-0">
                  <button type="button" className="btn btn-light border" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Certificate'}
                  </button>
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
