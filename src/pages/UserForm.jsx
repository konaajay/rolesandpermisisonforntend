import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';

/* ── reusable form field ────────────────────────────────────── */
const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="form-label small fw-semibold text-secondary mb-1" style={{ letterSpacing: '0.1px' }}>
      {label}{required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
    {hint && <div className="form-text text-muted" style={{ fontSize: '11px' }}>{hint}</div>}
  </div>
);

const inputCls = "form-control form-control-sm border";
const inputStyle = { height: '36px', fontSize: '13px' };
const selectStyle = { height: '36px', fontSize: '13px' };

/* ── section card ────────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
    <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px', letterSpacing: '0.2px' }}>
      {title}
    </h6>
    <div className="row g-3">
      {children}
    </div>
  </div>
);

/* ── dynamic field renderer ─────────────────────────────────── */
const DynamicField = ({ field, value, onChange }) => {
  if (field.type === 'DROPDOWN') {
    return (
      <Field label={field.label} required={field.required}>
        <select
          className="form-select form-select-sm border"
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
      </Field>
    );
  }
  return (
    <Field label={field.label} required={field.required}>
      <input
        type={field.type === 'NUMBER' ? 'number' : 'text'}
        className={inputCls}
        style={inputStyle}
        required={field.required}
        value={value}
        onChange={e => onChange(field.fieldName, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    </Field>
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
      <EntityFormPage
        title={isEdit ? 'Edit User' : 'Create User'}
        subtitle="Users"
        backRoute="/users"
        onSubmit={() => {}}
        submitLabel={isEdit ? 'Save Changes' : 'Create User'}
      >
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            <span className="text-muted small">Loading user data...</span>
          </div>
        </div>
      </EntityFormPage>
    );
  }

  /* ── form render ─────────────────────────────────────────── */
  return (
    <EntityFormPage
      title={isEdit ? 'Edit User' : 'Create User'}
      subtitle="Users"
      backRoute="/users"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create User'}
      loading={loading}
      error={error}
      success={success}
    >
      {/* Personal Details */}
      <Section title="Personal Details">
        <div className="col-md-6">
          <Field label="First Name" required>
            <input type="text" className={inputCls} style={inputStyle}
              value={firstName} onChange={e => setFirstName(e.target.value)} required
              placeholder="Enter first name" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Last Name" required>
            <input type="text" className={inputCls} style={inputStyle}
              value={lastName} onChange={e => setLastName(e.target.value)} required
              placeholder="Enter last name" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Email Address" required>
            <input type="email" className={inputCls} style={inputStyle}
              value={email} onChange={e => setEmail(e.target.value)} required
              disabled={isEdit}
              placeholder="user@company.com"
              hint={isEdit ? 'Email cannot be changed after creation.' : undefined}
            />
            {isEdit && (
              <div className="form-text text-muted" style={{ fontSize: '11px' }}>Email cannot be changed after creation.</div>
            )}
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Phone Number">
            <input type="tel" className={inputCls} style={inputStyle}
              value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Gender">
            <select className="form-select form-select-sm border" style={selectStyle}
              value={gender} onChange={e => setGender(e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>
        </div>
        {!isEdit && (
          <div className="col-md-6">
            <Field label="Initial Password" required>
              <input type="password" className={inputCls} style={inputStyle}
                value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Minimum 8 characters" />
            </Field>
          </div>
        )}
      </Section>

      {/* Role & Access */}
      <Section title="Role &amp; Access">
        <div className="col-md-6">
          <Field label="Role" required>
            <select className="form-select form-select-sm border" style={selectStyle}
              value={selectedRoleId} onChange={e => setRoleId(e.target.value)} required>
              <option value="">Select a role...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
        </div>
        {supervisors.length > 0 && (
          <div className="col-md-6">
            <Field label="Reports To">
              <select className="form-select form-select-sm border" style={selectStyle}
                value={supervisorUserId} onChange={e => setSupervisor(e.target.value)}>
                <option value="">No supervisor</option>
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </Section>

      {/* Dynamic Role Fields */}
      {dynamicFields.length > 0 && (
        <Section title="Additional Details">
          {dynamicFields.map(field => (
            <div className="col-md-6" key={field.fieldName}>
              <DynamicField
                field={field}
                value={profileData[field.fieldName] || ''}
                onChange={handleDynamicChange}
              />
            </div>
          ))}
        </Section>
      )}

    </EntityFormPage>
  );
}
