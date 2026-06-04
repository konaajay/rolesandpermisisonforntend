import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Users,
    AlertCircle,
    Loader
} from 'lucide-react';
import affiliateService from '../../services/affiliateService';
import './Affiliates.css';

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
        <div className="card-body d-flex align-items-center gap-3 p-4">
            <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 52, height: 52, backgroundColor: `${color}18` }}
            >
                <Icon size={24} style={{ color }} />
            </div>
            <div>
                <p className="text-muted small mb-1">{label}</p>
                <h5 className="fw-bold mb-0">₹ {fmt(value)}</h5>
            </div>
        </div>
    </div>
);

// ─── Transaction Row ───────────────────────────────────────────────────────────
const TxRow = ({ tx }) => {
    const isCredit = tx.type === 'CREDIT';
    return (
        <tr>
            <td className="text-muted small">{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
            <td>
                <span className={`badge ${isCredit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {isCredit ? <ArrowDownCircle size={12} className="me-1" /> : <ArrowUpCircle size={12} className="me-1" />}
                    {tx.type}
                </span>
            </td>
            <td className={`fw-semibold ${isCredit ? 'text-success' : 'text-danger'}`}>
                {isCredit ? '+' : '-'} ₹ {fmt(tx.amount)}
            </td>
            <td className="text-muted small">{tx.description || '—'}</td>
        </tr>
    );
};

// ─── Affiliate Wallet Row ─────────────────────────────────────────────────────
const AffiliateWalletRow = ({ wallet, affiliates }) => {
    const [expanded, setExpanded] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(false);

    const affiliate = affiliates.find((a) => a.id === wallet.affiliateId);

    const loadTransactions = useCallback(async () => {
        if (transactions.length > 0) { setExpanded(true); return; }
        setLoadingTx(true);
        try {
            const data = await affiliateService.getWalletTransactions(wallet.affiliateId);
            setTransactions(data);
        } catch {
            setTransactions([]);
        } finally {
            setLoadingTx(false);
            setExpanded(true);
        }
    }, [wallet.affiliateId, transactions.length]);

    const toggle = () => {
        if (expanded) { setExpanded(false); } else { loadTransactions(); }
    };

    return (
        <>
            <tr className="align-middle" style={{ cursor: 'pointer' }} onClick={toggle}>
                <td>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: 36, height: 36, fontSize: 14 }}
                        >
                            {affiliate?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="fw-semibold" style={{ fontSize: 14 }}>{affiliate?.name || `Affiliate #${wallet.affiliateId}`}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{affiliate?.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td className="fw-bold text-primary">₹ {fmt(wallet.balance)}</td>
                <td className="text-success fw-semibold">₹ {fmt(wallet.totalEarned)}</td>
                <td className="text-secondary">₹ {fmt(wallet.totalPaid)}</td>
                <td className="text-muted small">{wallet.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString('en-IN') : '—'}</td>
                <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); toggle(); }}>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span className="ms-1" style={{ fontSize: 12 }}>History</span>
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={6} className="p-0">
                        <div className="bg-light p-3 border-top" style={{ borderRadius: '0 0 10px 10px' }}>
                            {loadingTx ? (
                                <div className="text-center py-3 text-muted">
                                    <Loader size={18} className="me-2 spin" /> Loading transactions...
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="text-muted text-center mb-0 small fst-italic py-2">No transactions yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless mb-0">
                                        <thead>
                                            <tr className="text-muted" style={{ fontSize: 12 }}>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WalletSettings = () => {
    const [wallets, setWallets] = useState([]);
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({ minPayout: 1000 });
    const [savingConfig, setSavingConfig] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('STUDENT'); // 'PARTNER' or 'STUDENT'

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletsData, affiliatesData, configData] = await Promise.all([
                affiliateService.getAllWallets(),
                affiliateService.getAllAffiliates(),
                affiliateService.getWalletConfig()
            ]);
            setWallets(Array.isArray(walletsData) ? walletsData : (walletsData?.data || []));
            setAffiliates(Array.isArray(affiliatesData) ? affiliatesData : (affiliatesData?.data || []));
            if (configData) setConfig(configData);
        } catch (err) {
            setError('Failed to load wallet data. Please check if the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Grouping and Filtering
    const safeWallets = Array.isArray(wallets) ? wallets : [];
    
    // Map wallet to affiliate type
    const walletsWithType = safeWallets.map(w => {
        const aff = affiliates.find(a => a.id === w.affiliateId);
        return { ...w, type: aff?.type || 'PARTNER' };
    });

    const filteredWallets = walletsWithType.filter(w => w.type === activeTab);
    const partners = walletsWithType.filter(w => w.type === 'PARTNER');
    const students = walletsWithType.filter(w => w.type === 'STUDENT');

    // Summary totals (Active Tab)
    const totalBalance = filteredWallets.reduce((s, w) => s + (w.balance || 0), 0);
    const totalEarned = filteredWallets.reduce((s, w) => s + (w.totalEarned || 0), 0);
    const totalPaid = filteredWallets.reduce((s, w) => s + (w.totalPaid || 0), 0);

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await affiliateService.updateWalletConfig(config);
            alert('Settings updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update configuration');
        } finally {
            setSavingConfig(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
                <div className="text-center text-muted">
                    <Loader size={40} className="spin mb-3" />
                    <p>Loading wallet data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Wallet className="text-primary" /> Wallet Management
                    </h2>
                    <p className="text-muted mb-0">Financial oversight for both Partners and Student Ambassadors</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-premium-primary btn-sm px-4 shadow-sm" style={{ borderRadius: '12px' }} onClick={loadData}>
                        <RefreshCw size={16} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="nav nav-pills gap-2 mb-4 bg-white p-2 rounded-4 shadow-sm d-inline-flex border">
                <button 
                    className={`nav-link px-4 rounded-pill fw-bold ${activeTab === 'STUDENT' ? 'active shadow-sm' : 'text-muted'}`}
                    onClick={() => setActiveTab('STUDENT')}
                >
                    🎓 Student Wallets <span className="badge bg-light text-dark ms-2">{students.length}</span>
                </button>
                <button 
                    className={`nav-link px-4 rounded-pill fw-bold ${activeTab === 'PARTNER' ? 'active shadow-sm' : 'text-muted'}`}
                    onClick={() => setActiveTab('PARTNER')}
                >
                    💼 Partner Wallets <span className="badge bg-light text-dark ms-2">{partners.length}</span>
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={Users} label={`Total ${activeTab === 'STUDENT' ? 'Students' : 'Partners'}`} value={filteredWallets.length} color="#6366f1" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={Wallet} label="Net Balance (Unpaid)" value={totalBalance} color="#0d6efd" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={TrendingUp} label="Total Earned" value={totalEarned} color="#198754" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={DollarSign} label="Successfully Paid" value={totalPaid} color="#fd7e14" />
                </div>
            </div>

            {/* ── Wallets Table ── */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-header bg-white py-3 border-0">
                    <h5 className="mb-0 fw-bold">{activeTab === 'STUDENT' ? 'Student Ambassador' : 'Business Partner'} Wallets</h5>
                </div>
                <div className="card-body p-0">
                    {filteredWallets.length === 0 ? (
                        <div className="text-center py-5 text-muted bg-light m-3 rounded-4 border border-dashed">
                            <Wallet size={48} className="mb-3 opacity-25" />
                            <p className="fw-medium">No {activeTab.toLowerCase()} wallets found in the system.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="table-light text-uppercase" style={{ fontSize: 11, letterSpacing: '0.5px' }}>
                                    <tr>
                                        <th className="ps-4 py-3 text-muted">Beneficiary</th>
                                        <th className="py-3 text-muted">Current Balance</th>
                                        <th className="py-3 text-muted">Lifetime Earnings</th>
                                        <th className="py-3 text-muted">Total Paid Out</th>
                                        <th className="py-3 text-muted">Last Activity</th>
                                        <th className="py-3 text-muted text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWallets.map((w) => (
                                        <AffiliateWalletRow
                                            key={w.affiliateId || w.id}
                                            wallet={w}
                                            affiliates={affiliates}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Global Settings ── */}
            <div className="card shadow-sm border-0 mt-4 bg-dark text-white" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <ArrowDownCircle size={20} className="text-primary" /> Wallet & Payout Configuration
                    </h5>
                    <div className="row align-items-end g-3">
                        <div className="col-md-4">
                            <label className="form-label small text-white-50 text-uppercase fw-bold">Default Student Min Payout (₹)</label>
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-secondary border-0 text-white">₹</span>
                                <input
                                    type="number"
                                    className="form-control bg-secondary text-white border-0"
                                    value={config.minPayout}
                                    onChange={(e) => setConfig({ ...config, minPayout: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-premium-primary btn-lg w-100 fw-bold"
                                style={{ borderRadius: '12px' }}
                                onClick={handleSaveConfig}
                                disabled={savingConfig}
                            >
                                {savingConfig ? <Loader size={18} className="me-2 spin" /> : 'Apply Config'}
                            </button>
                        </div>
                        <div className="col-md-6">
                            <div className="p-3 rounded-3 bg-white bg-opacity-10 small">
                                <AlertCircle size={14} className="me-2 text-warning" />
                                These settings define the default thresholds when students join the program automatically. Existing wallets are not affected.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spin animation */}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
    );
};

export default WalletSettings;
