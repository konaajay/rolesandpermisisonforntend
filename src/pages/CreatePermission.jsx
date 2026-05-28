import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CreatePermission() {
  const [permissions, setPermissions] = useState([]);
  const [action, setAction] = useState('');
  const [module, setModule] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const payload = {
      action,
      module,
      description,
    };

    try {
      await api.post('/permissions', payload);
      setMessage('Permission Created Successfully!');
      setAction('');
      setModule('');
      setDescription('');
      fetchPermissions(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleToggleStatus = async (perm) => {
    setMessage(null);
    setError(null);
    try {
      if (perm.active) {
        await api.put(`/permissions/${perm.id}/disable`);
        setMessage(`Permission '${perm.permissionKey}' disabled successfully!`);
      } else {
        await api.put(`/permissions/${perm.id}/enable`);
        setMessage(`Permission '${perm.permissionKey}' enabled successfully!`);
      }
      fetchPermissions();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Form Column */}
        <div className="col-md-4 mb-4">
          <div className="card p-3 shadow-sm">
            <h4 className="card-title text-center mb-3">Create Permission</h4>

            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleCreatePermission}>
              <div className="mb-2">
                <label className="form-label">Module</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={module}
                  onChange={(e) => setModule(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. AFFILIATE"
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Action</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={action}
                  onChange={(e) => setAction(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. LINK"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control form-control-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Permission description"
                  rows="3"
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Permission
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Permissions List Column */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Permissions</h4>
              <button className="btn btn-outline-primary btn-sm" onClick={fetchPermissions}>
                Refresh List
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Permission Key</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No permissions found.
                      </td>
                    </tr>
                  ) : (
                    permissions.map((perm) => (
                      <tr key={perm.id}>
                        <td><code>{perm.id}</code></td>
                        <td><strong>{perm.permissionKey}</strong></td>
                        <td><code>{perm.module}</code></td>
                        <td><code>{perm.action}</code></td>
                        <td>{perm.description}</td>
                        <td>
                          <span className={`badge bg-${perm.active ? 'success' : 'danger'}`}>
                            {perm.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-${perm.active ? 'danger' : 'success'} btn-sm`}
                            style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                            onClick={() => handleToggleStatus(perm)}
                          >
                            {perm.active ? 'Disable' : 'Enable'}
                          </button>
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
