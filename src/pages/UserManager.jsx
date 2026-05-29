import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';
import EntityPage from '../components/EntityPage';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [profileData, setProfileData] = useState({});
  const [dynamicFields, setDynamicFields] = useState([]);
  const [supervisorUserId, setSupervisorUserId] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const { hasPermission } = usePermissions();

  const fetchUsers = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users', { signal });
      setUsers(response.data);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async (signal) => {
    try {
      const response = await api.get('/roles', { signal });
      setRoles(response.data);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    fetchRoles(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setDynamicFields([]);
      setSupervisors([]);
      return;
    }

    const controller = new AbortController();

    const fetchExtraFields = async () => {
      try {
        const response = await api.get(`/roles/${selectedRoleId}/extra-fields`, { signal: controller.signal });
        setDynamicFields(response.data);
      } catch (err) {
        if (err.name === 'CanceledError') return;
        console.error('Error fetching role extra fields:', err);
        setDynamicFields([]);
      }
    };

    const fetchSupervisors = async () => {
      try {
        const response = await api.get(`/users/supervisors?roleId=${selectedRoleId}`, { signal: controller.signal });
        setSupervisors(response.data || []);
      } catch (err) {
        if (err.name === 'CanceledError') return;
        console.error('Error fetching supervisors:', err);
        setSupervisors([]);
      }
    };

    fetchExtraFields();
    fetchSupervisors();

    return () => {
      controller.abort();
    };
  }, [selectedRoleId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const payload = {
      firstName,
      lastName,
      email,
      password: editingId ? undefined : password,
      phoneNumber,
      gender,
      roleId: selectedRoleId ? parseInt(selectedRoleId, 10) : null,
      supervisorUserId: supervisorUserId ? parseInt(supervisorUserId, 10) : null,
      profileData,
    };

    try {
      if (editingId) {
        // Update user
        await api.put(`/users/${editingId}`, payload);
        setMessage('User updated successfully!');
      } else {
        // Create user
        await api.post('/users', payload);
        setMessage('User onboarded successfully!');
      }

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setSelectedRoleId('');
      setSupervisorUserId('');
      setGender('MALE');
      setProfileData({});
      setDynamicFields([]);
      setSupervisors([]);
      setEditingId(null);
      setIsDrawerOpen(false);

      // Refresh list
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword('');
    setPhoneNumber(user.phoneNumber || '');
    setSelectedRoleId(user.roleId || '');
    setSupervisorUserId(user.supervisorUserId || '');
    setGender(user.gender || 'MALE');
    setProfileData(user.profileData || {});
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {

    setMessage(null);
    setError(null);

    try {
      await api.delete(`/users/${id}`);
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = prompt(`Enter new password for ${name} (min 8 chars):`);
    if (!newPassword) return;

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      await api.post(`/users/${id}/reset-password`, { newPassword });
      alert(`Password successfully reset for ${name}`);
    } catch (err) {
      alert("Error resetting password: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setSelectedRoleId('');
    setSupervisorUserId('');
    setGender('MALE');
    setProfileData({});
    setDynamicFields([]);
    setSupervisors([]);
  };

  return (
    <EntityPage
      title="Users"
      addButtonLabel={hasPermission('USER_CREATE') ? "Add User" : null}
      onAddClick={() => { handleCancelEdit(); setIsDrawerOpen(true); }}
      isDrawerOpen={isDrawerOpen}
      closeDrawer={() => setIsDrawerOpen(false)}
      drawerTitle={editingId ? 'Edit User' : 'Onboard User'}
      table={
        <div className="table-responsive m-0 p-0">
          <table className="table table-hover table-sm align-middle mb-0">
            <thead className="table-light text-secondary small">
              <tr>
                <th className="ps-3 border-0">ID</th>
                <th className="border-0">Name</th>
                <th className="border-0">Email</th>
                <th className="border-0">Role</th>
                <th className="border-0">Reports To</th>
                <th className="pe-3 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span className="text-muted small">Loading users...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center text-danger py-4 small">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Failed to load users: {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5 small">
                    <i className="bi bi-person-x fs-2 d-block mb-2 text-light"></i>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-3"><code className="text-muted bg-light px-2 py-1 rounded">{user.leadId || user.employeeId || user.id}</code></td>
                    <td className="fw-medium text-dark">{user.firstName} {user.lastName}</td>
                    <td className="text-muted small">{user.email}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary border">{user.roleName || '-'}</span></td>
                    <td>
                      {user.supervisorName
                        ? <span className="badge bg-info bg-opacity-10 text-info border border-info">{user.supervisorName}</span>
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td className="pe-3 text-end">
                      {hasPermission('USER_UPDATE') && (
                        <button
                          className="btn btn-link btn-sm text-primary p-0 me-3 text-decoration-none"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('USER_UPDATE') && (
                        <button
                          className="btn btn-link btn-sm text-secondary p-0 me-3 text-decoration-none"
                          onClick={() => handleResetPassword(user.id, user.firstName)}
                        >
                          Reset Pwd
                        </button>
                      )}
                      {hasPermission('USER_DELETE') && (
                        <button
                          className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      }
      form={
        <form onSubmit={handleSave} className="p-4">
          {message && <div className="alert alert-success py-2 small border-0 bg-success bg-opacity-10 text-success">{message}</div>}
          {error && <div className="alert alert-danger py-2 small border-0 bg-danger bg-opacity-10 text-danger">{error}</div>}

          <h6 className="fw-bold mb-3">Personal Details</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-medium text-secondary mb-1">First Name</label>
              <input type="text" className="form-control form-control-sm" style={{height:'36px'}} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium text-secondary mb-1">Last Name</label>
              <input type="text" className="form-control form-control-sm" style={{height:'36px'}} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="col-md-12">
              <label className="form-label small fw-medium text-secondary mb-1">Email</label>
              <input type="email" className="form-control form-control-sm" style={{height:'36px'}} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!editingId} />
            </div>
            {!editingId && (
              <div className="col-md-12">
                <label className="form-label small fw-medium text-secondary mb-1">Password</label>
                <input type="password" className="form-control form-control-sm" style={{height:'36px'}} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label small fw-medium text-secondary mb-1">Phone Number</label>
              <input type="text" className="form-control form-control-sm" style={{height:'36px'}} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium text-secondary mb-1">Gender</label>
              <select className="form-select form-select-sm" style={{height:'36px'}} value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <h6 className="fw-bold mb-3 border-top pt-3">Role & Access</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-12">
              <label className="form-label small fw-medium text-secondary mb-1">Role</label>
              <select className="form-select form-select-sm" style={{height:'36px'}} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required>
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {supervisors.length > 0 && (
              <div className="col-md-12">
                <label className="form-label small fw-medium text-secondary mb-1">Reports To</label>
                <select className="form-select form-select-sm" style={{height:'36px'}} value={supervisorUserId} onChange={(e) => setSupervisorUserId(e.target.value)}>
                  <option value="">-- No Supervisor --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {dynamicFields.length > 0 && (
            <>
              <h6 className="fw-bold mb-3 border-top pt-3">Additional Details</h6>
              <div className="row g-3 mb-4">
                {dynamicFields.map(field => {
                  const value = profileData[field.fieldName] || '';
                  const handleChange = (val) => setProfileData(prev => ({ ...prev, [field.fieldName]: val }));

                  return (
                    <div className="col-md-12" key={field.id || field.fieldName}>
                      <label className="form-label small fw-medium text-secondary mb-1">
                        {field.label} {field.required && <span className="text-danger">*</span>}
                      </label>
                      {field.type === 'DROPDOWN' ? (
                        <select className="form-select form-select-sm" style={{height:'36px'}} required={field.required} value={value} onChange={(e) => handleChange(e.target.value)}>
                          <option value="">Select...</option>
                          {field.options && field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input type={field.type === 'NUMBER' ? 'number' : 'text'} className="form-control form-control-sm" style={{height:'36px'}} required={field.required} value={value} onChange={(e) => handleChange(e.target.value)} placeholder={field.label} />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 border-top pt-3 text-end">
            <button type="button" className="btn btn-light fw-medium me-2" style={{height:'36px'}} onClick={() => setIsDrawerOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary fw-medium px-4" style={{height:'36px'}} disabled={loading}>
              {editingId ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      }
    />
  );
}
