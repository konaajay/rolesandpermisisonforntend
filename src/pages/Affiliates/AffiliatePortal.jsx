import React, { useState, useEffect } from 'react';
import { 
    FiMousePointer, FiTrendingUp, FiCheckCircle, FiDollarSign, 
    FiActivity, FiLayers, FiSettings, FiExternalLink, FiCopy, FiPlus, FiArrowRight 
} from 'react-icons/fi';
import affiliateService from '../../services/affiliateService';
import { useAuth } from '../../auth/AuthContext';
import StatCard from '../../components/StatCard';
import './Affiliates.css';

const AffiliatePortal = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user?.email) {
            fetchPortalData();
        }
    }, [user]);

    const fetchPortalData = async () => {
        try {
            setLoading(true);
            const partnerId = user.userId || user.id;
            const email = user.email;
            console.log("[AffiliatePortal] Fetching data for:", { partnerId, email });
            
            const data = await affiliateService.getDashboard(partnerId, email);
            console.log("[AffiliatePortal] Raw Dashboard Data Received:", data);
            
            setDashboardData(data);
        } catch (error) {
            console.error("[AffiliatePortal] Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <div className="spinner-border text-primary" role="status"></div>
            <span className="ms-3 fw-bold text-muted">Loading Partner Dashboard...</span>
        </div>
    );

    if (!dashboardData) return (
        <div className="p-5 text-center">
            <h2 className="text-muted">Partner account not found.</h2>
            <p>Please contact support to activate your referral account.</p>
        </div>
    );

    const fmt = (val) => val != null ? Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

    return (
        <div className="affiliate-portal-container p-4">
            {/* Header Section */}
            <header className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h1 className="fw-bold fs-2 text-dark mb-1">Partner Portal</h1>
                    <p className="text-secondary mb-0">Welcome back, <span className="fw-bold">{dashboardData.name}</span>! Track your referrals and earnings.</p>
                </div>
                <div className="d-flex gap-2">
                    <div className="bg-white px-3 py-2 rounded-4 border shadow-sm d-flex align-items-center gap-2">
                        <span className="text-muted small fw-bold">REF CODE:</span>
                        <code className="text-primary fw-bold fs-5">{dashboardData.referralCode}</code>
                        <button className="btn btn-link btn-sm p-0 mb-1" onClick={() => copyToClipboard(dashboardData.referralCode)}>
                            {copied ? <FiCheckCircle className="text-success" /> : <FiCopy className="text-muted" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="px-4 border-bottom bg-white rounded-top-4 shadow-sm">
                <ul className="nav nav-tabs border-bottom-0 gap-3">
                    {[
                        { key: 'overview', label: 'Overview', icon: <FiActivity className="me-2" /> },
                        { key: 'links', label: 'My Referral Links', icon: <FiLayers className="me-2" /> },
                        { key: 'activity', label: 'Recent Activity', icon: <FiTrendingUp className="me-2" /> },
                        { key: 'settings', label: 'Payout Settings', icon: <FiSettings className="me-2" /> },
                    ].map(tab => (
                        <li key={tab.key} className="nav-item">
                            <button
                                className={`nav-link border-0 border-bottom border-3 py-3 px-1 ${activeTab === tab.key ? 'active border-primary fw-bold text-primary' : 'text-muted border-transparent'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content Area */}
            <div className="bg-white p-4 rounded-bottom-4 shadow-sm border-top-0 mb-4">
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        {/* Summary Grid */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-3">
                                <StatCard 
                                    label="Total Link Clicks" 
                                    value={dashboardData.totalClicks} 
                                    icon={<FiMousePointer size={24} />} 
                                    color="blue" 
                                    trend="+8% from last week"
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard 
                                    label="Referral Leads" 
                                    value={dashboardData.totalReferrals} 
                                    icon={<FiTrendingUp size={24} />} 
                                    color="orange" 
                                    trend="Interested students"
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard 
                                    label="Enrollments" 
                                    value={dashboardData.purchases} 
                                    icon={<FiCheckCircle size={24} />} 
                                    color="green" 
                                    trend="Successful conversions"
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard 
                                    label="Total Earnings" 
                                    value={`₹${fmt(dashboardData.totalEarnings)}`} 
                                    icon={<FiDollarSign size={24} />} 
                                    color="purple" 
                                    trend="Lifetime rewards"
                                />
                            </div>
                        </div>

                        {/* Detailed Metrics Row */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card border-0 bg-primary bg-opacity-10 rounded-4 p-4 h-100">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                        <FiDollarSign className="text-primary" /> Wallet Inventory
                                    </h5>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="display-5 fw-bold text-primary">₹{fmt(dashboardData.walletBalance)}</div>
                                            <div className="text-secondary small fw-bold mt-1 text-uppercase">Current Payout Balance</div>
                                        </div>
                                        <button 
                                            className="btn btn-primary rounded-4 px-4 py-2 fw-bold shadow-sm"
                                            onClick={() => {
                                                if (!dashboardData.accountNumber) {
                                                    setActiveTab('settings');
                                                    alert("Please set up your bank details first to enable withdrawals.");
                                                } else {
                                                    alert("Withdrawal request submitted for processing. (Module coming soon)");
                                                }
                                            }}
                                        >
                                            Withdraw Funds
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-3 border-top border-primary border-opacity-10 small text-muted">
                                        <FiActivity className="me-1" /> Revenue Generated: <span className="fw-bold text-dark">₹{fmt(dashboardData.totalRevenue)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card border-0 bg-light rounded-4 p-4 h-100 border">
                                    <h5 className="fw-bold mb-4">Conversion Health</h5>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="small fw-bold text-muted">LEAD TO ENROLLMENT RATE</span>
                                            <span className="small fw-bold text-dark">
                                                {dashboardData.totalReferrals > 0 
                                                    ? ((dashboardData.purchases / dashboardData.totalReferrals) * 100).toFixed(1) 
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                            <div 
                                                className="progress-bar bg-success" 
                                                style={{ width: `${dashboardData.totalReferrals > 0 ? (dashboardData.purchases / dashboardData.totalReferrals) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="small text-muted mb-0 mt-auto">
                                        <FiActivity className="me-1" /> Performance is calculated based on successful batch payments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Active Tracking Links</h5>
                            <button className="btn btn-primary btn-sm rounded-3 px-3 d-flex align-items-center gap-2">
                                <FiPlus /> Share New Course
                            </button>
                        </div>
                        {dashboardData.activeLinks?.length === 0 ? (
                            <div className="text-center py-5 border-dashed rounded-4 bg-light">
                                <p className="text-muted mb-0">No custom links generated yet. Use your global code to refer students.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Course / Batch</th>
                                            <th>Referral URL</th>
                                            <th>Success Rate</th>
                                            <th>Commission</th>
                                            <th className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.activeLinks?.map((link, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="fw-bold text-dark">Batch Name</div>
                                                    <div className="small text-muted">ID: #{link.batchId}</div>
                                                </td>
                                                <td>
                                                    <code className="text-primary bg-primary bg-opacity-10 px-2 py-1 rounded small">
                                                        {window.location.origin}/apply?ref={link.referralCode}
                                                    </code>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success bg-opacity-10 text-success border-0">High</span>
                                                </td>
                                                <td className="fw-bold">
                                                    {link.commissionValue}%
                                                </td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => copyToClipboard(`${window.location.origin}/apply?ref=${link.referralCode}`)}>
                                                        <FiCopy />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="animate-fade-in">
                        <h5 className="fw-bold mb-4">Recent Tracking Activity</h5>
                        <div className="activity-list border-start border-2 ms-2 ps-4">
                            {dashboardData.recentActivity?.map((lead, idx) => (
                                <div key={idx} className="activity-item mb-4 position-relative">
                                    <div className="position-absolute translate-middle-x" style={{ left: '-29px', top: '0' }}>
                                        <div className={`rounded-circle bg-white border-2 border-${lead.status === 'ENROLLED' ? 'success' : 'primary'} d-flex align-items-center justify-content-center`} style={{ width: '12px', height: '12px' }}></div>
                                    </div>
                                    <div className="card border-0 shadow-sm bg-light bg-opacity-50 p-3 rounded-4">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <span className={`badge mb-2 bg-${lead.status === 'ENROLLED' ? 'success' : 'primary'} bg-opacity-10 text-${lead.status === 'ENROLLED' ? 'success' : 'primary'}`}>
                                                    {lead.status}
                                                </span>
                                                <div className="fw-bold text-dark">{lead.studentName}</div>
                                                <div className="small text-muted">Inquired for <span className="fw-bold text-dark">Batch #{lead.batchId}</span></div>
                                            </div>
                                            <div className="text-end small text-muted">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {dashboardData.recentActivity?.length === 0 && (
                                <div className="text-muted py-4">No recent activity detected. Share your link to get started!</div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="animate-fade-in">
                        <h5 className="fw-bold mb-4">Payout & Bank Settings</h5>
                        <div className="card border-0 bg-light rounded-4 p-4 border">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const formData = new FormData(e.target);
                                    const bankInfo = Object.fromEntries(formData);
                                    await affiliateService.updateBankDetails(user.userId || user.id, bankInfo);
                                    alert("Bank details updated successfully!");
                                    fetchPortalData();
                                } catch (err) {
                                    alert("Failed to update bank details.");
                                }
                            }}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">ACCOUNT HOLDER NAME</label>
                                        <input name="accountHolderName" type="text" className="form-control rounded-3" defaultValue={dashboardData.accountHolderName} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">BANK NAME</label>
                                        <input name="bankName" type="text" className="form-control rounded-3" defaultValue={dashboardData.bankName} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">ACCOUNT NUMBER</label>
                                        <input name="accountNumber" type="text" className="form-control rounded-3" defaultValue={dashboardData.accountNumber} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">IFSC / SWIFT CODE</label>
                                        <input name="ifscCode" type="text" className="form-control rounded-3" defaultValue={dashboardData.ifscCode} required />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold text-muted">UPI ID (OPTIONAL)</label>
                                        <input name="upiId" type="text" className="form-control rounded-3" placeholder="username@bank" defaultValue={dashboardData.upiId} />
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button type="submit" className="btn btn-primary px-5 rounded-3 fw-bold">Save Bank Details</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-4 small text-danger-emphasis">
                            <FiActivity className="me-2" /> Verification might be required before your first payout. Ensure all details match your bank records.
                        </div>
                    </div>
                )}
            </div>
            
            {/* Quick Actions Footer */}
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="bg-dark text-white p-4 rounded-4 shadow d-flex align-items-center justify-content-between cursor-pointer">
                        <div>
                            <div className="fw-bold mb-1">Affiliate Guidelines</div>
                            <div className="small text-white text-opacity-50">Review our terms & commission rules</div>
                        </div>
                        <FiArrowRight />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="bg-primary text-white p-4 rounded-4 shadow d-flex align-items-center justify-content-between cursor-pointer">
                        <div>
                            <div className="fw-bold mb-1">Marketing Assets</div>
                            <div className="small text-white text-opacity-50">Download banners and promotional media</div>
                        </div>
                        <FiExternalLink />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffiliatePortal;
