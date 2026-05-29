import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { isPlatformAdmin, hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [stats, setStats]   = useState({ totalUsers: null, totalRoles: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Run both in parallel; gracefully ignore failures (permission / module not enabled)
        const [usersRes, rolesRes] = await Promise.allSettled([
          api.get('/users', { signal: ctrl.signal, ignore403: true }),
          api.get('/roles', { signal: ctrl.signal, ignore403: true }),
        ]);

        setStats({
          totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.length : null,
          totalRoles: rolesRes.status === 'fulfilled' ? rolesRes.value.data.length : null,
        });
      } catch (err) {
        if (err.name !== 'CanceledError') console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => ctrl.abort();
  }, []);

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="mb-5">
        <h5 className="fw-bold text-dark mb-1">Dashboard</h5>
        <p className="text-muted small mb-0">
          Welcome back, <strong>{user?.email?.split('@')[0] || 'User'}</strong> · {isPlatformAdmin ? 'Platform Admin' : 'Tenant Admin'}
        </p>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-5">
        <StatCard title="Total Users" value={stats.totalUsers} color="primary" loading={loading}
          icon="👥" sub={`Across ${isPlatformAdmin ? 'all tenants' : 'your organisation'}`} onClick={() => navigate('/users')} />
        <StatCard title="Active Roles" value={stats.totalRoles} color="success" loading={loading}
          icon="🔑" sub="Roles configured" onClick={() => navigate('/roles')} />
        <StatCard title="Active Sessions" value="—" color="warning" loading={false}
          icon="⚡" sub="Coming soon" />
        <StatCard title="Modules" value="—" color="info" loading={false}
          icon="🧩" sub="Coming soon" />
      </div>

      {/* Quick Actions */}
      <div className="card border-0 shadow-sm rounded-3 p-4">
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '13px' }}>Quick Actions</h6>
        <div className="d-flex flex-wrap gap-2">
          {hasPermission('USER_CREATE') && (
            <button className="btn btn-primary btn-sm fw-medium" style={{ height: 34 }}
              onClick={() => navigate('/users/create')}>+ Add User</button>
          )}
          {hasPermission('ROLE_CREATE') && (
            <button className="btn btn-outline-primary btn-sm fw-medium" style={{ height: 34 }}
              onClick={() => navigate('/roles/create')}>+ Add Role</button>
          )}
          <button className="btn btn-outline-secondary btn-sm fw-medium" style={{ height: 34 }}
            onClick={() => navigate('/users')}>View All Users</button>
          <button className="btn btn-outline-secondary btn-sm fw-medium" style={{ height: 34 }}
            onClick={() => navigate('/roles')}>View All Roles</button>
        </div>
      </div>
    </div>
  );
}
