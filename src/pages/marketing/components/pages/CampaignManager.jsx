import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEmailCampaigns, createEmailCampaign, updateEmailCampaign, deleteEmailCampaign, importCsv, getLeads, getTrackedLinks, deleteTrackedLink } from '../../services/api';
import {
    LuChevronRight,
    LuPalette,
    LuFileSpreadsheet,
    LuRocket,
    LuRefreshCw,
    LuMessageCircle,
    LuMail,
    LuTrash,
    LuWand,
    LuChevronLeft,
    LuClock,
    LuTarget,
    LuUsers,
    LuZap,
    LuLink,
    LuExternalLink,
    LuCheck,
    LuX
} from 'react-icons/lu';

export default function CampaignManager() {
    const [searchParams] = useSearchParams();
    const [campaigns, setCampaigns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [trackedLinks, setTrackedLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        campaignId: null,
        campaignName: '',
        subject: '',
        content: '',
        channel: 'EMAIL',
        campaignType: 'BROADCAST',
        targetAudience: 'ALL_LEARNERS',
        triggerCondition: 'ON_SIGNUP',
        fromName: 'Administrator',
        fromEmail: 'noreply@yourdomain.com',
        replyTo: 'support@yourdomain.com',
        status: 'DRAFT',
        startDate: '',
        endDate: '',
        budget: '0.00',
        audienceFilters: '',
        description: '',
        manualEmails: '',
        selectedLeadIds: [],
        scheduledAt: '',
        sendMode: 'NOW'
    });
    const [csvFile, setCsvFile] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch individually to prevent one failure from blocking others
            try {
                const campRes = await getEmailCampaigns();
                setCampaigns(Array.isArray(campRes) ? campRes : (Array.isArray(campRes.data) ? campRes.data : []));
            } catch (e) { console.error('Failed to load campaigns:', e); }

            try {
                const leadRes = await getLeads();
                setLeads(Array.isArray(leadRes) ? leadRes : (Array.isArray(leadRes.data) ? leadRes.data : []));
            } catch (e) { console.error('Failed to load leads:', e); }

            try {
                const linkRes = await getTrackedLinks();
                console.log('Tracked Links Data:', linkRes);
                setTrackedLinks(Array.isArray(linkRes) ? linkRes : (Array.isArray(linkRes.data) ? linkRes.data : []));
            } catch (e) { console.error('Failed to load tracked links:', e); }

        } catch (err) {
            console.error('Fatal data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadData();
        const nameParam = searchParams.get('name');
        const typeParam = searchParams.get('type');
        if (nameParam || typeParam) {
            setFormData(prev => ({
                ...prev,
                campaignName: nameParam || prev.campaignName,
                campaignType: typeParam?.toUpperCase() || prev.campaignType
            }));
        }
    }, [searchParams]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setCsvFile(e.target.files[0]);
    
    const handleEdit = (c) => {
        setFormData({
            campaignId: c.campaignId || c.id,
            campaignName: c.campaignName || c.title || '',
            subject: c.subject || '',
            content: c.content || '',
            channel: c.channel || 'EMAIL',
            campaignType: c.campaignType || 'BROADCAST',
            targetAudience: c.targetAudience || 'ALL_LEARNERS',
            triggerCondition: c.triggerCondition || 'ON_SIGNUP',
            fromName: c.fromName || 'Administrator',
            fromEmail: c.fromEmail || 'noreply@yourdomain.com',
            replyTo: c.replyTo || 'support@yourdomain.com',
            status: c.status || 'DRAFT',
            startDate: c.startDate ? String(c.startDate).split('T')[0] : '',
            endDate: c.endDate ? String(c.endDate).split('T')[0] : '',
            budget: c.budget || '0.00',
            audienceFilters: c.audienceFilters || '',
            description: c.description || '',
            manualEmails: '',
            selectedLeadIds: [],
            scheduledAt: c.scheduledAt || '',
            sendMode: c.scheduledAt ? 'SCHEDULED' : 'NOW'
        });
        setStep(1);
    };

    const toggleLeadSelection = (id) => {
        const current = formData.selectedLeadIds;
        const updated = current.includes(id) 
            ? current.filter(item => item !== id)
            : [...current, id];
        setFormData({ ...formData, selectedLeadIds: updated });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            const manualList = formData.manualEmails 
                ? formData.manualEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e && e.includes('@'))
                : [];
            const leadEmails = leads
                .filter(l => formData.selectedLeadIds.includes(l.id))
                .map(l => l.email);
            const allRecipients = [...new Set([...manualList, ...leadEmails])];
            const payload = {
                campaignName: formData.campaignName,
                subject: formData.subject,
                campaignType: formData.campaignType,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                budget: formData.budget || '0.00',
                description: formData.description,
                channel: formData.channel,
                targetAudience: formData.targetAudience,
                audienceFilters: formData.audienceFilters,
                content: formData.content,
                fromName: formData.fromName,
                fromEmail: formData.fromEmail,
                replyTo: formData.replyTo,
                triggerCondition: formData.triggerCondition,
                status: formData.sendMode === 'SCHEDULED' ? 'SCHEDULED' : 'ACTIVE',
                scheduledAt: formData.sendMode === 'SCHEDULED' ? formData.scheduledAt : null,
                recipients: allRecipients
            };
            let res;
            if (formData.campaignId) {
                res = await updateEmailCampaign(formData.campaignId, payload);
            } else {
                res = await createEmailCampaign(payload);
            }
            const campaignId = res.campaignId || res.id || res.data?.campaignId || res.data?.id || formData.campaignId;
            if (csvFile && campaignId) {
                await importCsv(campaignId, csvFile);
            }
            resetForm();
            loadData();
            alert('Campaign created successfully and launch scheduled!');
        } catch (err) {
            alert('Failed to launch campaign: ' + (err.response?.data?.message || err.message));
        }
    };

    const resetForm = () => {
        setFormData({
            campaignId: null,
            campaignName: '',
            subject: '',
            content: '',
            channel: 'EMAIL_RESEND',
            campaignType: 'BROADCAST',
            targetAudience: 'ALL_LEARNERS',
            triggerCondition: 'ON_SIGNUP',
            fromName: 'Administrator',
            fromEmail: 'noreply@yourdomain.com',
            replyTo: 'support@yourdomain.com',
            status: 'DRAFT',
            startDate: '',
            endDate: '',
            budget: '0.00',
            audienceFilters: '',
            description: '',
            manualEmails: '',
            selectedLeadIds: [],
            scheduledAt: '',
            sendMode: 'NOW'
        });
        setCsvFile(null);
        setStep(1);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this campaign?')) {
            await deleteEmailCampaign(id);
            loadData();
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    const renderForm = () => {
        return (
            <div className="p-4 animate-in">
                <div className="row g-4">
                    {/* Left Column: Details & Content */}
                    <div className="col-lg-7">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h6 className="fw-bold mb-0 text-primary">Campaign Details</h6>
                            </div>
                            <div className="card-body p-4">
                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Campaign Name *</label>
                                    <input type="text" className="form-control bg-light border-0" name="campaignName" value={formData.campaignName} onChange={handleChange} placeholder="e.g. Summer Bootcamp Promo" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Email Subject *</label>
                                    <input type="text" className="form-control bg-light border-0" name="subject" value={formData.subject} onChange={handleChange} placeholder="Don't miss out on this offer!" />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label fw-bold small">Message Content *</label>
                                    <textarea className="form-control bg-light border-0" name="content" rows="10" value={formData.content} onChange={handleChange} placeholder="Write your email content here..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audience & Launch */}
                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h6 className="fw-bold mb-0 text-success">Audience & Launch</h6>
                            </div>
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Select from Leads ({leads.length} available)</label>
                                    <div className="overflow-auto border rounded bg-light p-2" style={{ maxHeight: '180px' }}>
                                        {leads.length === 0 ? (
                                            <div className="text-muted small p-2 text-center">No leads available.</div>
                                        ) : (
                                            leads.map(lead => (
                                                <div key={lead.id} className="form-check p-2 border-bottom mb-0">
                                                    <input 
                                                        className="form-check-input ms-0 me-2" 
                                                        type="checkbox" 
                                                        id={`lead-${lead.id}`}
                                                        checked={formData.selectedLeadIds.includes(lead.id)}
                                                        onChange={() => toggleLeadSelection(lead.id)}
                                                    />
                                                    <label className="form-check-label d-flex justify-content-between w-100 cursor-pointer" htmlFor={`lead-${lead.id}`}>
                                                        <span className="fw-medium small">{lead.name || lead.email.split('@')[0]}</span>
                                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{lead.email}</span>
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Add Manual Emails</label>
                                    <textarea 
                                        className="form-control bg-light border-0" 
                                        name="manualEmails" 
                                        rows="3" 
                                        value={formData.manualEmails} 
                                        onChange={handleChange} 
                                        placeholder="user1@mail.com, user2@mail.com"
                                    ></textarea>
                                    <small className="text-muted" style={{fontSize: '0.75rem'}}>Separate emails with commas.</small>
                                </div>

                                <div className="mt-auto pt-3 border-top">
                                    <button 
                                        className="btn btn-success btn-lg w-100 fw-bold d-flex justify-content-center align-items-center shadow-sm" 
                                        onClick={handleSubmit}
                                        disabled={!formData.campaignName || !formData.subject || !formData.content}
                                    >
                                        <LuRocket className="me-2" /> Launch Campaign
                                    </button>
                                    {formData.campaignId && (
                                        <button className="btn btn-light w-100 mt-2 text-muted" onClick={resetForm}>Cancel Edit</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold">Marketing Campaigns (V2)</h2>
                    <p className="text-muted">Orchestrate your high-impact customer outreach</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={loadData}><LuRefreshCw className="me-2" /> Sync Data</button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow border-0 mb-5 overflow-hidden">
                        <div className="card-header bg-dark text-white py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center small text-uppercase"><LuWand className="me-2" />Campaign Flow Designer</h5>
                        </div>
                        <div className="card-body p-0">
                            {renderForm()}
                        </div>
                    </div>
                </div>

                <div className="col-lg-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold">Campaign Performance</h4>
                    </div>
                    <div className="table-responsive shadow-sm rounded-4 overflow-hidden border">
                        <table className="table table-hover bg-white mb-0 align-middle">
                            <thead className="bg-light">
                                <tr className="small text-uppercase text-secondary">
                                    <th className="ps-4">Campaign Details</th>
                                    <th>Channel</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Performance</th>
                                    <th>Timeline</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(campaigns) && campaigns.map(c => (
                                    <tr key={c.campaignId || c.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{c.campaignName || c.title || 'Untitled'}</div>
                                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>{c.subject}</small>
                                        </td>
                                        <td>
                                            <span className={`badge border text-dark fw-medium d-flex align-items-center w-fit px-3 py-2 rounded-pill ${c.channel === 'WHATSAPP' ? 'border-success' : 'border-info'}`}>
                                                {c.channel === 'WHATSAPP' ? <LuMessageCircle className="me-2 text-success" /> : <LuMail className="me-2 text-info" />}
                                                {c.channel}
                                            </span>
                                        </td>
                                        <td className="small fw-semibold">{c.campaignType || 'BROADCAST'}</td>
                                        <td>
                                            <span className={`badge px-3 py-2 rounded-pill ${
                                                (c.emailCampaignStatus || c.status) === 'COMPLETED' ? 'bg-success text-white' :
                                                (c.emailCampaignStatus || c.status) === 'IN_PROGRESS' || (c.emailCampaignStatus || c.status) === 'SENDING' ? 'bg-warning text-dark animate-pulse' :
                                                (c.emailCampaignStatus || c.status) === 'FAILED' ? 'bg-danger text-white' :
                                                (c.emailCampaignStatus || c.status) === 'ACTIVE' || (c.emailCampaignStatus || c.status) === 'SCHEDULED' ? 'bg-primary text-white' :
                                                'bg-secondary text-white'
                                            }`}>
                                                {c.emailCampaignStatus || c.status || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="small">
                                            {c.totalRecipients !== undefined ? (
                                                <div className="d-flex flex-column gap-1">
                                                    <span className="text-muted"><LuUsers className="me-1"/>{c.totalRecipients || 0} Recipients</span>
                                                    {c.successCount > 0 && <span className="text-success"><LuCheck className="me-1"/>{c.successCount} Sent</span>}
                                                    {c.failedCount > 0 && <span className="text-danger"><LuX className="me-1"/>{c.failedCount} Failed</span>}
                                                </div>
                                            ) : (
                                                <span className="text-muted fst-italic">No data</span>
                                            )}
                                        </td>
                                        <td className="small text-muted">
                                            <div>{c.startDate || 'No start'}</div>
                                            <div className="opacity-50">{c.endDate || 'Ongoing'}</div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-light border-0 shadow-sm me-2" onClick={() => handleEdit(c)} title="Edit Campaign">
                                                <LuWand className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-light border-0 shadow-sm" onClick={() => handleDelete(c.campaignId || c.id)} title="Delete Campaign">
                                                <LuTrash className="text-danger" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <LuWand size={48} className="opacity-25 d-block mx-auto mb-3" />
                                            No campaigns found. Start build your first campaign above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>{/* end col-lg-12 Campaign Performance */}

            </div>
        </div>
    );
}

