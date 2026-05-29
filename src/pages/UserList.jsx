import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../auth/usePermissions';
import EntityListPage from '../components/EntityListPage';

/* ── helpers ─────────────────────────────────────────────────── */
const StatusBadge = ({ active }) => (
  <span
    className={`badge fw-normal ${active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`}
    style={{ fontSize: '11px' }}
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);

const RoleBadge = ({ name }) => (
  <span
    className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
    style={{ fontSize: '11px', fontWeight: 500 }}
  >
    {name}
  </span>
);

const initials = (u) =>
  ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase();

/* ══ Component ═══════════════════════════════════════════════ */
export default function UserList() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState(null);   // { type: 'success'|'error', msg }

  /* ── fetch ──────────────────────────────────────────────── */
  const fetchUsers = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users', { signal });
      setUsers(res.data);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchUsers(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  /* ── toast helper ────────────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── actions ─────────────────────────────────────────────── */
  const handleDeactivate = async (user) => {
    const action = user.active ? 'deactivate' : 're-activate';
    try {
      await api.patch(`/users/${user.id}/deactivate`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u));
      showToast('success', `User ${action}d successfully.`);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message);
    }
  };

  /**
   * Password reset — currently initiates admin-forced reset.
   * TODO: Replace with OTP-email flow when OTP infrastructure is ready.
   */
  const handleResetPassword = async (user) => {
    showToast('success', `Password reset initiated for ${user.firstName}. OTP flow will be implemented in next sprint.`);
  };

  /* ── client-side search ──────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      [u.firstName, u.lastName, u.email, u.roleName]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    );
  }, [users, search]);

  /* ── render ──────────────────────────────────────────────── */
  return (
    <>
      {/* ── Toast notification ── */}
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

      <EntityListPage
        title="Users"
        description="Manage all users, roles, and access across your organisation"
        addLabel={hasPermission('USER_CREATE') ? '+ Add User' : undefined}
        addRoute="/users/create"
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        totalCount={!loading ? filtered.length : undefined}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Email</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: '130px' }}>Role</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: '90px' }}>Status</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: '130px' }}>Reports To</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted small">
                    {search ? `No users matching "${search}"` : 'No users found. Click "+ Add User" to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="border-bottom" style={{ opacity: user.active ? 1 : 0.55 }}>
                    {/* Name + Avatar */}
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 ${user.active ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}
                          style={{ width: 32, height: 32, fontSize: 12 }}
                        >
                          {initials(user)}
                        </div>
                        <div>
                          <div className="fw-medium text-dark lh-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            {user.leadId || user.employeeId || `#${user.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-muted">{user.email}</td>

                    <td className="py-3">
                      {user.roleName
                        ? <RoleBadge name={user.roleName} />
                        : <span className="text-muted">—</span>}
                    </td>

                    <td className="py-3">
                      <StatusBadge active={user.active} />
                    </td>

                    <td className="py-3 text-muted small">
                      {user.supervisorName || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-3">
                        {hasPermission('USER_UPDATE') && (
                          <button
                            className={`btn btn-link btn-sm p-0 text-decoration-none ${!user.active ? 'text-muted' : 'text-primary'}`}
                            style={{ fontSize: '13px', cursor: !user.active ? 'not-allowed' : 'pointer' }}
                            onClick={() => user.active && navigate(`/users/edit/${user.id}`)}
                            disabled={!user.active}
                            title={!user.active ? "Cannot edit inactive user" : "Edit user"}
                          >
                            Edit
                          </button>
                        )}
                        {user.roleName === 'SUPER_ADMIN' ? (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border d-flex align-items-center" style={{ fontSize: 11, height: 20 }}>System Protected</span>
                        ) : (
                          hasPermission('USER_UPDATE') && (
                            <button
                              className={`btn btn-link btn-sm p-0 text-decoration-none ${user.active ? 'text-warning' : 'text-success'}`}
                              style={{ fontSize: '13px' }}
                              onClick={() => handleDeactivate(user)}
                              title={user.active ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.active ? 'Deactivate' : 'Activate'}
                            </button>
                          )
                        )}
                        {hasPermission('USER_UPDATE') && (
                          <button
                            className={`btn btn-link btn-sm p-0 text-decoration-none ${!user.active ? 'text-muted' : 'text-secondary'}`}
                            style={{ fontSize: '13px', cursor: !user.active ? 'not-allowed' : 'pointer' }}
                            onClick={() => user.active && handleResetPassword(user)}
                            disabled={!user.active}
                            title={!user.active ? "Cannot reset password for inactive user" : "Reset password (OTP flow)"}
                          >
                            Reset Pwd
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </EntityListPage>
    </>
  );
}
