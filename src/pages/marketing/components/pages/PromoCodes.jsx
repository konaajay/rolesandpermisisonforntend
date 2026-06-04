import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LuPlus, LuTicket, LuPencil, LuTrash2, LuArchive, LuPause, LuPlay } from 'react-icons/lu';

const api = axios.create({ 
    baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/marketing/admin/coupons' 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            const tenant = parsed.tenant || parsed.tenantDb;
            if (tenant) {
                config.headers["X-Tenant-DB"] = tenant;
            }
        } catch (e) {}
    }
    return config;
});
export default function PromoCodes() {
    const [coupons, setCoupons] = useState([]);
    const [viewTab, setViewTab] = useState('ACTIVE'); // ACTIVE, EXPIRED, ALL
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialForm = {
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        discountCap: '',
        minPurchaseAmount: 0,
        maxUsage: 100,
        isFirstOrderOnly: false,
        autoApply: false,
        learnerId: '',
        affiliateId: '',
        courseIds: [],
        expiryDate: ''
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await api.get('');
            setCoupons(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch coupons', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                discountCap: formData.discountCap ? parseFloat(formData.discountCap) : null
            };

            if (editingId) {
                alert('Updating full details is not currently supported by backend. Please pause and create a new coupon.');
            } else {
                await api.post('', payload);
                alert('Promo code launched successfully!');
            }
            
            resetForm();
            fetchCoupons();
        } catch (err) {
            alert('Error saving promo code');
        }
        setSaving(false);
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            code: c.code || '',
            discountType: c.discountType || 'PERCENT',
            discountValue: c.discountValue || 0,
            discountCap: c.discountCap || '',
            minPurchaseAmount: c.minPurchaseAmount || 0,
            maxUsage: c.maxUsage || 100,
            isFirstOrderOnly: c.firstOrderOnly || false,
            autoApply: c.autoApply || false,
            learnerId: c.learnerId || '',
            affiliateId: c.affiliateId || '',
            courseIds: c.courseIds || [],
            expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.patch(`/${id}/status?status=${nextStatus}`);
            fetchCoupons();
        } catch (err) {
            alert('Status update failed');
        }
    };

    const handleSoftDelete = async (id) => {
        if (window.confirm('Are you sure you want to archive (soft delete) this promo code? It will no longer be usable by customers.')) {
            try {
                await api.delete(`/${id}`);
                fetchCoupons();
            } catch (err) {
                alert('Archive failed');
            }
        }
    };

    const handleHardDelete = async (id) => {
        if (window.confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY delete this promo code from the database? This action cannot be undone.')) {
            try {
                await api.delete(`/${id}/hard`);
                fetchCoupons();
            } catch (err) {
                alert('Permanent delete failed');
            }
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    const filteredCoupons = coupons.filter(c => {
        if (viewTab === 'ALL') return true;
        return c.status === viewTab;
    });

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Promo Codes</h2>
                    <p className="text-muted small">Orchestrate discounts with precision: Edit, Pause, and Manage lifecycles.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center" onClick={() => setShowForm(true)}>
                        <LuPlus className="me-2" /> Create New Code
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card shadow-sm border-0 mb-4 animate__animated animate__fadeIn border-top border-4 border-primary">
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold text-primary">{editingId ? `Editing Code: ${formData.code}` : 'Configure New Promotion'}</h5>
                        <button className="btn-close" onClick={resetForm}></button>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Coupon Code *</label>
                                    <input type="text" className="form-control form-control-lg fw-bold text-uppercase border-2" name="code" value={formData.code} onChange={handleChange} placeholder="SUMMER50" required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Discount Type</label>
                                    <select className="form-select form-select-lg" name="discountType" value={formData.discountType} onChange={handleChange}>
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Discount Value *</label>
                                    <input type="number" className="form-control form-control-lg border-2" name="discountValue" value={formData.discountValue} onChange={handleChange} required />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Valid Until</label>
                                    <input type="date" className="form-control" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Min Purchase Amount (₹)</label>
                                    <input type="number" className="form-control" name="minPurchaseAmount" value={formData.minPurchaseAmount} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Max Usage (Global)</label>
                                    <input type="number" className="form-control" name="maxUsage" value={formData.maxUsage} onChange={handleChange} />
                                </div>

                                <div className="col-12 border-top pt-3">
                                    <div className="d-flex gap-4">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="firstOrder" name="isFirstOrderOnly" checked={formData.isFirstOrderOnly} onChange={handleChange} />
                                            <label className="form-check-label fw-bold small" htmlFor="firstOrder">New Users Only</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="autoApply" name="autoApply" checked={formData.autoApply} onChange={handleChange} />
                                            <label className="form-check-label fw-bold small" htmlFor="autoApply">Auto-Apply on Checkout</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 text-end border-top pt-4">
                                <button type="button" className="btn btn-light px-4 me-2 fw-bold" onClick={resetForm}>Discard</button>
                                <button type="submit" className="btn btn-success px-5 fw-bold shadow-sm" disabled={saving}>
                                    {saving ? 'Processing...' : (editingId ? 'Save Changes' : 'Launch Promo Code')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!showForm && (
                <div className="card shadow-sm border-0 overflow-hidden">
                    <div className="card-header bg-white p-0 border-bottom">
                        <ul className="nav nav-tabs border-0">
                            {['ACTIVE', 'INACTIVE', 'EXPIRED', 'DELETED', 'ALL'].map(tab => (
                                <li className="nav-item" key={tab}>
                                    <button className={`nav-link border-0 px-4 py-3 fw-bold transition-all ${viewTab === tab ? 'active text-primary border-bottom border-primary border-3' : 'text-muted opacity-75'}`} onClick={() => setViewTab(tab)}>
                                        {tab}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="text-muted small mt-2">Syncing promo data...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase text-secondary">
                                            <th className="ps-4">Promo Code</th>
                                            <th>Value</th>
                                            <th>Requirements</th>
                                            <th>Usage Status</th>
                                            <th>Visibility</th>
                                            <th>Status</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCoupons.map(c => (
                                            <tr key={c.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold fs-6 text-dark">{c.code}</div>
                                                    <div className="text-muted smallest">ID: <code>#{c.id}</code></div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-success">
                                                        {c.discountType === 'PERCENT' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                                                    </div>
                                                    {c.discountCap && <div className="text-muted smaller">Cap: ₹{c.discountCap}</div>}
                                                </td>
                                                <td>
                                                    <div className="smaller">Min: ₹{c.minPurchaseAmount}</div>
                                                    {c.expiryDate && <div className="smallest text-danger">Until: {new Date(c.expiryDate).toLocaleDateString()}</div>}
                                                </td>
                                                <td>
                                                    <div className="progress mb-1" style={{ height: '5px', width: '80px' }}>
                                                        <div className="progress-bar bg-info" style={{ width: `${(c.usedCount / (c.maxUsage || 1)) * 100}%` }}></div>
                                                    </div>
                                                    <div className="smallest text-muted">{c.usedCount} / {c.maxUsage || '∞'}</div>
                                                </td>
                                                <td>
                                                    {c.isFirstOrderOnly && <span className="badge bg-info-subtle text-info me-1">New</span>}
                                                    {c.autoApply && <span className="badge bg-warning-subtle text-warning">Auto</span>}
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill px-3 py-2 border ${c.status === 'ACTIVE' ? 'bg-success bg-opacity-10 text-success border-success' : c.status === 'DELETED' ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="btn-group shadow-sm">
                                                        <button className="btn btn-sm btn-light border" onClick={() => handleEdit(c)} title="Edit Configuration">
                                                            <LuPencil className="text-primary" />
                                                        </button>
                                                        <button 
                                                            className={`btn btn-sm btn-light border ${c.status === 'ACTIVE' ? '' : 'bg-warning-subtle'}`} 
                                                            onClick={() => handleStatusUpdate(c.id, c.status)} 
                                                            title={c.status === 'ACTIVE' ? 'Pause Promotion' : 'Resume Promotion'}
                                                        >
                                                            {c.status === 'ACTIVE' ? <LuPause className="text-warning" /> : <LuPlay className="text-success" />}
                                                        </button>
                                                        <button className="btn btn-sm btn-light border" onClick={() => handleSoftDelete(c.id)} title="Archive (Soft Delete)">
                                                            <LuArchive className="text-danger" />
                                                        </button>
                                                        <button className="btn btn-sm btn-light border" onClick={() => handleHardDelete(c.id)} title="Permanent Delete (CRITICAL)">
                                                            <LuTrash2 className="text-danger" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCoupons.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5 text-muted">
                                                    <LuTicket size={48} className="opacity-25 d-block mx-auto mb-3" />
                                                    No results found for this selection.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
