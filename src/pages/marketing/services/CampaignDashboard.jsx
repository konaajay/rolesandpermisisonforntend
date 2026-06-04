import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmailCampaigns, deleteEmailCampaign } from './api';
import {
    LuSearch as Search,
    LuPlus as Plus,
    LuChevronDown as ChevronDown,
    LuMail as Mail,
    LuMessageSquare as MessageSquare,
    LuEllipsis as MoreHorizontal,
    LuChartBar as BarChart2,
    LuChevronLeft as ChevronLeft,
    LuChevronRight as ChevronRight,
    LuTrash2 as Trash2,
    LuRefreshCw as RefreshCw,
    LuArrowLeft as ArrowLeft,
    LuMegaphone as Megaphone
} from 'react-icons/lu';
import "../Dashboard.css";

/**
 * Campaign Super Dashboard
 * Production Ready - Clean Cut JSX
 */
const CampaignDashboard = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Email');
    const [isCreating, setIsCreating] = useState(false);
    const [creationData, setCreationData] = useState({
        name: '',
        channel: 'Email',
        type: 'Broadcast'
    });
    const [statusFilter, setStatusFilter] = useState('Status');
    const [typeFilter, setTypeFilter] = useState('Type');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await getEmailCampaigns();
            setCampaigns(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Failed to load campaigns", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this campaign?")) {
            try {
                await deleteEmailCampaign(id);
                setCampaigns(campaigns.filter(c => c.id !== id));
            } catch (err) {
                alert("Failed to delete campaign");
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content-wrapper">
                {/* Header Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Campaign Overview</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="secondary-action-btn" onClick={loadCampaigns} disabled={loading}>
                            <RefreshCw size={18} className={loading ? 'spin' : ''} />
                            {loading ? 'Refreshing...' : 'Refresh List'}
                        </button>
                        <button className="create-btn" onClick={() => setIsCreating(true)}>
                            <Plus size={20} />
                            Create Campaign
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tabs-container">
                    <div className={`tab-item ${activeTab === 'Email' ? 'active' : ''}`} onClick={() => setActiveTab('Email')}>
                        <Mail size={18} /> Email
                    </div>
                    <div className={`tab-item ${activeTab === 'Whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('Whatsapp')}>
                        <MessageSquare size={18} /> Whatsapp
                    </div>
                </div>

                {/* Content Card */}
                <div className="content-card">
                    <div className="search-filter-section">
                        <div className="search-box-wrapper">
                            <Search className="search-icon" size={20} />
                            <input type="text" className="search-input" placeholder="Search by campaign name" />
                        </div>

                        <div className="filter-row">
                            <span className="filter-label">Filter by:</span>
                            <div className="filter-dropdown-container">
                                <button className="filter-pill" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
                                    {statusFilter} <ChevronDown size={14} />
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {['Draft', 'Completed', 'Running', 'Paused'].map(s => (
                                            <button key={s} className="dropdown-item" onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }}>{s}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="filter-dropdown-container">
                                <button className="filter-pill" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                                    {typeFilter} <ChevronDown size={14} />
                                </button>
                                {isTypeDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {['Broadcast', 'Trigger-Based'].map(t => (
                                            <button key={t} className="dropdown-item" onClick={() => { setTypeFilter(t); setIsTypeDropdownOpen(false); }}>{t}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="count-badge">{campaigns.length} campaign(s) found</div>

                    <div className="campaign-table-container">
                        {loading ? (
                            <div className="p-5 text-center"><div className="spinner-border"></div></div>
                        ) : (
                            <table className="campaign-table">
                                <thead>
                                    <tr>
                                        <th>Campaign Name</th>
                                        <th>Date</th>
                                        <th>Stats (Del/Open/Clk)</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map(camp => (
                                        <tr key={camp.id}>
                                            <td>
                                                <div className="campaign-info">
                                                    <div className="icon-wrapper"><Mail size={20} /></div>
                                                    <div>
                                                        <div className="campaign-name">{camp.campaignName || camp.title || camp.name}</div>
                                                        <div className="campaign-type text-muted small">{camp.campaignType || 'Email Broadcast'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{new Date(camp.createdAt || Date.now()).toLocaleDateString()}</td>
                                            <td>{camp.delivered || 0} / {camp.opens || 0} / {camp.clicks || 0}</td>
                                            <td><span className={`status-badge ${(camp.status || 'DRAFT').toLowerCase()}`}>{camp.status || 'DRAFT'}</span></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/marketing/campaigns?id=${camp.id || camp.campaignId}`)}>Edit</button>
                                                    <button className="btn btn-sm text-danger" onClick={() => handleDelete(camp.id || camp.campaignId)}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {campaigns.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-5">No campaigns found. Start by creating one!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaign Creator View */}
            {isCreating && (
                <div className="modal-overlay campaign-creator-overlay">
                    <div className="creator-container shadow-lg border-0 rounded-4">
                        <div className="creator-header border-bottom p-4 d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0">Create Campaign</h4>
                            <button className="btn-close" onClick={() => setIsCreating(false)}></button>
                        </div>

                        <div className="creator-body p-4">
                            {/* Name Section */}
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-uppercase">Campaign Name</label>
                                <p className="text-muted small mb-3">Internal title for reports, not shown to recipients.</p>
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-2"
                                    placeholder="Enter campaign name..."
                                    value={creationData.name}
                                    onChange={(e) => setCreationData({ ...creationData, name: e.target.value })}
                                />
                            </div>

                            <div className="row g-4">
                                {/* Channel Section */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-uppercase mb-3">Delivery Channel</label>
                                    <div className="d-flex flex-column gap-2">
                                        <div
                                            className={`selectable-card ${creationData.channel === 'WhatsApp' ? 'active shadow-sm' : ''}`}
                                            onClick={() => setCreationData({ ...creationData, channel: 'WhatsApp' })}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="icon-box me-3"><MessageSquare size={18} /></div>
                                                <div className="fw-bold fs-6">WhatsApp</div>
                                            </div>
                                        </div>
                                        <div
                                            className={`selectable-card ${creationData.channel === 'Email' ? 'active shadow-sm' : ''}`}
                                            onClick={() => setCreationData({ ...creationData, channel: 'Email' })}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="icon-box me-3"><Mail size={18} /></div>
                                                <div className="fw-bold fs-6">Email</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Type Section */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-uppercase mb-3">Campaign Type</label>
                                    <div className="d-flex flex-column gap-2">
                                        <div
                                            className={`selectable-card ${creationData.type === 'Broadcast' ? 'active shadow-sm' : ''}`}
                                            onClick={() => setCreationData({ ...creationData, type: 'Broadcast' })}
                                        >
                                            <div className="d-flex align-items-center mb-1">
                                                <div className="icon-box me-3"><Megaphone size={18} /></div>
                                                <div className="fw-bold fs-6">Broadcast</div>
                                            </div>
                                            <p className="small text-muted mb-0 ms-5">One-time blast to a list.</p>
                                        </div>
                                        <div
                                            className={`selectable-card ${creationData.type === 'Trigger-Based' ? 'active shadow-sm' : ''}`}
                                            onClick={() => setCreationData({ ...creationData, type: 'Trigger-Based' })}
                                        >
                                            <div className="d-flex align-items-center mb-1">
                                                <div className="icon-box me-3"><RefreshCw size={18} /></div>
                                                <div className="fw-bold fs-6">Triggered</div>
                                            </div>
                                            <p className="small text-muted mb-0 ms-5">Automated event flows.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="creator-footer p-4 border-top bg-light rounded-bottom-4 d-flex justify-content-end gap-3">
                            <button className="btn btn-light px-4" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button
                                className="btn btn-primary px-5 fw-bold"
                                disabled={!creationData.name}
                                onClick={() => {
                                    if (creationData.channel === 'Email') {
                                        navigate(`/admin/marketing/campaigns?name=${encodeURIComponent(creationData.name)}&type=${creationData.type}`);
                                    } else {
                                        alert("WhatsApp campaigns coming soon!");
                                    }
                                }}
                            >
                                Continue to Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignDashboard;
