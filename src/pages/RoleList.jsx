import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';
import EntityListPage from '../components/EntityListPage';

export default function RoleList() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchRoles = async (signal) => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/roles', { signal });
      setRoles(res.data);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRoles(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleToggle = async (role) => {
    try {
      if (role.active) await api.put(`/roles/${role.id}/disable`);
      else await api.put(`/roles/${role.id}/enable`);
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, active: !r.active } : r));
      showToast('success', `Role "${role.name}" ${role.active ? 'disabled' : 'enabled'}.`);
    } catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? roles.filter(r => [r.name, r.description].filter(Boolean).some(v => v.toLowerCase().includes(q))) : roles;
  }, [roles, search]);

  return (
    <>
      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
      <EntityListPage title="Roles" description="Manage roles and their permissions"
        addLabel={hasPermission('ROLE_CREATE') ? '+ Add Role' : undefined}
        addRoute="/roles/create"
        searchValue={search} onSearchChange={setSearch}
        loading={loading} error={error} totalCount={!loading ? filtered.length : undefined}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Role Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Description</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 110 }}>Permissions</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 90 }}>Status</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted small">
                  {search ? `No roles matching "${search}"` : 'No roles found.'}
                </td></tr>
              ) : filtered.map(role => (
                <tr key={role.id} className="border-bottom" style={{ opacity: role.active ? 1 : 0.55 }}>
                  <td className="ps-4 py-3">
                    <div className="fw-medium text-dark">{role.name}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>#{role.id}</div>
                  </td>
                  <td className="py-3 text-muted small">{role.description || '—'}</td>
                  <td className="py-3">
                    {role.permissions?.length > 0
                      ? <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: 11 }}>{role.permissions.length} mapped</span>
                      : <span className="text-muted small">None</span>}
                  </td>
                  <td className="py-3">
                    <span className={`badge fw-normal ${role.active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`} style={{ fontSize: 11 }}>
                      {role.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 pe-4 text-end">
                    <div className="d-flex justify-content-end gap-3">
                      {hasPermission('ROLE_CREATE') && (
                        <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }}
                          onClick={() => navigate(`/roles/edit/${role.id}`)}>Edit</button>
                      )}
                      <button className="btn btn-link btn-sm text-dark p-0 text-decoration-none" style={{ fontSize: 13 }}
                        onClick={() => navigate(`/role-mapping?roleId=${role.id}`)}>Permissions</button>
                      
                      {role.name !== 'SUPER_ADMIN' ? (
                        <button className={`btn btn-link btn-sm p-0 text-decoration-none ${role.active ? 'text-warning' : 'text-success'}`} style={{ fontSize: 13 }}
                          onClick={() => handleToggle(role)}>
                          {role.active ? 'Disable' : 'Enable'}
                        </button>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border d-flex align-items-center" style={{ fontSize: 11, height: 20 }}>System Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EntityListPage>
    </>
  );
}
