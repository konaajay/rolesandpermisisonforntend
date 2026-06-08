import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tenantName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    phone: '',
    adminPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'tenantName':
        if (!value.trim()) error = 'Company name is required.';
        break;
      case 'adminFirstName':
        if (!/^[A-Za-z\s]+$/.test(value) || !value.trim()) error = 'Enter a valid first name.';
        break;
      case 'adminLastName':
        if (!/^[A-Za-z\s]+$/.test(value) || !value.trim()) error = 'Enter a valid last name.';
        break;
      case 'adminEmail':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!/^\d{10}$/.test(value)) error = 'Phone number must be exactly 10 digits.';
        break;
      case 'adminPassword':
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)) {
          error = 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent entering more than 10 digits for phone
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      setErrors(prev => ({ ...prev, [name]: validateField(name, numericValue) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });
    
    return isValid && Object.values(formData).every(val => val.trim() !== '');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Final validation check before submission
    const newErrors = {};
    let hasError = false;
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        hasError = true;
      }
      setTouched(prev => ({ ...prev, [key]: true }));
    });
    
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register-company', formData);
      showToast('Registration successful. Please check your email for login credentials.', 'success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (name) => {
    let baseClass = "form-control form-control-lg shadow-sm ";
    const hasError = errors[name];
    const isTouched = touched[name];
    const hasValue = formData[name] && formData[name].length > 0;

    // Show error if touched, OR if it's the password field and they started typing
    if (hasError && (isTouched || (name === 'adminPassword' && hasValue))) {
      return baseClass + "is-invalid border-danger";
    }
    // Show valid green checkmark as soon as field is valid and not empty
    if (!hasError && hasValue) {
      return baseClass + "is-valid border-success";
    }
    return baseClass + "border-0";
  };

  return (
    <div className="container mt-5 mb-5" style={{ maxWidth: '600px', position: 'relative' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`position-fixed top-0 start-50 translate-middle-x p-3 mt-4 rounded shadow-lg z-3 text-white transition-all`}
          style={{ 
            backgroundColor: toast.type === 'success' ? '#2ecc71' : '#e74c3c',
            zIndex: 9999,
            minWidth: '300px',
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="card border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(145deg, #ffffff, #f1f3f6)' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="badge bg-primary px-3 py-2 rounded-pill mb-3" style={{ letterSpacing: '1px' }}>15-DAY FREE TRIAL</span>
            <h3 className="card-title font-weight-bold" style={{ color: '#2c3e50', letterSpacing: '0.5px' }}>
              Register Your Company
            </h3>
            <p className="text-muted">Create your workspace and start your free trial today</p>
          </div>

          <form onSubmit={handleSignup} noValidate>
            <div className="mb-3">
              <label className="form-label text-secondary font-weight-bold small">Company Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="tenantName"
                className={getInputClass('tenantName')}
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={formData.tenantName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Acme Corp"
              />
              {errors.tenantName && (touched.tenantName) && (
                <div className="invalid-feedback d-block mt-1">{errors.tenantName}</div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="adminFirstName"
                  className={getInputClass('adminFirstName')}
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                />
                {errors.adminFirstName && (touched.adminFirstName) && (
                  <div className="invalid-feedback d-block mt-1">{errors.adminFirstName}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="adminLastName"
                  className={getInputClass('adminLastName')}
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={formData.adminLastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                />
                {errors.adminLastName && (touched.adminLastName) && (
                  <div className="invalid-feedback d-block mt-1">{errors.adminLastName}</div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Work Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  name="adminEmail"
                  className={getInputClass('adminEmail')}
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={formData.adminEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john@acmecorp.com"
                />
                {errors.adminEmail && (touched.adminEmail) && (
                  <div className="invalid-feedback d-block mt-1">{errors.adminEmail}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary font-weight-bold small">Phone Number <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="phone"
                  className={getInputClass('phone')}
                  style={{ borderRadius: '8px', fontSize: '15px' }}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="1234567890"
                />
                {errors.phone && (touched.phone) && (
                  <div className="invalid-feedback d-block mt-1">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary font-weight-bold small">Password <span className="text-danger">*</span></label>
              <input
                type="password"
                name="adminPassword"
                className={getInputClass('adminPassword')}
                style={{ borderRadius: '8px', fontSize: '15px' }}
                value={formData.adminPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
              />
              {errors.adminPassword && (touched.adminPassword || formData.adminPassword.length > 0) && (
                <div className="invalid-feedback d-block mt-1">{errors.adminPassword}</div>
              )}
            </div>

            <div className="d-grid gap-2 mt-4">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg shadow-sm"
                style={{ 
                  borderRadius: '8px', 
                  background: (!isFormValid() || loading) ? '#95a5a6' : 'linear-gradient(135deg, #3498db, #2980b9)', 
                  border: 'none',
                  cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
                disabled={!isFormValid() || loading}
              >
                {loading ? (
                  <span><i className="spinner-border spinner-border-sm me-2"></i>Setting up your workspace...</span>
                ) : 'Start Free Trial'}
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
