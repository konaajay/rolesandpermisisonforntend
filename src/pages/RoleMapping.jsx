import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RoleMapping() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedRoleId = searchParams.get('roleId');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Map Permissions State
  const [mappingRoleId, setMappingRoleId] = useState('');
  const [mappingPermissionIds, setMappingPermissionIds] = useState([]);

  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Auto-select role when coming from Roles list with ?roleId=
  useEffect(() => {
    if (preselectedRoleId && roles.length > 0 && permissions.length > 0) {
      handleMappingRoleChange(preselectedRoleId);
    }
  }, [preselectedRoleId, roles, permissions]);

  const handleMappingRoleChange = (roleIdVal) => {
    setMappingRoleId(roleIdVal);
    if (!roleIdVal) {
      setMappingPermissionIds([]);
      return;
    }
    const selectedRole = roles.find((r) => r.id === parseInt(roleIdVal, 10));
    if (selectedRole && selectedRole.permissions) {
      const rolePermNames = Array.from(selectedRole.permissions);
      const matchedIds = permissions
        .filter((p) => rolePermNames.includes(p.permissionKey))
        .map((p) => p.id);
      setMappingPermissionIds(matchedIds);
    } else {
      setMappingPermissionIds([]);
    }
  };

  const handleMapPermissionsSubmit = async (e) => {
    e.preventDefault();
    if (!mappingRoleId) {
      showToast('error', 'Please select a role to map permissions.');
      return;
    }

    const payload = {
      permissionIds: mappingPermissionIds,
    };

    try {
      await api.post(`/roles/${mappingRoleId}/permissions`, payload);
      showToast('success', 'Permissions mapped to role successfully!');
      fetchRoles(); // Refresh roles list to show updated permissions
    } catch (err) {
      showToast('error', err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleMappingPermissionToggle = (permId) => {
    setMappingPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const renderPermissionCheckboxes = (selectedIds, toggleFn, setIdsFn) => {
    const grouped = permissions.reduce((acc, perm) => {
      const mod = perm.module || 'Other';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(perm);
      return acc;
    }, {});

    if (permissions.length === 0) {
      return <div className="text-muted small">No permissions available. Please create permissions first.</div>;
    }

    return Object.keys(grouped).map((mod) => {
      const modPermIds = grouped[mod].map(p => p.id);
      const allSelected = modPermIds.length > 0 && modPermIds.every(id => selectedIds.includes(id));
      
      const toggleSelectAll = () => {
        if (allSelected) {
          setIdsFn(prev => prev.filter(id => !modPermIds.includes(id)));
        } else {
          setIdsFn(prev => {
            const newIds = new Set([...prev, ...modPermIds]);
            return Array.from(newIds);
          });
        }
      };

      return (
      <div key={mod} className="mb-3 border-bottom pb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-primary mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {mod}
          </h6>
          <button 
            type="button" 
            className="btn btn-sm btn-link text-decoration-none p-0" 
            style={{ fontSize: '0.75rem' }} 
            onClick={toggleSelectAll}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {grouped[mod].map((perm) => {
            const isChecked = selectedIds.includes(perm.id);
            return (
              <div
                key={perm.id}
                className="form-check form-check-inline bg-light px-3 py-2 rounded border d-flex align-items-center"
                style={{ minWidth: '220px', cursor: 'pointer' }}
              >
                <input
                  className="form-check-input me-2 mt-0"
                  type="checkbox"
                  id={`perm-${perm.id}`}
                  checked={isChecked}
                  onChange={() => toggleFn(perm.id)}
                  disabled={!perm.active}
                />
                <label className="form-check-label small text-truncate" htmlFor={`perm-${perm.id}`} title={`${perm.permissionKey}: ${perm.description}`}>
                  <strong>{perm.permissionKey}</strong>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      );
    });
  };

  const selectedRole = roles.find(r => String(r.id) === String(mappingRoleId));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1 small"
              onClick={() => navigate('/roles')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
              Back
            </button>
            <span className="text-muted small">/</span>
            <span className="text-muted small">Roles</span>
          </div>
          <h5 className="fw-bold text-dark mb-0">
            Map Permissions
            {selectedRole && <span className="text-primary ms-2">→ {selectedRole.name}</span>}
          </h5>
        </div>
      </div>

      {/* Floating Toast Alerts */}
      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleMapPermissionsSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Role Selector */}
          <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
            <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom" style={{ fontSize: '13px' }}>Select Role</h6>
            <select
              className="form-select form-select-sm border"
              style={{ height: '36px', fontSize: '13px', maxWidth: 400 }}
              value={mappingRoleId}
              onChange={e => handleMappingRoleChange(e.target.value)}
              required
            >
              <option value="">— Choose a Role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id} disabled={!r.active}>
                  {r.name}{!r.active ? ' (Disabled)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Permission Grid */}
          {mappingRoleId && (
            <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
              <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px' }}>
                Permissions
                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal" style={{ fontSize: 11 }}>
                  {mappingPermissionIds.length} selected
                </span>
              </h6>
              {renderPermissionCheckboxes(mappingPermissionIds, handleMappingPermissionToggle, setMappingPermissionIds)}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-white border-top mt-4 d-flex justify-content-end gap-2"
          style={{ padding: '16px 0', position: 'sticky', bottom: 0 }}>
          <button type="button" className="btn btn-light border fw-medium"
            style={{ height: '36px', minWidth: '90px' }}
            onClick={() => navigate('/roles')}>Cancel</button>
          <button type="submit" className="btn btn-primary fw-medium"
            style={{ height: '36px', minWidth: '160px' }}
            disabled={!mappingRoleId}>
            Save Permissions
          </button>
        </div>
      </form>
    </div>
  );
}
