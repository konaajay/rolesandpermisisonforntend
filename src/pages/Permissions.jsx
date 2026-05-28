import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
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

  const handleToggleStatus = async (permission) => {
    setMessage(null);
    setError(null);
    try {
      if (permission.active) {
        await api.put(`/permissions/${permission.id}/disable`);
        setMessage(`Permission '${permission.permissionKey}' disabled successfully!`);
      } else {
        await api.put(`/permissions/${permission.id}/enable`);
        setMessage(`Permission '${permission.permissionKey}' enabled successfully!`);
      }
      fetchPermissions();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="container mt-4">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">System Permissions</h4>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchPermissions}>
            Refresh List
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Module</th>
                <th>Action</th>
                <th>Permission Key</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">No permissions found.</td>
                </tr>
              ) : (
                permissions.map(perm => (
                  <tr key={perm.id}>
                    <td><code>{perm.id}</code></td>
                    <td><span className="badge bg-secondary">{perm.module}</span></td>
                    <td><span className="badge bg-info text-dark">{perm.action}</span></td>
                    <td><strong>{perm.permissionKey}</strong></td>
                    <td>{perm.description}</td>
                    <td>
                      <span className={`badge bg-${perm.active ? 'success' : 'danger'}`}>
                        {perm.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-${perm.active ? 'danger' : 'success'} btn-sm`}
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
  );
}
