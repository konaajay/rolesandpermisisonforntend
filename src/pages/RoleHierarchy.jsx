import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';

export default function RoleHierarchy() {
  const [roles, setRoles] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [childRoleId, setChildRoleId] = useState('');
  const [parentRoleId, setParentRoleId] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ROLE_UPDATE');

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHierarchy = async (signal) => {
    try {
      const res = await api.get('/roles/hierarchy', { signal });
      setHierarchy(res.data);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      console.error('Error fetching hierarchy:', err);
    }
  };

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

    fetchRoles();
    fetchHierarchy(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!childRoleId || !parentRoleId) {
      showToast('error', 'Please select both roles.');
      return;
    }
    if (childRoleId === parentRoleId) {
      showToast('error', 'A role cannot report to itself.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/roles/hierarchy?roleId=${childRoleId}&reportsToRoleId=${parentRoleId}`);
      showToast('success', 'Hierarchy link added successfully!');
      setChildRoleId('');
      setParentRoleId('');
      fetchHierarchy();
    } catch (err) {
      showToast('error', err.response?.data?.message || err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId, reportsToRoleId, childName, parentName) => {
    try {
      await api.delete(`/roles/hierarchy?roleId=${roleId}&reportsToRoleId=${reportsToRoleId}`);
      showToast('success', 'Hierarchy link removed.');
      fetchHierarchy();
    } catch (err) {
      showToast('error', err.response?.data?.message || err.response?.data || err.message);
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
      {/* ── Floating Toast Alerts ── */}
      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 d-flex align-items-center gap-2`}
          style={{ zIndex: 9999, fontSize: '13px', maxWidth: '380px', animation: 'fadeIn .2s ease' }}
          role="alert"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            {toast.type === 'success'
              ? <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              : <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            }
          </svg>
          {toast.msg}
        </div>
      )}

      <h4 className="mb-1">Role Hierarchy</h4>
      <p className="text-muted small mb-4">
        Define which role reports to which. This controls which users appear as eligible supervisors when onboarding staff.
      </p>

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
                <thead className="table-light text-secondary">
                  <tr>
                    <th className="fw-semibold border-0">Role</th>
                    <th className="fw-semibold border-0">Reports To</th>
                    {canManage && <th className="fw-semibold border-0" style={{ width: 80 }}>Action</th>}
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
