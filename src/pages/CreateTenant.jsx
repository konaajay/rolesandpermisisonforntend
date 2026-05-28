import React, { useState } from 'react';
import api from '../services/api';

export default function CreateTenant() {
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setResult(null);

    const payload = {
      tenantName,
      tenantCode: tenantCode || null,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
    };

    try {
      const response = await api.post('/tenants', payload);
      setMessage('Tenant Created Successfully!');
      setResult(response.data);
      // Reset form
      setTenantName('');
      setTenantCode('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card p-4 shadow-sm">
        <h3 className="card-title text-center mb-4">Create Tenant (Super Admin)</h3>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleCreateTenant}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                placeholder="e.g. Acme Corporation"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Code</label>
              <input
                type="text"
                className="form-control"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                placeholder="e.g. ACM"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Admin First Name</label>
              <input
                type="text"
                className="form-control"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                required
                placeholder="First Name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Admin Last Name</label>
              <input
                type="text"
                className="form-control"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                required
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-control"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              placeholder="admin@acme.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Create Tenant</button>
          </div>
        </form>

        {result && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h5>Response Details:</h5>
            <pre style={{ fontSize: '0.85rem' }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
