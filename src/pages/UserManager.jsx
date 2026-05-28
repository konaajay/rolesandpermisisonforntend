import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';

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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
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
    <div className="container mt-4">
      <div className="row">
        {/* Form Column - Hides completely if user doesn't have USER_CREATE and is not editing (USER_UPDATE) */}
        {(hasPermission('USER_CREATE') || (editingId && hasPermission('USER_UPDATE'))) && (
          <div className="col-md-4 mb-4">
            <div className="card p-4 shadow-sm h-100">
              <h4 className="card-title text-center mb-4">
                {editingId ? 'Edit User' : 'Onboard User'}
              </h4>

              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSave}>
                <div className="mb-2">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!editingId}
                  />
                </div>

                {!editingId && (
                  <div className="mb-2">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-2">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select form-select-sm"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {supervisors.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">Supervisor / Reporting Lead</label>
                    <select
                      className="form-select form-select-sm"
                      value={supervisorUserId}
                      onChange={(e) => setSupervisorUserId(e.target.value)}
                    >
                      <option value="">-- No Supervisor --</option>
                      {supervisors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                {dynamicFields.length > 0 && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <h6 className="border-bottom pb-2 mb-3">Additional Details</h6>
                    {dynamicFields.map(field => {
                      const value = profileData[field.fieldName] || '';
                      const handleChange = (val) => {
                        setProfileData(prev => ({
                          ...prev,
                          [field.fieldName]: val
                        }));
                      };

                      if (field.type === 'DROPDOWN') {
                        return (
                          <div className="mb-2" key={field.id || field.fieldName}>
                            <label className="form-label mb-1">
                              {field.label} {field.required && <span className="text-danger">*</span>}
                            </label>
                            <select
                              className="form-select form-select-sm"
                              required={field.required}
                              value={value}
                              onChange={(e) => handleChange(e.target.value)}
                            >
                              <option value="">Select...</option>
                              {field.options && field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      return (
                        <div className="mb-2" key={field.id || field.fieldName}>
                          <label className="form-label mb-1">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                          </label>
                          <input
                            type={field.type === 'NUMBER' ? 'number' : 'text'}
                            className="form-control form-control-sm"
                            required={field.required}
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={field.label}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingId ? 'Save Changes' : 'Onboard'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List Column */}
        <div className={hasPermission('USER_CREATE') || hasPermission('USER_UPDATE') ? "col-md-8" : "col-md-12"}>
          <div className="card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Users</h4>
              <button className="btn btn-outline-primary btn-sm" onClick={() => fetchUsers()}>
                Refresh List
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Reports To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <span className="text-muted">Loading users...</span>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="text-center text-danger py-4">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Failed to load users: {error}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td><code>{user.leadId || user.employeeId || user.id}</code></td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td><span className="badge bg-secondary">{user.roleName || '-'}</span></td>
                        <td>
                          {user.supervisorName
                            ? <span className="badge bg-info text-dark">{user.supervisorName}</span>
                            : <span className="text-muted small">—</span>}
                        </td>
                        <td>
                          {hasPermission('USER_UPDATE') && (
                            <button
                              className="btn btn-warning btn-sm me-1"
                              style={{ fontSize: '0.75rem', padding: '0.1rem 0.3rem' }}
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission('USER_DELETE') && (
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.1rem 0.3rem' }}
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </button>
                          )}
                          {hasPermission('USER_UPDATE') && (
                            <button
                              className="btn btn-info btn-sm ms-1 text-white"
                              style={{ fontSize: '0.75rem', padding: '0.1rem 0.3rem' }}
                              onClick={() => handleResetPassword(user.id, user.firstName)}
                            >
                              Reset Pwd
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
