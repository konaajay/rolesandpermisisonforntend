import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const [tenantRes, modulesRes] = await Promise.all([
          api.get('/tenants'),
          api.get(`/tenants/${id}/modules`)
        ]);
        
        const found = tenantRes.data.find(t => t.id === parseInt(id));
        if (found) {
          setTenant(found);
        }
        
        if (modulesRes.data) {
          setModules(modulesRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch tenant details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantData();
  }, [id]);

  if (loading) return <div className="p-4">Loading tenant details...</div>;
  if (!tenant) return <div className="p-4 text-danger">Tenant not found.</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <button className="btn btn-sm btn-outline-secondary mb-4" onClick={() => navigate('/tenants')}>
        ← Back to Tenants
      </button>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="fw-bold m-0">{tenant.name}</h4>
            <span className={`badge bg-${tenant.active ? 'success' : 'danger'}`}>
              {tenant.active ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-muted small mb-0">
            Tenant Code: <strong>{tenant.code}</strong> • Admin Email: <strong>{tenant.adminEmail || 'N/A'}</strong>
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.5px', fontSize: '13px' }}>
                Configured Modules
              </h6>
              <hr />
              <ul className="list-unstyled mb-0 row">
                {modules.length > 0 ? modules.map(m => (
                  <li key={m.moduleName} className="col-md-4 mb-3 d-flex align-items-center">
                    <span className="me-2" style={{ color: m.active ? '#198754' : '#dc3545', fontSize: '18px' }}>
                      {m.active ? '✓' : '✗'}
                    </span>
                    <span className={m.active ? 'fw-medium text-dark' : 'text-muted text-decoration-line-through'}>
                      {m.moduleName}
                    </span>
                  </li>
                )) : (
                  <li className="text-muted small">No modules configured.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h6 className="fw-bold text-uppercase text-muted mb-4" style={{ letterSpacing: '0.5px', fontSize: '13px' }}>
            System Resources
          </h6>
          <div className="row text-center">
            <div className="col border-end">
              <h4 className="fw-bold text-dark mb-1">—</h4>
              <p className="text-muted small mb-0">Users</p>
            </div>
            <div className="col border-end">
              <h4 className="fw-bold text-dark mb-1">—</h4>
              <p className="text-muted small mb-0">Roles</p>
            </div>
            <div className="col border-end">
              <h4 className="fw-bold text-dark mb-1">—</h4>
              <p className="text-muted small mb-0">Storage</p>
            </div>
            <div className="col border-end">
              <h4 className="fw-bold text-dark mb-1">—</h4>
              <p className="text-muted small mb-0">Billing</p>
            </div>
            <div className="col">
              <h4 className="fw-bold text-dark mb-1">—</h4>
              <p className="text-muted small mb-0">Logs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
