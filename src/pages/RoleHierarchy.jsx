import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';

export default function RoleHierarchy() {
  const [roles, setRoles] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [childRoleId, setChildRoleId] = useState('');
  const [parentRoleId, setParentRoleId] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ROLE_UPDATE');

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles', { signal: controller.signal });
        setRoles(res.data.filter(r => r.active));
      } catch (err) {
        if (err.name === 'CanceledError') return;
        console.error('Error fetching roles:', err);
      }
    };

    const fetchHierarchy = async () => {
      try {
        const res = await api.get('/roles/hierarchy', { signal: controller.signal });
        setHierarchy(res.data);
      } catch (err) {
        if (err.name === 'CanceledError') return;
        console.error('Error fetching hierarchy:', err);
      }
    };

    fetchRoles();
    fetchHierarchy();

    return () => {
      controller.abort();
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!childRoleId || !parentRoleId) {
      setError('Please select both roles.');
      return;
    }
    if (childRoleId === parentRoleId) {
      setError('A role cannot report to itself.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/roles/hierarchy?roleId=${childRoleId}&reportsToRoleId=${parentRoleId}`);
      setMessage('Hierarchy link added successfully!');
      setChildRoleId('');
      setParentRoleId('');
      fetchHierarchy();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId, reportsToRoleId, childName, parentName) => {
    if (!window.confirm(`Remove link: ${childName} → ${parentName}?`)) return;
    setMessage(null);
    setError(null);
    try {
      await api.delete(`/roles/hierarchy?roleId=${roleId}&reportsToRoleId=${reportsToRoleId}`);
      setMessage('Hierarchy link removed.');
      fetchHierarchy();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  // Build a tree structure for visual display
  const buildTree = () => {
    // Find all roles that are NOT a child in any link (top-level)
    const childIds = new Set(hierarchy.map(h => h.roleId));
    const topLevelRoles = roles.filter(r => !childIds.has(r.id));

    const getChildren = (roleId) => hierarchy.filter(h => h.reportsToRoleId === roleId);

    const renderNode = (role, depth = 0) => {
      const children = getChildren(role.id);
      return (
        <div key={role.id} style={{ marginLeft: depth * 24 }}>
          <div className={`d-flex align-items-center gap-2 py-1 px-2 rounded mb-1 ${depth === 0 ? 'bg-primary text-white' : depth === 1 ? 'bg-info text-dark' : 'bg-light border'}`}
            style={{ width: 'fit-content', minWidth: 200 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: depth === 0 ? 'bold' : 'normal' }}>
              {depth > 0 && <span className="me-1 text-muted">↳</span>}
              <span className="badge bg-secondary me-1" style={{ fontSize: '0.7rem' }}>{role.code}</span>
              {role.name}
            </span>
          </div>
          {children.map(link => {
            const childRole = roles.find(r => r.id === link.roleId);
            if (!childRole) return null;
            return renderNode(childRole, depth + 1);
          })}
        </div>
      );
    };

    return topLevelRoles.map(r => renderNode(r, 0));
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-1">Role Hierarchy</h4>
      <p className="text-muted small mb-4">
        Define which role reports to which. This controls which users appear as eligible supervisors when onboarding staff.
      </p>

      {message && <div className="alert alert-success alert-dismissible py-2">{message}</div>}
      {error && <div className="alert alert-danger alert-dismissible py-2">{error}</div>}

      <div className="row g-4">
        {/* Left: Add new link */}
        {canManage && (
          <div className="col-md-4">
            <div className="card p-4 shadow-sm h-100">
              <h6 className="fw-bold mb-3">Add Hierarchy Link</h6>
              <form onSubmit={handleAdd}>
                <div className="mb-3">
                  <label className="form-label">Child Role <span className="text-muted small">(reports to)</span></label>
                  <select
                    className="form-select form-select-sm"
                    value={childRoleId}
                    onChange={e => setChildRoleId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Reports To <span className="text-muted small">(supervisor role)</span></label>
                  <select
                    className="form-select form-select-sm"
                    value={parentRoleId}
                    onChange={e => setParentRoleId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Role --</option>
                    {roles.filter(r => r.id !== parseInt(childRoleId)).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
                  {loading ? 'Saving…' : '+ Add Link'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right: Hierarchy tree & flat list */}
        <div className={canManage ? 'col-md-8' : 'col-md-12'}>
          {/* Visual tree */}
          <div className="card p-4 shadow-sm mb-3">
            <h6 className="fw-bold mb-3">Reporting Chain (Visual)</h6>
            {roles.length === 0 ? (
              <span className="text-muted small">No roles found.</span>
            ) : (
              <div>{buildTree()}</div>
            )}
          </div>

          {/* Flat list of all links */}
          <div className="card p-3 shadow-sm">
            <h6 className="fw-bold mb-3">All Hierarchy Links</h6>
            {hierarchy.length === 0 ? (
              <p className="text-muted small mb-0">No hierarchy links configured yet.</p>
            ) : (
              <table className="table table-sm table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Role</th>
                    <th>Reports To</th>
                    {canManage && <th style={{ width: 80 }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {hierarchy.map(h => (
                    <tr key={h.id}>
                      <td>
                        <span className="badge bg-secondary me-1">{h.roleCode}</span>
                        {h.roleName}
                      </td>
                      <td>
                        <span className="badge bg-info text-dark me-1">{h.reportsToRoleCode}</span>
                        {h.reportsToRoleName}
                      </td>
                      {canManage && (
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}
                            onClick={() => handleDelete(h.roleId, h.reportsToRoleId, h.roleName, h.reportsToRoleName)}
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
