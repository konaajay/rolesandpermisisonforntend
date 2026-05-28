import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRoute(user, permissions));
    }
  }, [isAuthenticated, user, permissions, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate that at least one tenant locator is provided
    if (!tenantId && !tenantCode) {
      setError('Please provide either a Tenant ID or a Tenant Code.');
      return;
    }

    const payload = {
      email,
      password,
    };

    if (tenantId) {
      payload.tenantId = parseInt(tenantId);
    }

    const headers = {};
    if (tenantCode) {
      headers['X-Tenant'] = tenantCode;
    }

    try {
      const response = await api.post('/auth/login', payload, { headers });
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
      setError(err.response?.data?.message || err.response?.data || err.message);
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
          {error && <div className="alert alert-danger border-0 shadow-sm" style={{ borderRadius: '8px' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Tenant ID</label>
                <input
                  type="number"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={tenantId}
                  onChange={(e) => {
                    setTenantId(e.target.value);
                    if (e.target.value) setTenantCode('');
                  }}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Tenant Code (Header)</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={tenantCode}
                  onChange={(e) => {
                    setTenantCode(e.target.value);
                    if (e.target.value) setTenantId('');
                  }}
                  placeholder="e.g. INF"
                />
              </div>
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
          </form>
        </div>
      </div>
    </div>
  );
}
