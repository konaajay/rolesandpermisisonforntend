import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';

/* ── modern form field ──────────────────────────────────────── */
const ModernField = ({ label, required, children, hint }) => (
  <div className="mb-4">
    <label className="form-label fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7280' }}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
    {hint && <div className="form-text mt-1 text-muted" style={{ fontSize: '11px' }}>{hint}</div>}
  </div>
);

const inputCls = "form-control border-0 shadow-sm bg-light";
const inputStyle = { height: '48px', fontSize: '14px', borderRadius: '10px' };
const selectCls = "form-select border-0 shadow-sm bg-light";
const selectStyle = { height: '48px', fontSize: '14px', borderRadius: '10px' };

/* ── dynamic field renderer ─────────────────────────────────── */
const DynamicField = ({ field, value, onChange }) => {
  if (field.type === 'DROPDOWN') {
    return (
      <ModernField label={field.label} required={field.required}>
        <select
          className={selectCls}
          style={selectStyle}
          required={field.required}
          value={value}
          onChange={e => onChange(field.fieldName, e.target.value)}
        >
          <option value="">Select...</option>
          {(field.options || []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </ModernField>
    );
  }
  return (
    <ModernField label={field.label} required={field.required}>
      <input
        type={field.type === 'NUMBER' ? 'number' : 'text'}
        {...(field.type === 'NUMBER' ? { min: "0" } : {})}
        className={inputCls}
        style={inputStyle}
        required={field.required}
        value={value}
        onChange={e => onChange(field.fieldName, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    </ModernField>
  );
};

/* ══ Main Component ══════════════════════════════════════════ */
export default function UserForm() {
  const { id } = useParams();        // present on edit route
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  /* ── form state ─────────────────────────────────────────── */
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [gender, setGender]             = useState('MALE');
  const [selectedRoleId, setRoleId]     = useState('');
  const [supervisorUserId, setSupervisor] = useState('');
  const [profileData, setProfileData]   = useState({});

  /* ── lookup data ─────────────────────────────────────────── */
  const [roles, setRoles]               = useState([]);
  const [supervisors, setSupervisors]   = useState([]);
  const [dynamicFields, setDynamic]     = useState([]);

  /* ── ui state ────────────────────────────────────────────── */
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(isEdit);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);

  /* ── on mount: fetch roles + (if edit) user data ─────────── */
  useEffect(() => {
    const ctrl = new AbortController();

    const init = async () => {
      try {
        const rolesRes = await api.get('/roles', { signal: ctrl.signal });
        setRoles(rolesRes.data);

        if (isEdit) {
          const userRes = await api.get(`/users/${id}`, { signal: ctrl.signal });
          const u = userRes.data;
          setFirstName(u.firstName || '');
          setLastName(u.lastName || '');
          setEmail(u.email || '');
          setPhoneNumber(u.phoneNumber || '');
          setGender(u.gender || 'MALE');
          setRoleId(u.roleId ? String(u.roleId) : '');
          setSupervisor(u.supervisorUserId ? String(u.supervisorUserId) : '');
          setProfileData(u.profileData || {});
        }
      } catch (err) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load required data.');
      } finally {
        setFetching(false);
      }
    };

    init();
    return () => ctrl.abort();
  }, [id, isEdit]);

  /* ── when role changes: load extra fields + supervisors ───── */
  useEffect(() => {
    if (!selectedRoleId) {
      setDynamic([]);
      setSupervisors([]);
      return;
    }

    const ctrl = new AbortController();

    Promise.all([
      api.get(`/roles/${selectedRoleId}/extra-fields`, { signal: ctrl.signal }),
      api.get(`/users/supervisors?roleId=${selectedRoleId}`, { signal: ctrl.signal }),
    ])
      .then(([fieldsRes, supRes]) => {
        setDynamic(fieldsRes.data || []);
        setSupervisors(supRes.data || []);
      })
      .catch(err => {
        if (err.name === 'CanceledError') return;
        setDynamic([]);
        setSupervisors([]);
      });

    return () => ctrl.abort();
  }, [selectedRoleId]);

  /* ── submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      roleId: selectedRoleId ? parseInt(selectedRoleId, 10) : null,
      supervisorUserId: supervisorUserId ? parseInt(supervisorUserId, 10) : null,
      profileData,
      ...(isEdit ? {} : { password }),
    };

    try {
      if (isEdit) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setSuccess(isEdit ? 'User updated successfully.' : 'User created successfully.');
      setTimeout(() => navigate('/users'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicChange = (key, val) =>
    setProfileData(prev => ({ ...prev, [key]: val }));

  /* ── loading skeleton ────────────────────────────────────── */
  if (fetching) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    );
  }

  /* ── form render ─────────────────────────────────────────── */
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* ── Floating Toast Alerts ── */}
      {(success || error) && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${success ? 'success' : 'danger'} shadow border-0 small d-flex align-items-center gap-2`} style={{ zIndex: 9999, maxWidth: '400px', borderRadius: '10px' }} role="alert">
          {success ? '✓ ' : '⚠ '} {success || error}
        </div>
      )}

      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        
        {/* Header Block */}
        <div className="mb-4 text-primary d-flex align-items-center px-4 py-3" style={{ backgroundColor: '#eef2ff', borderRadius: '12px' }}>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <div>
            <h6 className="mb-0 fw-bold" style={{ letterSpacing: '1px' }}>{isEdit ? 'EDIT IDENTITY' : 'CREATE NEW IDENTITY'}</h6>
            <span style={{ fontSize: '11px', opacity: 0.8, letterSpacing: '1px' }}>INITIALIZING PERSONNEL ONBOARDING PROTOCOL</span>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
          <form onSubmit={handleSubmit}>
            <div className="row gx-5">
              
              <div className="col-md-6">
                <ModernField label="First Name" required>
                  <input type="text" className={inputCls} style={inputStyle}
                    value={firstName} onChange={e => setFirstName(e.target.value)} required
                    placeholder="Rahul" />
                </ModernField>
              </div>

              <div className="col-md-6">
                <ModernField label="Last Name" required>
                  <input type="text" className={inputCls} style={inputStyle}
                    value={lastName} onChange={e => setLastName(e.target.value)} required
                    placeholder="Sharma" />
                </ModernField>
              </div>

              <div className="col-md-6">
                <ModernField label="Email ID" required>
                  <input type="email" className={inputCls} style={inputStyle}
                    value={email} onChange={e => setEmail(e.target.value)} required
                    disabled={isEdit}
                    placeholder="rahul@example.com"
                  />
                  {isEdit && (
                    <div className="form-text text-muted" style={{ fontSize: '11px' }}>Email cannot be changed after creation.</div>
                  )}
                </ModernField>
              </div>

              <div className="col-md-6">
                <ModernField label="Phone Number">
                  <input type="tel" className={inputCls} style={inputStyle}
                    value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="9100000000" />
                </ModernField>
              </div>

              <div className="col-md-6">
                <ModernField label="Gender">
                  <select className={selectCls} style={selectStyle}
                    value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </ModernField>
              </div>

              {!isEdit && (
                <div className="col-md-6">
                  <ModernField label="Password" required>
                    <input type="password" className={inputCls} style={inputStyle}
                      value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••" />
                  </ModernField>
                </div>
              )}

              <div className="col-md-6">
                <ModernField label="Access Role" required>
                  <select className={selectCls} style={selectStyle}
                    value={selectedRoleId} onChange={e => setRoleId(e.target.value)} required>
                    <option value="">Select a role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </ModernField>
              </div>

              {supervisors.length > 0 && (
                <div className="col-md-6">
                  <ModernField label="Hierarchy Mapping (Superior ID)">
                    <select className={selectCls} style={selectStyle}
                      value={supervisorUserId} onChange={e => setSupervisor(e.target.value)}>
                      <option value="">Select Reporting Lead</option>
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </ModernField>
                </div>
              )}

              {/* Dynamic Role Fields */}
              {dynamicFields.length > 0 && dynamicFields.map(field => (
                <div className="col-md-6" key={field.fieldName}>
                  <DynamicField
                    field={field}
                    value={profileData[field.fieldName] || ''}
                    onChange={handleDynamicChange}
                  />
                </div>
              ))}

            </div>

            <div className="mt-5 d-flex gap-3">
              <button 
                type="button" 
                className="btn border fw-bold w-25" 
                style={{ borderRadius: '12px', height: '54px', color: '#6b7280' }}
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="btn btn-primary text-white fw-bold w-75 shadow-sm" 
                style={{ borderRadius: '12px', height: '54px', backgroundColor: '#6f61ff', borderColor: '#6f61ff', letterSpacing: '1px' }}
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : (isEdit ? 'SAVE CHANGES' : 'CREATE USER')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
