import React, { useState } from 'react';
import api from '../services/api';

export default function RegisterUser() {
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
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
        if (!value.trim()) error = 'Tenant name is required.';
        break;
      case 'tenantCode':
        if (value && !/^[A-Za-z0-9]+$/.test(value)) {
          error = 'Tenant code must be alphanumeric.';
        }
        break;
      case 'firstName':
        if (!/^[A-Za-z\s]+$/.test(value) || !value.trim()) error = 'Enter a valid first name.';
        break;
      case 'lastName':
        if (!/^[A-Za-z\s]+$/.test(value) || !value.trim()) error = 'Enter a valid last name.';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
        break;
      case 'password':
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
    
    // Prevent invalid tenant code characters (only alphanumeric allowed)
    if (name === 'tenantCode') {
      const alphaNumValue = value.replace(/[^A-Za-z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: alphaNumValue }));
      setErrors(prev => ({ ...prev, [name]: validateField(name, alphaNumValue) }));
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
    
    const requiredFields = ['tenantName', 'firstName', 'lastName', 'email', 'password'];
    const areRequiredFilled = requiredFields.every(field => formData[field].trim() !== '');
    
    return isValid && areRequiredFilled;
  };

  const handleRegister = async (e) => {
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

    const payload = {
      ...formData,
      tenantCode: formData.tenantCode || null,
    };

    try {
      const response = await api.post('/auth/register', payload);
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        showToast('Tenant Admin Registration Successful! Token stored in localStorage.', 'success');
      } else {
        showToast('Tenant Admin Registered successfully!', 'success');
      }
      // Reset form
      setFormData({
        tenantName: '',
        tenantCode: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      setTouched({});
      setErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (name) => {
    let baseClass = "form-control ";
    const hasError = errors[name];
    const isTouched = touched[name];
    const hasValue = formData[name] && formData[name].length > 0;

    if (hasError && (isTouched || (name === 'password' && hasValue))) {
      return baseClass + "is-invalid";
    }
    if (!hasError && hasValue) {
      return baseClass + "is-valid";
    }
    return baseClass;
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px', position: 'relative' }}>
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

      <div className="card p-4 shadow-sm">
        <h3 className="card-title text-center mb-4">Register Tenant & Admin User</h3>

        <form onSubmit={handleRegister} noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="tenantName"
                className={getInputClass('tenantName')}
                value={formData.tenantName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Acme Corp"
              />
              {errors.tenantName && (touched.tenantName) && (
                <div className="invalid-feedback d-block mt-1">{errors.tenantName}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Tenant Code (Optional)</label>
              <input
                type="text"
                name="tenantCode"
                className={getInputClass('tenantCode')}
                value={formData.tenantCode}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. ACM"
              />
              {errors.tenantCode && (touched.tenantCode) && (
                <div className="invalid-feedback d-block mt-1">{errors.tenantCode}</div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="firstName"
                className={getInputClass('firstName')}
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="First Name"
              />
              {errors.firstName && (touched.firstName) && (
                <div className="invalid-feedback d-block mt-1">{errors.firstName}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="lastName"
                className={getInputClass('lastName')}
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Last Name"
              />
              {errors.lastName && (touched.lastName) && (
                <div className="invalid-feedback d-block mt-1">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Email <span className="text-danger">*</span></label>
            <input
              type="email"
              name="email"
              className={getInputClass('email')}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="admin@company.com"
            />
            {errors.email && (touched.email) && (
              <div className="invalid-feedback d-block mt-1">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Password <span className="text-danger">*</span></label>
            <input
              type="password"
              name="password"
              className={getInputClass('password')}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
            />
            {errors.password && (touched.password || formData.password.length > 0) && (
              <div className="invalid-feedback d-block mt-1">{errors.password}</div>
            )}
          </div>

          <div className="d-grid mt-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormValid() || loading}
              style={{
                cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span><i className="spinner-border spinner-border-sm me-2"></i>Registering...</span>
              ) : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
