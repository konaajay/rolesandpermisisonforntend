import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../services/api';

export default function Analytics() {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnalyticsSummary()
            .then(res => {
                setSummary(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    const totalCampaigns = summary.length;
    const totalSpend = summary.reduce((sum, c) => sum + c.totalCost, 0);
    const totalClicks = summary.reduce((sum, c) => sum + c.totalClicks, 0);
    const totalConversions = summary.reduce((sum, c) => sum + c.totalConversions, 0);

    return (
        <div>
            <h2>Dashboard overview</h2>
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary mb-3 shadow-sm border-0 rounded-3">
                        <div className="card-body">
                            <h5 className="card-title">Total Campaigns</h5>
                            <p className="card-text fs-2 fw-bold">{totalCampaigns}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success mb-3 shadow-sm border-0 rounded-3">
                        <div className="card-body">
                            <h5 className="card-title">Total Conversions</h5>
                            <p className="card-text fs-2 fw-bold">{totalConversions}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning mb-3 shadow-sm border-0 rounded-3">
                        <div className="card-body">
                            <h5 className="card-title">Total Clicks</h5>
                            <p className="card-text fs-2 fw-bold">{totalClicks}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-danger mb-3 shadow-sm border-0 rounded-3">
                        <div className="card-body">
                            <h5 className="card-title">Total Spend</h5>
                            <p className="card-text fs-2 fw-bold">₹{(Number(totalSpend) || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h4 className="mt-5">Performance by Campaign</h4>
            <div className="table-responsive">
                <table className="table table-hover table-bordered mt-3 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Campaign Name</th>
                            <th>Status</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>Conversions</th>
                            <th>CTR</th>
                            <th>Spend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(summary) && summary.map(c => (
                            <tr key={c.campaignId}>
                                <td className="fw-semibold">{c.campaignName}</td>
                                <td>
                                    <span className={`badge ${c.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>{c.totalImpressions}</td>
                                <td>{c.totalClicks}</td>
                                <td>{c.totalConversions}</td>
                                <td>{(Number(c.conversionRate) || 0).toFixed(2)}%</td>
                                <td>₹{(Number(c.totalCost) || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                        {summary.length === 0 && (
                            <tr><td colSpan="7" className="text-center text-muted py-4">No data available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
