import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function RoleMapping() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Map Permissions State
  const [mappingRoleId, setMappingRoleId] = useState('');
  const [mappingPermissionIds, setMappingPermissionIds] = useState([]);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
      setError('Please select a role to map permissions.');
      return;
    }
    setMessage(null);
    setError(null);

    const payload = {
      permissionIds: mappingPermissionIds,
    };

    try {
      await api.post(`/roles/${mappingRoleId}/permissions`, payload);
      setMessage('Permissions mapped to role successfully!');
      fetchRoles(); // Refresh roles list to show updated permissions
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
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

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow-sm">
            <h4 className="card-title text-center mb-4">Role Permission Mapping</h4>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleMapPermissionsSubmit}>
              <div className="mb-4">
                <label className="form-label font-weight-bold">Select Role</label>
                <select
                  className="form-select"
                  value={mappingRoleId}
                  onChange={(e) => handleMappingRoleChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} disabled={!r.active}>
                      {r.name} {!r.active && '(Disabled)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label d-block fw-semibold">Modify Mapped Permissions</label>
                <div className="border rounded p-3 bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {renderPermissionCheckboxes(mappingPermissionIds, handleMappingPermissionToggle, setMappingPermissionIds)}
                </div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-success btn-lg" disabled={!mappingRoleId}>
                  Save Permission Mappings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
