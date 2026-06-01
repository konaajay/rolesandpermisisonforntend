import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  
  const [tenantName, setTenantName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const payload = {
      tenantName,
      adminFirstName,
      adminLastName,
      adminEmail,
      phone,
      adminPassword,
    };

    try {
      // Calls the new public endpoint
      await api.post('/auth/register-company', payload);
      setMessage('Company registered successfully! Your 15-Day Trial has started.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(145deg, #ffffff, #f1f3f6)' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="badge bg-primary px-3 py-2 rounded-pill mb-3" style={{ letterSpacing: '1px' }}>15-DAY FREE TRIAL</span>
            <h3 className="card-title font-weight-bold" style={{ color: '#2c3e50', letterSpacing: '0.5px' }}>
              Register Your Company
            </h3>
            <p className="text-muted">Create your workspace and start your free trial today</p>
          </div>

          {message && <div className="alert alert-success border-0 shadow-sm" style={{ borderRadius: '8px' }}>{message}</div>}
          {error && <div className="alert alert-danger border-0 shadow-sm" style={{ borderRadius: '8px' }}>{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label className="form-label text-secondary font-weight-bold small">Company Name</label>
              <input
                type="text"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">First Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Last Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Work Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  placeholder="john@acmecorp.com"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Phone Number</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary font-weight-bold small">Password</label>
              <input
                type="password"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg shadow-sm"
                style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #3498db, #2980b9)', border: 'none' }}
                disabled={loading}
              >
                {loading ? 'Setting up your workspace...' : 'Start Free Trial'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: '#3498db' }}>Sign In here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
