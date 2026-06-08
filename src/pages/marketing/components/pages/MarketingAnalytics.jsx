import React, { useState, useEffect } from 'react';
import { getSourceStats, getFunnelStats, getConversionRate, getCampaignStats, getMediumStats } from '../../services/api';
import {
    TrendingDown,
    Activity,
    Shield,
    Info,
    Users,
    Filter
} from "lucide-react";

const MarketingAnalytics = () => {
    const [sourceStats, setSourceStats] = useState({});
    const [campaignStats, setCampaignStats] = useState({});
    const [mediumStats, setMediumStats] = useState({});
    const [funnelStats, setFunnelStats] = useState({});
    const [conversionRate, setConversionRate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [moduleType, setModuleType] = useState('ALL');

    useEffect(() => {
        fetchStats(moduleType);
    }, [moduleType]);

    const fetchStats = async (modType) => {
        setLoading(true);
        try {
            // If the backend doesn't support the moduleType query param yet, we can pass it anyway
            // const params = modType === 'ALL' ? {} : { moduleType: modType };
            // For now, we will just call the existing endpoints and assume they will support query params later
            const [sources, campaigns, mediums, funnel, rate] = await Promise.all([
                getSourceStats(),
                getCampaignStats(),
                getMediumStats(),
                getFunnelStats(),
                getConversionRate()
            ]);
            setSourceStats(sources || {});
            setCampaignStats(campaigns || {});
            setMediumStats(mediums || {});
            setFunnelStats(funnel || {});
            setConversionRate(rate || 0);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
            setLoading(false);
        }
    };

    const totalClicks = (funnelStats.CLICK || 0) + (funnelStats.PAGE_VIEW || 0);
    const totalLeads = funnelStats.SIGNUP || 0;
    const totalConversions = funnelStats.PURCHASE || 0;
    const totalCampaigns = Object.values(campaignStats).reduce((a, b) => a + b, 0);

    return (
        <div className="container-fluid py-4" style={{ background: '#f8fafc' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="d-flex align-items-center fw-bold text-dark mb-0">
                    <Shield className="text-primary me-2" size={24} />
                    System Health & Risk Matrix
                </h5>
                <div className="d-flex align-items-center">
                    <Filter className="text-muted me-2" size={18} />
                    <select 
                        className="form-select border-0 shadow-sm rounded-pill px-4" 
                        value={moduleType} 
                        onChange={(e) => setModuleType(e.target.value)}
                        style={{ minWidth: '180px', fontWeight: '500' }}
                    >
                        <option value="ALL">All Modules</option>
                        <option value="CRM">CRM</option>
                        <option value="HRMS">HRMS</option>

                        <option value="LMS">LMS</option>
                        <option value="VENDOR">Vendor</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row g-4 mb-5">
                        <div className="col-md-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4">
                                <div className="card-body p-4 text-center">
                                    <div className="text-muted small fw-bold text-uppercase mb-2">Total Campaigns</div>
                                    <h3 className="fw-bold text-dark mb-1">{totalCampaigns}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                                <div className="card-body p-4 text-center">
                                    <div className="text-primary small fw-bold text-uppercase mb-2">Total Leads</div>
                                    <h3 className="fw-bold text-primary mb-1">{totalLeads}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25">
                                <div className="card-body p-4 text-center">
                                    <div className="text-success small fw-bold text-uppercase mb-2">Total Clicks</div>
                                    <h3 className="fw-bold text-success mb-1">{totalClicks}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-25">
                                <div className="card-body p-4 text-center">
                                    <div className="text-info small fw-bold text-uppercase mb-2">Conversion Rate</div>
                                    <h3 className="fw-bold text-info mb-1">{conversionRate.toFixed(1)}%</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* CSS Bar Chart Replacement for Trend */}
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-body p-4">
                                    <h6 className="card-title fw-bold mb-4">Performance Trend ({moduleType === 'ALL' ? 'Global' : moduleType})</h6>
                                    <div className="d-flex align-items-end justify-content-between" style={{ height: 300, paddingBottom: 40 }}>
                                        {Object.entries(campaignStats).length > 0 ? Object.entries(campaignStats).map(([name, count]) => (
                                            <div key={name} className="flex-grow-1 text-center d-flex flex-column align-items-center">
                                                <div className="d-flex gap-1 align-items-end" style={{ height: 200, width: '60%' }}>
                                                    <div className="bg-primary opacity-75 rounded-top" style={{ height: `${Math.min((count / 100) * 100, 100)}%`, width: '100%' }}></div>
                                                </div>
                                                <div className="mt-2 small text-muted text-truncate" style={{ maxWidth: '80px' }}>{name}</div>
                                            </div>
                                        )) : (
                                            <div className="text-center w-100 text-muted py-5">No campaign performance data available</div>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-center gap-4 mt-3">
                                        <div className="d-flex align-items-center small text-muted">
                                            <div className="rounded-circle me-2" style={{ width: 8, height: 8, background: '#0d6efd' }}></div> Hits/Conversions
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Funnel Efficiency Replacement */}
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-body p-4">
                                    <h6 className="card-title fw-bold mb-4">Funnel Efficiency</h6>
                                    <div className="d-flex flex-column gap-3">
                                        {[
                                            { name: 'Site Visits', val: funnelStats.PAGE_VIEW || 0, color: '#0d6efd' },
                                            { name: 'Clicks', val: funnelStats.CLICK || 0, color: '#6610f2' },
                                            { name: 'Signups', val: funnelStats.SIGNUP || 0, color: '#6f42c1' },
                                            { name: 'Purchased', val: funnelStats.PURCHASE || 0, color: '#198754' }
                                        ].map((item, idx, arr) => {
                                            const max = arr[0].val || 1;
                                            const pct = (item.val / max) * 100;
                                            return (
                                                <div key={item.name} className="mb-2">
                                                    <div className="d-flex justify-content-between mb-1 small fw-bold">
                                                        <span>{item.name}</span>
                                                        <span>{item.val}</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '30px', borderRadius: '4px' }}>
                                                        <div className="progress-bar" style={{ width: `${pct}%`, background: item.color, transition: 'width 1s ease' }}>
                                                            {pct > 15 && `${pct.toFixed(0)}%`}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketingAnalytics;
