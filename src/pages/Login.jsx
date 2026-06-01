import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { getDefaultRoute } from '../auth/routeUtils';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, permissions } = useAuth();
  
  const [tenantId, setTenantId] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('danger');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRoute(user, permissions));
    }
  }, [isAuthenticated, user, permissions, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate that tenant locator is provided
    if (!tenantCode) {
      setError('Please provide your Workspace / Tenant Code.');
      return;
    }

    const payload = {
      email,
      password,
      tenantCode
    };

    try {
      const response = await api.post('/auth/login', payload);
      const token = response.data.token;
      const respPermissions = response.data.permissions || [];
      const respModules = response.data.modules || [];
      
      if (token) {
        login(token, respPermissions, respModules, tenantCode);
        setMessage('Login Successful! Redirecting...');
      } else {
        setError('Login failed: Token not received.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      if (typeof errorMsg === 'string' && errorMsg.startsWith('PAYMENT_REQUIRED:')) {
        setError(errorMsg.replace('PAYMENT_REQUIRED:', '').trim());
        setErrorType('warning');
      } else {
        setError(errorMsg);
        setErrorType('danger');
      }
    }
  };

  const fillSuperAdmin = () => {
    setTenantId('1');
    setTenantCode('');
    setEmail('superadmin@system.com');
    setPassword('superadmin');
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '550px' }}>
      <div className="card border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(145deg, #ffffff, #f1f3f6)' }}>
        <div className="card-body p-5">
          <h3 className="card-title text-center mb-2 font-weight-bold" style={{ color: '#2c3e50', letterSpacing: '0.5px' }}>
            Multi-Tenant Sign In
          </h3>
          <p className="text-muted text-center mb-4">Enter your credentials below to access your tenant database</p>

          {message && <div className="alert alert-success border-0 shadow-sm" style={{ borderRadius: '8px' }}>{message}</div>}
          {error && (
            <div className={`alert alert-${errorType} border-0 shadow-sm`} style={{ borderRadius: '8px', borderLeft: errorType === 'warning' ? '4px solid #ffc107' : 'none' }}>
              {errorType === 'warning' && <strong>Subscription Error: </strong>}
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-secondary font-weight-bold small">Workspace / Tenant Code</label>
              <input
                type="text"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                placeholder="e.g. ACME"
              />
              <small className="text-muted mt-1 d-block">This is the code you received during registration.</small>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary font-weight-bold small">Email address</label>
              <input
                type="email"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary font-weight-bold small">Password</label>
              <input
                type="password"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg shadow-sm"
                style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #3498db, #2980b9)', border: 'none' }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2 border-0"
                onClick={fillSuperAdmin}
              >
                Use Seeded Super Admin Credentials
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/signup" className="small fw-bold text-decoration-none" style={{ color: '#3498db' }}>Register your company here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
