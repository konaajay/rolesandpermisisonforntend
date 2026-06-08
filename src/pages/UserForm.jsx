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

  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedEntityIds, setSelectedEntityIds] = useState([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);

  /* ── lookup data ─────────────────────────────────────────── */
  const [roles, setRoles]               = useState([]);
  const [supervisors, setSupervisors]   = useState([]);
  const [dynamicFields, setDynamic]     = useState([]);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  /* ── ui state ────────────────────────────────────────────── */
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(isEdit);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);

  /* ── on mount: fetch roles + modules/permissions + (if edit) user data ─────────── */
  useEffect(() => {
    const ctrl = new AbortController();

    const init = async () => {
      try {
        const rolesRes = await api.get('/roles', { signal: ctrl.signal });
        setRoles(rolesRes.data);

        const permsRes = await api.get('/permissions', { signal: ctrl.signal });
        setAvailablePermissions(permsRes.data || []);

        const [entRes, deptRes] = await Promise.all([
          api.get('/business-entities/active', { signal: ctrl.signal }).catch(() => ({ data: [] })),
          api.get('/departments/active', { signal: ctrl.signal }).catch(() => ({ data: [] }))
        ]);
        setAvailableEntities((entRes.data || []).filter(e => e.showInUserForm !== false));
        setAvailableDepartments((deptRes.data || []).filter(d => d.showInUserForm !== false));

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
          setSelectedPermissions(u.permissionIds || []);
          setSelectedEntityIds(u.entityIds || []);
          setSelectedDepartmentIds(u.departmentIds || []);
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



  const handlePermissionToggle = (permissionId) => {
      if (selectedPermissions.includes(permissionId)) {
          setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
      } else {
          setSelectedPermissions([...selectedPermissions, permissionId]);
      }
  };

  const renderPermissionCheckboxes = () => {
    let filteredPerms = availablePermissions;
    
    if (permissionSearch.trim()) {
        const query = permissionSearch.toLowerCase();
        filteredPerms = filteredPerms.filter(p => 
            (p.action && p.action.toLowerCase().includes(query)) || 
            (p.permissionKey && p.permissionKey.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.module && p.module.toLowerCase().includes(query))
        );
    }
    
    if (filteredPerms.length === 0) {
      return (
        <div className="text-center p-4 bg-white border rounded">
          <p className="text-muted small m-0 fw-medium">No permissions found matching your criteria.</p>
        </div>
      );
    }

    const grouped = filteredPerms.reduce((acc, perm) => {
      const mod = perm.module || 'Other';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(perm);
      return acc;
    }, {});

    return Object.keys(grouped).map((mod) => {
      const modPermIds = grouped[mod].map(p => p.id);
      const allSelected = modPermIds.length > 0 && modPermIds.every(id => selectedPermissions.includes(id));
      
      const toggleSelectAll = () => {
        if (allSelected) {
          setSelectedPermissions(prev => prev.filter(id => !modPermIds.includes(id)));
        } else {
          setSelectedPermissions(prev => {
            const newIds = new Set([...prev, ...modPermIds]);
            return Array.from(newIds);
          });
        }
      };

      return (
        <div key={mod} className="mb-4 bg-white p-3 rounded shadow-sm border border-light">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h6 className="text-primary mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {mod}
            </h6>
            <button 
              type="button" 
              className="btn btn-sm btn-link text-decoration-none p-0 fw-medium" 
              style={{ fontSize: '0.75rem' }} 
              onClick={toggleSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {grouped[mod].map((perm) => {
              const isChecked = selectedPermissions.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  className="form-check form-check-inline bg-light px-3 py-2 rounded border d-flex align-items-center m-0 flex-grow-1"
                  style={{ minWidth: '220px', cursor: 'pointer' }}
                >
                  <input
                    className="form-check-input me-2 mt-0"
                    type="checkbox"
                    id={`perm-${perm.id}`}
                    checked={isChecked}
                    onChange={() => handlePermissionToggle(perm.id)}
                    disabled={!perm.active}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label small text-truncate" htmlFor={`perm-${perm.id}`} title={`${perm.action}: ${perm.description}`} style={{ cursor: 'pointer' }}>
                    <strong>{perm.action || perm.permissionKey}</strong>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

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
      permissionIds: selectedPermissions,
      entityIds: selectedEntityIds,
      departmentIds: selectedDepartmentIds,
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

            {availableEntities.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-3" style={{ letterSpacing: '1px', fontSize: '11px', textTransform: 'uppercase' }}>ASSIGN BUSINESS ENTITIES</h6>
                <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded border">
                  {availableEntities.map(en => {
                    const isChecked = selectedEntityIds.includes(en.id);
                    return (
                      <div key={en.id} className="form-check form-check-inline bg-white px-3 py-2 rounded border m-0" style={{ cursor: 'pointer' }}>
                        <input
                          className="form-check-input mt-0 me-2"
                          type="checkbox"
                          id={`ent-${en.id}`}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedEntityIds([...selectedEntityIds, en.id]);
                            else setSelectedEntityIds(selectedEntityIds.filter(id => id !== en.id));
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label small fw-medium" htmlFor={`ent-${en.id}`} style={{ cursor: 'pointer' }}>
                          {en.entityCode} - {en.companyName}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {availableDepartments.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-3" style={{ letterSpacing: '1px', fontSize: '11px', textTransform: 'uppercase' }}>ASSIGN DEPARTMENTS</h6>
                <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded border">
                  {availableDepartments.map(dp => {
                    const isChecked = selectedDepartmentIds.includes(dp.id);
                    return (
                      <div key={dp.id} className="form-check form-check-inline bg-white px-3 py-2 rounded border m-0" style={{ cursor: 'pointer' }}>
                        <input
                          className="form-check-input mt-0 me-2"
                          type="checkbox"
                          id={`dept-${dp.id}`}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDepartmentIds([...selectedDepartmentIds, dp.id]);
                            else setSelectedDepartmentIds(selectedDepartmentIds.filter(id => id !== dp.id));
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label small fw-medium" htmlFor={`dept-${dp.id}`} style={{ cursor: 'pointer' }}>
                          {dp.deptCode} - {dp.deptName}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-secondary mb-0" style={{ letterSpacing: '1px' }}>USER-LEVEL PERMISSIONS</h6>
              
              <div className="d-flex align-items-center gap-3">
                <input 
                    type="text" 
                    className="form-control form-control-sm border-0 shadow-sm" 
                    placeholder="Search permissions..." 
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    style={{ width: '250px', borderRadius: '8px' }}
                />
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary fw-medium"
                  style={{ borderRadius: '8px' }}
                  onClick={() => {
                    const availableIds = availablePermissions.map(p => p.id);
                    if (selectedPermissions.length === availableIds.length) {
                        setSelectedPermissions([]);
                    } else {
                        setSelectedPermissions(availableIds);
                    }
                  }}
                >
                  {selectedPermissions.length > 0 && selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            <div className="p-3 mb-4 bg-light shadow-inner rounded" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e9ecef' }}>
                {renderPermissionCheckboxes()}
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
