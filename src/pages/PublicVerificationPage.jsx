import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PublicVerificationPage() {
  const { identifier } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/public/verify/${identifier}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Certificate Not Found");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [identifier]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-header bg-white border-0 text-center pt-4 pb-0">
          <h4 className="fw-bold text-dark mb-0">Certificate Verification</h4>
        </div>
        <div className="card-body p-4">
          {error ? (
            <div className="text-center py-4">
              <div className="display-1 text-danger mb-3">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <h5 className="fw-bold text-dark">Verification Failed</h5>
              <p className="text-muted">{error}</p>
              <Link to="/" className="btn btn-primary mt-3 px-4">Go Home</Link>
            </div>
          ) : data.status === 'REVOKED' ? (
            <div className="text-center py-4">
              <div className="display-1 text-danger mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h5 className="fw-bold text-dark">Certificate Revoked ❌</h5>
              <p className="text-muted">This certificate has been revoked by the issuing authority.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="display-1 text-success mb-3">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h5 className="fw-bold text-success mb-4">Certificate Valid ✓</h5>
              
              <div className="text-start bg-light p-4 rounded-3 border">
                <div className="row mb-2">
                  <div className="col-5 text-muted fw-medium">Certificate No:</div>
                  <div className="col-7 fw-bold">{data.certificateNo}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted fw-medium">Employee Name:</div>
                  <div className="col-7 fw-bold">{data.employeeName}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted fw-medium">Certificate Type:</div>
                  <div className="col-7 fw-bold">{data.certificateType}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted fw-medium">Issue Date:</div>
                  <div className="col-7 fw-bold">{new Date(data.issuedDate).toLocaleDateString()}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted fw-medium">Issued By:</div>
                  <div className="col-7 fw-bold">{data.issuedBy}</div>
                </div>
                <div className="row">
                  <div className="col-5 text-muted fw-medium">Status:</div>
                  <div className="col-7 fw-bold text-success">Active</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="card-footer bg-white border-0 text-center pb-4 text-muted small">
          Powered by Enterprise SaaS
        </div>
      </div>
    </div>
  );
}
