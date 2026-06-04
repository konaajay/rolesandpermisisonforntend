import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiUser, FiPercent, FiBarChart2, FiSettings, FiPlus, FiDownload, FiSearch, FiFilter, FiLink, FiCopy, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import AffiliateForm from './components/AffiliateForm';
import AffiliateLinkForm from './components/AffiliateLinkForm';
import AffiliateDetails from './components/AffiliateDetails';
import LeadManagement from '../marketing/components/pages/LeadDashboard';
import SalesManagement from '../marketing/components/pages/MarketingAnalytics';
import WalletSettings from './WalletSettings';
import affiliateService from '../../services/affiliateService';
import './Affiliates.css';

const Affiliates = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Data State
  const [affiliatesList, setAffiliatesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Affiliates on mount
  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const data = await affiliateService.getAllAffiliates();
      setAffiliatesList(Array.isArray(data) ? data : []);
    } catch (error) {
      setAffiliatesList([]);
    } finally {
      setLoading(false);
    }
  };

  // TODO: connect totalRevenue and commissionsPaid to /api/admin/wallets metrics endpoint
  const stats = {
    totalRevenue: (Array.isArray(affiliatesList) ? affiliatesList : []).reduce((acc, a) => acc + (a.totalRevenue || 0), 0),
    commissionsPaid: (Array.isArray(affiliatesList) ? affiliatesList : []).reduce((acc, a) => acc + (a.totalEarned || 0), 0),
    activeAffiliates: (Array.isArray(affiliatesList) ? affiliatesList : []).filter(a => a?.status === 'ACTIVE').length,
    pendingAffiliates: (Array.isArray(affiliatesList) ? affiliatesList : []).filter(a => a?.status === 'PENDING_APPROVAL').length
  };

  return (
    <div className="affiliate-page">
      <header className="affiliate-header p-4 bg-white border-bottom shadow-sm rounded-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="page-title">
            <h1 className="h3 fw-bold mb-1 text-dark">Affiliate Program</h1>
            <p className="text-muted small mb-0">Manage partners, tracking links, and performance metrics.</p>
          </div>
          <div className="header-actions">
            {/* New Affiliate button removed */}
          </div>
        </div>
        
        <div className="nav-scroller mt-4">
          <nav className="nav nav-pills gap-2 flex-nowrap overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
              { id: 'affiliates', label: 'Partners', icon: <FiUsers /> },
              { id: 'referrals', label: 'Leads', icon: <FiSearch /> },
              { id: 'payouts', label: 'Sales & P/L', icon: <FiDollarSign /> },
              { id: 'wallets', label: 'Wallets', icon: <FiSettings /> },
              { id: 'commission', label: 'Commission Rules', icon: <FiLink /> },
              { id: 'settings', label: 'Settings', icon: <FiSettings /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                className={`nav-link border-0 d-flex align-items-center gap-2 px-3 py-2 rounded-3 transition-all ${activeTab === tab.id ? 'active bg-primary shadow-sm text-white' : 'text-muted hover-bg-light'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="fw-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="affiliate-content">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="affiliate-summary">
              <div className="summary-card highlight">
                <div>
                  <div className="summary-label">Total Revenue Generated</div>
                  <div className="summary-value">₹ {stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="text-white text-opacity-50 small mt-4">
                  <FiBarChart2 className="me-1" /> Metrics will update as links are shared
                </div>
              </div>
              <div className="summary-card">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="summary-label">Commissions Paid</div>
                    <div className="summary-value">₹ {stats.commissionsPaid.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-circle bg-green-subtle text-green">
                    <FiDollarSign size={24} color="#16a34a" />
                  </div>
                </div>
                <div style={{ marginTop: 'auto', fontSize: 13, color: '#16a34a' }}>
                  <FiBarChart2 className="me-1" /> Accurate to current payouts
                </div>
              </div>
              <div className="summary-card">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="summary-label">Active Affiliates</div>
                    <div className="summary-value">{stats.activeAffiliates}</div>
                  </div>
                  <div className="p-2 rounded-circle bg-blue-subtle text-blue">
                    <FiUsers size={24} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ marginTop: 'auto', fontSize: 13, color: '#64748b' }}>
                  <span className="badge bg-warning-subtle text-warning">{stats.pendingAffiliates} Pending</span>
                </div>
              </div>
            </div>

            <div className="table-responsive bg-white rounded shadow-sm border p-0 overflow-auto" style={{ maxWidth: '100%' }}>
              <div className="table-header border-bottom px-4 py-3">
                <h5 className="mb-0 fw-bold text-dark">Top Performing Affiliates</h5>
              </div>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-uppercase fw-bold text-muted">
                    <th className="ps-4">Affiliate Name</th>
                    <th>Type</th>
                    <th>Referrals</th>
                    <th>Revenue Ref.</th>
                    <th>Commission</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-5">Loading performance data...</td></tr>
                  ) : affiliatesList.length > 0 ? (
                    affiliatesList.slice(0, 5).map(aff => (
                      <tr key={aff.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {aff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark text-sm">{aff.name}</div>
                              <div className="text-muted text-xs">{aff.systemCode || 'ID: ' + aff.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{aff.type || 'Individual'}</td>
                        <td className="fw-bold text-dark">{aff.conversions || 0}</td>
                        <td className="text-secondary">₹ {aff.totalRevenue?.toLocaleString('en-IN') || 0}</td>
                        <td className="fw-bold text-success">-</td>
                        <td className="pe-4">
                          <span className="badge bg-success bg-opacity-10 text-success">
                            {aff.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AFFILIATES TAB */}
        {activeTab === 'affiliates' && (
          <div className="animate-fade-in">
            <div className="affiliate-table-container">
              <div className="users-controls mb-0" style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
                <div className="search-box" style={{ flex: 1 }}>
                  <FiSearch />
                  <input type="text" placeholder="Search affiliates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="filter-box">
                  <select className="form-select" style={{ padding: '10px', borderRadius: 10, borderColor: '#e2e8f0' }}>
                    <option>Type: All</option>
                    <option>Individual</option>
                    <option>Organization</option>
                    <option>Influencer</option>
                  </select>
                </div>
                {/* Add New Partner button removed */}
              </div>
              <div className="table-responsive bg-white rounded shadow-sm border mt-3">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-uppercase fw-bold text-muted">
                      <th className="ps-4">Name</th>
                      <th>Type</th>
                      <th>Referrals</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-4">Loading affiliates...</td></tr>
                    ) : affiliatesList.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">No affiliates found.</td></tr>
                    ) : affiliatesList.filter(a => a?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(aff => (
                      <tr key={aff.id} onClick={() => setSelectedAffiliate(aff)} style={{ cursor: 'pointer' }}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 40, height: 40 }}>
                              {aff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{aff.name}</div>
                              <div className="small text-muted">{aff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-light text-dark border fw-normal">{aff.type || 'Individual'}</span></td>
                        <td className="fw-bold">{aff.conversions || 0}</td>
                        <td><span className="badge bg-success bg-opacity-10 text-success border-0">Low</span></td>
                        <td><span className="badge bg-success bg-opacity-10 text-success">{aff.status || 'ACTIVE'}</span></td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={(e) => { e.stopPropagation(); setSelectedAffiliate(aff); setShowAssignmentModal(true); }}>
                            <FiLink className="me-1" /> Link
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); setSelectedAffiliate(aff); }}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-4 shadow-sm border p-4">
              <LeadManagement />
            </div>
          </div>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === 'payouts' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-4 shadow-sm border p-4">
              <SalesManagement />
            </div>
          </div>
        )}

        {/* WALLETS TAB */}
        {activeTab === 'wallets' && (
          <div className="animate-fade-in">
            <WalletSettings />
          </div>
        )}

        {/* COMMISSION RULES TAB */}
        {activeTab === 'commission' && (
          <div className="animate-fade-in">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">Link & Commission Rules</h5>
                  <button className="btn btn-premium-primary px-4 shadow-sm" style={{ borderRadius: '12px' }} onClick={() => setShowAssignmentModal(true)}>
                    <FiLink size={18} /> Generate Tracking Link
                  </button>
                </div>
                <p className="text-muted">Special commission structures for specific batches.</p>
                <div className="p-5 bg-light rounded-4 text-center text-muted border border-dashed text-uppercase small fw-bold">
                  No special rules configured.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in pb-5">
            <div className="row g-4">
              {/* Partner Settings */}
              <div className="col-lg-6">
                <div className="bg-white rounded-4 shadow-sm border p-4 h-100">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                      <FiUsers size={20} />
                    </div>
                    <h5 className="fw-bold mb-0">Partner Settings</h5>
                  </div>
                  
                  <div className="mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                    <div>
                      <div className="fw-bold small">Enable Program</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Business Partner status</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted d-flex align-items-center gap-2">
                       <FiPercent size={14} className="text-primary" /> Default Commission (%)
                    </label>
                    <div className="input-group">
                      <input type="number" className="form-control form-control-lg rounded-3 border-end-0" defaultValue={15} />
                      <span className="input-group-text bg-white border-start-0 text-muted">%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted d-flex align-items-center gap-2">
                       <FiDollarSign size={14} className="text-primary" /> Minimum Payout (₹)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">₹</span>
                      <input type="number" className="form-control form-control-lg rounded-3 border-start-0" defaultValue={2000} />
                    </div>
                  </div>

                  <button className="btn btn-premium-primary w-100 py-3 rounded-4 shadow-sm fw-bold">
                    Save Partner Configuration
                  </button>
                </div>
              </div>

              {/* Student Ambassador Settings */}
              <div className="col-lg-6">
                <div className="bg-white rounded-4 shadow-sm border p-4 h-100">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                      <FiUser size={20} />
                    </div>
                    <h5 className="fw-bold mb-0">Student Ambassador Settings</h5>
                  </div>

                  <div className="mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                    <div>
                      <div className="fw-bold small">Student Program</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Auto-enrolled student ambassadors</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted d-flex align-items-center gap-2">
                       <FiPercent size={14} className="text-success" /> Student Commission (%)
                    </label>
                    <div className="input-group">
                      <input type="number" className="form-control form-control-lg rounded-3 border-end-0" defaultValue={10} />
                      <span className="input-group-text bg-white border-start-0 text-muted">%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted d-flex align-items-center gap-2">
                       <FiDollarSign size={14} className="text-success" /> Student Min Payout (₹)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">₹</span>
                      <input type="number" className="form-control form-control-lg rounded-3 border-start-0" defaultValue={1000} />
                    </div>
                  </div>

                  <button className="btn btn-premium-primary w-100 py-3 rounded-4 shadow-sm fw-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    Save Student Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}

      {showAssignmentModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content animate-scale-up-fast" style={{ background: '#fff', borderRadius: 24, maxWidth: 800, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
            <AffiliateLinkForm initialAffiliate={selectedAffiliate} onSave={() => setShowAssignmentModal(false)} onCancel={() => { setShowAssignmentModal(false); setSelectedAffiliate(null); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliates;