import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function TenantsList() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [assignForm, setAssignForm] = useState({ planId: '', billingInterval: 'MONTHLY', amount: '', paymentReference: '', endDate: '', customModules: [] });

  const ALL_MODULES = [
    'ADMIN', 'AFFILIATE', 'ATTENDANCE', 'COURSE', 'CRM', 'EMPLOYEE', 
    'HRMS', 'LEAD', 'LMS', 'MARKETING', 'PAYROLL', 'VENDOR'
  ];

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription-plans/all');
      setPlans(response.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  const handleToggleStatus = async (tenant) => {
    try {
      if (tenant.active) {
        await api.put(`/tenants/${tenant.id}/disable`);
        showToast('success', `Tenant '${tenant.name}' disabled successfully!`);
      } else {
        await api.put(`/tenants/${tenant.id}/enable`);
        showToast('success', `Tenant '${tenant.name}' enabled successfully!`);
      }
      fetchTenants();
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message);
    }
  };

  const handleManageSubscription = (tenant) => {
    setSelectedTenant(tenant);
    setAssignForm({
      planId: '',
      billingInterval: 'MONTHLY',
      amount: '',
      paymentReference: '',
      endDate: '',
      customModules: []
    });
  };

  const handleModuleToggle = (mod) => {
    setAssignForm(prev => {
      const isSelected = prev.customModules.includes(mod);
      if (isSelected) {
        return { ...prev, customModules: prev.customModules.filter(m => m !== mod) };
      } else {
        return { ...prev, customModules: [...prev.customModules, mod] };
      }
    });
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p.id.toString() === planId);
    setAssignForm({
      ...assignForm,
      planId,
      amount: plan ? (assignForm.billingInterval === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice) : ''
    });
  };

  const handleIntervalChange = (billingInterval) => {
    const plan = plans.find(p => p.id.toString() === assignForm.planId);
    setAssignForm({
      ...assignForm,
      billingInterval,
      amount: plan ? (billingInterval === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice) : assignForm.amount
    });
  };

  const saveSubscription = async () => {
    if (!assignForm.planId && assignForm.customModules.length === 0) {
      showToast('error', 'Please select a plan or choose custom modules');
      return;
    }
    try {
      await api.post(`/api/subscriptions/admin/assign/${selectedTenant.id}`, {
        planId: assignForm.planId ? parseInt(assignForm.planId) : null,
        planName: assignForm.planId ? null : 'Custom Plan',
        billingInterval: assignForm.billingInterval,
        amount: assignForm.amount ? parseFloat(assignForm.amount) : null,
        paymentReference: assignForm.paymentReference,
        endDate: assignForm.endDate ? assignForm.endDate : null,
        customModules: !assignForm.planId ? assignForm.customModules : []
      });
      showToast('success', `Subscription assigned successfully to ${selectedTenant.name}!`);
      setSelectedTenant(null);
      fetchTenants();
    } catch (err) {
      showToast('error', "Failed to assign subscription: " + (err.response?.data?.message || err.message));
    }
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

      <div className="card shadow-sm p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">System Tenants</h4>
          <div>
            <button className="btn btn-primary btn-sm me-2" onClick={() => navigate('/create-tenant')}>
              + Create Tenant
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={fetchTenants}>
              Refresh List
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Tenant Name</th>
                <th>Tenant Code</th>
                <th>Database</th>
                <th>Admin Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No tenants found.</td>
                </tr>
              ) : (
                tenants.map(tenant => (
                  <tr key={tenant.id}>
                    <td><code>{tenant.id}</code></td>
                    <td><strong>{tenant.name}</strong></td>
                    <td><span className="badge bg-secondary">{tenant.code}</span></td>
                    <td><code>{tenant.dbName}</code></td>
                    <td>{tenant.adminEmail ? tenant.adminEmail : <span className="text-muted">N/A</span>}</td>
                    <td>
                      <div className="d-flex flex-column gap-1" style={{ maxWidth: '80px' }}>
                        <span className={`badge bg-${tenant.active ? 'success' : 'danger'} w-100`}>
                          {tenant.active ? 'Active' : 'Disabled'}
                        </span>
                        {tenant.status && (
                          <span className={`badge bg-${tenant.status === 'TRIAL' ? 'warning text-dark' : 'info'} w-100`}>
                            {tenant.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {tenant.id === 1 ? (
                        <span className="text-muted small">System Master</span>
                      ) : (
                        <>
                          <button
                            className="btn btn-info btn-sm me-2 text-white"
                            onClick={() => navigate(`/tenants/${tenant.id}`)}
                          >
                            Details
                          </button>
                          <button
                            className="btn btn-warning btn-sm me-2 text-dark"
                            onClick={() => handleManageSubscription(tenant)}
                          >
                            Subscription
                          </button>
                          <button
                            className={`btn btn-${tenant.active ? 'danger' : 'success'} btn-sm`}
                            onClick={() => handleToggleStatus(tenant)}
                          >
                            {tenant.active ? 'Disable' : 'Enable'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTenant && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  Assign Subscription to <strong>{selectedTenant.name}</strong>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTenant(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">Select a subscription plan to automatically assign the corresponding modules and update the tenant's expiry date.</p>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Plan</label>
                  <select 
                    className="form-select"
                    value={assignForm.planId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                  >
                    <option value="">-- Custom Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.modules.length} modules)</option>
                    ))}
                  </select>
                </div>

                {!assignForm.planId && (
                  <div className="mb-3 p-3 bg-light rounded border">
                    <label className="form-label fw-bold">Select Custom Modules</label>
                    <div className="d-flex flex-wrap gap-2">
                      {ALL_MODULES.map(mod => (
                        <div className="form-check form-switch me-3" key={mod}>
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`mod_${mod}`}
                            checked={assignForm.customModules.includes(mod)}
                            onChange={() => handleModuleToggle(mod)}
                          />
                          <label className="form-check-label" htmlFor={`mod_${mod}`}>{mod}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold">Billing Interval</label>
                  <select 
                    className="form-select"
                    value={assignForm.billingInterval}
                    onChange={(e) => handleIntervalChange(e.target.value)}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Custom Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={assignForm.endDate}
                    onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
                  />
                  <div className="form-text">If left blank, the system will automatically calculate expiry based on Billing Interval.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Amount Override (Optional)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={assignForm.amount}
                    onChange={(e) => setAssignForm({ ...assignForm, amount: e.target.value })}
                  />
                  <div className="form-text">Leave as default price from plan, or override for custom pricing.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Payment Reference (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Invoice #1234 or Trial"
                    value={assignForm.paymentReference}
                    onChange={(e) => setAssignForm({ ...assignForm, paymentReference: e.target.value })}
                  />
                </div>
                
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTenant(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={saveSubscription}>Assign Subscription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
