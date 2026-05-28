import React, { useState } from 'react';
import api from '../services/api';

export default function RegisterUser() {
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const payload = {
      tenantName,
      tenantCode: tenantCode || null,
      firstName,
      lastName,
      email,
      password,
    };

    try {
      const response = await api.post('/auth/register', payload);
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        setMessage('Tenant Admin Registration Successful! Token stored in localStorage.');
      } else {
        setMessage('Tenant Admin Registered successfully!');
      }
      // Reset form
      setTenantName('');
      setTenantCode('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card p-4 shadow-sm">
        <h3 className="card-title text-center mb-4">Register Tenant & Admin User</h3>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Code (Optional)</label>
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
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First Name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@company.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}
