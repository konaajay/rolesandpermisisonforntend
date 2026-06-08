import React, { useState, useEffect } from 'react';
import { LuMegaphone, LuPlus, LuChartBar, LuLayoutTemplate, LuRefreshCw, LuSearch, LuFilter } from 'react-icons/lu';
import { getEmailCampaigns, createEmailCampaign } from '../../../services/api';
import CampaignBuilder from './CampaignBuilder';
import { usePermissions } from '../../../../../auth/usePermissions';

export default function UniversalCampaignManager() {
    const { hasPermission } = usePermissions();
    const [view, setView] = useState('LIST'); // LIST, BUILDER, ANALYTICS, TEMPLATES
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ moduleType: 'ALL', status: 'ALL' });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getEmailCampaigns();
            setCampaigns(Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []));
        } catch (e) {
            console.error('Failed to load campaigns:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveCampaign = async (payload) => {
        try {
            await createEmailCampaign(payload);
            setView('LIST');
            loadData();
        } catch (e) {
            alert('Failed to save campaign: ' + (e.response?.data?.message || e.message));
        }
    };

    const renderList = () => {
        const filtered = campaigns.filter(c => {
            const modType = c.moduleType || 'CRM';
            if (filters.moduleType !== 'ALL' && modType !== filters.moduleType) return false;
            
            const stat = c.status || c.emailCampaignStatus || 'DRAFT';
            if (filters.status !== 'ALL' && stat !== filters.status) return false;
            
            return true;
        });

        return (
            <div className="card shadow-sm border-0 animate-in">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                    <div className="d-flex gap-3 align-items-center">
                        <div className="input-group input-group-sm" style={{ width: '250px' }}>
                            <span className="input-group-text bg-light border-end-0"><LuSearch /></span>
                            <input type="text" className="form-control bg-light border-start-0" placeholder="Search campaigns..." />
                        </div>
                        <select className="form-select form-select-sm w-auto" value={filters.moduleType} onChange={e => setFilters({...filters, moduleType: e.target.value})}>
                            <option value="ALL">All Modules</option>
                            <option value="CRM">CRM</option>
                            <option value="HRMS">HRMS</option>
                            <option value="LMS">LMS</option>

                        </select>
                        <select className="form-select form-select-sm w-auto" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="DRAFT">Draft</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4">Campaign Name</th>
                                <th>Target</th>
                                <th>Channel</th>
                                <th>Status</th>
                                <th>Performance</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No campaigns found.</td></tr>
                            ) : filtered.map(c => (
                                <tr key={c.campaignId || c.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{c.campaignName || c.title || 'Untitled'}</div>
                                        <small className="text-muted">{c.subject}</small>
                                    </td>
                                    <td>
                                        <span className="badge bg-dark me-1">{c.moduleType || 'CRM'}</span>
                                        <span className="badge bg-secondary">{c.audienceSource || 'Custom'}</span>
                                    </td>
                                    <td>{c.channel || 'EMAIL'}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${
                                            (c.status || c.emailCampaignStatus) === 'COMPLETED' ? 'bg-success' :
                                            (c.status || c.emailCampaignStatus) === 'ACTIVE' ? 'bg-primary' : 'bg-secondary'
                                        }`}>
                                            {c.status || c.emailCampaignStatus || 'DRAFT'}
                                        </span>
                                    </td>
                                    <td className="small">
                                        <div>Sent: {c.sentCount || 0}</div>
                                        <div className="text-muted">Failed: {c.failedCount || 0}</div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-light">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-end align-items-center mb-4">
                <div className="d-flex gap-2">
                    {view === 'LIST' && (
                        <>
                            <button className="btn btn-outline-secondary" onClick={loadData}><LuRefreshCw className="me-2"/>Sync</button>
                            {hasPermission('MARKETING_CREATE') && (
                                <button className="btn btn-primary shadow-sm" onClick={() => setView('BUILDER')}><LuPlus className="me-2"/>New Campaign</button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {view === 'LIST' && renderList()}
            {view === 'BUILDER' && <CampaignBuilder onSave={handleSaveCampaign} onCancel={() => setView('LIST')} />}
        </div>
    );
}
