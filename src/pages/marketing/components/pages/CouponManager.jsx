import React, { useState, useEffect } from 'react';
import { getCoupons, createCoupon } from '../services/api';

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minPurchaseAmount: 0,
        maxUsage: 100,
        courseIds: []
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await getCoupons();
            setCoupons(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch coupons', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCoupon(newCoupon);
            setMessage('Coupon created successfully!');
            setNewCoupon({
                code: '',
                discountType: 'PERCENT',
                discountValue: 0,
                minPurchaseAmount: 0,
                maxUsage: 100,
                courseIds: []
            });
            fetchCoupons();
        } catch (err) {
            setMessage('Error creating coupon');
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Create New Coupon</h5>
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="form-label">Coupon Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                        placeholder="JAVA50"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                    >
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Min Purchase (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newCoupon.minPurchaseAmount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, minPurchaseAmount: e.target.value })}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-premium-primary w-100 py-2 fw-bold shadow-sm mt-3" 
                                    style={{ borderRadius: '12px' }}
                                >
                                    Create Coupon
                                </button>
                                {message && <p className="mt-2 small text-info">{message}</p>}
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="card-title fw-bold mb-4 text-dark d-flex align-items-center justify-content-between">
                                Active Promo Codes
                                <span className="badge bg-primary bg-opacity-10 text-primary fw-normal small px-3">
                                    {coupons.length} Active
                                </span>
                            </h5>
                            <div className="table-responsive rounded-3 border">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase fw-bold text-muted">
                                            <th className="ps-4">Code</th>
                                            <th>Discount</th>
                                            <th>Usage</th>
                                            <th className="pe-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(coupons) && coupons.map((c) => (
                                            <tr key={c.id}>
                                                <td><span className="badge bg-light text-primary border">{c.code}</span></td>
                                                <td>{c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                                <td>{c.usedCount} / {c.maxUsage || '∞'}</td>
                                                <td>
                                                    <span className={`badge bg-${c.status === 'ACTIVE' ? 'success' : 'secondary'} rounded-pill`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponManager;
