import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function TenantsList() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [initialModules, setInitialModules] = useState([]);
  const [moduleDetails, setModuleDetails] = useState({});

  const ALL_MODULES = [
    'LEAD', 'EMPLOYEE', 'COURSE', 'AFFILIATE', 'MARKETING', 
    'CRM', 'HRMS', 'PAYROLL', 'ATTENDANCE', 'LMS', 'ADMIN'
  ];

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleStatus = async (tenant) => {
    setMessage(null);
    setError(null);
    try {
      if (tenant.active) {
        await api.put(`/tenants/${tenant.id}/disable`);
        setMessage(`Tenant '${tenant.name}' disabled successfully!`);
      } else {
        await api.put(`/tenants/${tenant.id}/enable`);
        setMessage(`Tenant '${tenant.name}' enabled successfully!`);
      }
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleManageModules = async (tenant) => {
    setMessage(null);
    setError(null);
    setSelectedTenant(tenant);
    try {
      const response = await api.get(`/tenants/${tenant.id}/modules`);
      const activeModules = response.data.filter(m => m.active).map(m => m.moduleName);
      setInitialModules(activeModules);
      
      const details = {};
      ALL_MODULES.forEach(m => {
        details[m] = {
          active: false,
          amount: '',
          paymentMethod: 'Card',
          specialRequirements: '',
          extraCharges: ''
        };
      });
      response.data.forEach(m => {
        if (details[m.moduleName]) {
          details[m.moduleName] = {
            active: m.active,
            amount: m.amount !== null && m.amount !== undefined ? m.amount : '',
            paymentMethod: m.paymentMethod || 'Card',
            specialRequirements: m.specialRequirements || '',
            extraCharges: m.extraCharges !== null && m.extraCharges !== undefined ? m.extraCharges : ''
          };
        }
      });
      setModuleDetails(details);
    } catch (err) {
      setError("Failed to fetch modules: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDetailChange = (moduleName, field, value) => {
    setModuleDetails(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [field]: value
      }
    }));
  };

  const saveModules = async () => {
    setMessage(null);
    setError(null);
    try {
      const promises = [];
      
      for (const moduleName of ALL_MODULES) {
        const detail = moduleDetails[moduleName] || { active: false };
        const wasActive = initialModules.includes(moduleName);
        
        if (detail.active) {
          const payload = {
            amount: (detail.amount !== '' && !isNaN(detail.amount)) ? parseFloat(detail.amount) : null,
            paymentMethod: detail.paymentMethod,
            specialRequirements: detail.specialRequirements || null,
            extraCharges: (detail.extraCharges !== '' && !isNaN(detail.extraCharges)) ? parseFloat(detail.extraCharges) : null
          };
          promises.push(api.put(`/tenants/${selectedTenant.id}/modules/${moduleName}/enable`, payload));
        } else if (wasActive) {
          promises.push(api.put(`/tenants/${selectedTenant.id}/modules/${moduleName}/disable`));
        }
      }

      await Promise.all(promises);
      setMessage(`Modules and subscription details updated successfully for ${selectedTenant.name}!`);
      setSelectedTenant(null);
      fetchTenants();
    } catch (err) {
      setError("Failed to save modules: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-4">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

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
                      <span className={`badge bg-${tenant.active ? 'success' : 'danger'}`}>
                        {tenant.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {tenant.id === 1 ? (
                        <span className="text-muted small">System Master</span>
                      ) : (
                        <>
                          <button
                            className="btn btn-info btn-sm me-2 text-white"
                            onClick={() => handleManageModules(tenant)}
                          >
                            Modules
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  Manage Modules for <strong>{selectedTenant.name}</strong>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTenant(null)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <p className="text-muted mb-4">Toggle the modules below to grant or revoke access, and specify payment and requirement details.</p>
                
                <div className="row">
                  {ALL_MODULES.map(moduleName => {
                    const detail = moduleDetails[moduleName] || { active: false, amount: '', paymentMethod: 'Card', specialRequirements: '', extraCharges: '' };
                    const isActive = detail.active;
                    return (
                      <div className="col-12 mb-3" key={moduleName}>
                        <div className={`card ${isActive ? 'border-primary shadow-sm' : 'border-secondary'}`} style={{ borderRadius: '12px' }}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold fs-6">{moduleName}</span>
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  role="switch" 
                                  style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                                  checked={isActive}
                                  onChange={() => handleDetailChange(moduleName, 'active', !isActive)}
                                />
                              </div>
                            </div>
                            
                            {isActive && (
                              <div className="row mt-3 p-3 bg-light rounded" style={{ border: '1px solid #e9ecef', fontSize: '13px' }}>
                                <div className="col-md-3 mb-2">
                                  <label className="form-label mb-1 text-muted fw-semibold">Amount (Price)</label>
                                  <input 
                                    type="number" 
                                    className="form-control form-control-sm"
                                    value={detail.amount}
                                    placeholder="e.g. 150"
                                    onChange={(e) => handleDetailChange(moduleName, 'amount', e.target.value)}
                                  />
                                </div>
                                <div className="col-md-3 mb-2">
                                  <label className="form-label mb-1 text-muted fw-semibold">How Paid</label>
                                  <select 
                                    className="form-select form-select-sm"
                                    value={detail.paymentMethod}
                                    onChange={(e) => handleDetailChange(moduleName, 'paymentMethod', e.target.value)}
                                  >
                                    <option value="Card">Credit/Debit Card</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI / Wallet">UPI / Wallet</option>
                                    <option value="Unpaid">Unpaid / Deferred</option>
                                  </select>
                                </div>
                                <div className="col-md-4 mb-2">
                                  <label className="form-label mb-1 text-muted fw-semibold">Special Requirements</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm"
                                    value={detail.specialRequirements}
                                    placeholder="e.g. Custom sequence format"
                                    onChange={(e) => handleDetailChange(moduleName, 'specialRequirements', e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2 mb-2">
                                  <label className="form-label mb-1 text-muted fw-semibold">Extra Charges</label>
                                  <input 
                                    type="number" 
                                    className="form-control form-control-sm"
                                    value={detail.extraCharges}
                                    placeholder="e.g. 50"
                                    onChange={(e) => handleDetailChange(moduleName, 'extraCharges', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTenant(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={saveModules}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
