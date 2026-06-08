import React, { useState, useEffect, useMemo } from 'react';
import { getLandingPages, getTrackedLinks, createTrackedLink, deleteTrackedLink } from '../../services/api';
import { usePermissions } from '../../../../auth/usePermissions';

import {
    LuInstagram,
    LuMessageCircle,
    LuFacebook,
    LuYoutube,
    LuTwitter,
    LuCircleCheck,
    LuLink,
    LuCopy,
    LuTrash2,
    LuSearch,
    LuPlus,
    LuExternalLink,
    LuRocket
} from 'react-icons/lu';

import './SocialLinkGenerator.css';

const SocialLinkGenerator = () => {
    const { hasPermission } = usePermissions();
    const [selectedSources, setSelectedSources] = useState(new Set(['instagram']));
    const [config, setConfig] = useState({
        landingSlug: '',
        campaignName: '',
        couponCode: '',
        adBudget: 0
    });
    const [landingPages, setLandingPages] = useState([]);
    const [generatedLinks, setGeneratedLinks] = useState([]);
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [linkHistory, setLinkHistory] = useState([]);
    const [copiedHistoryItemId, setCopiedHistoryItemId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [previewLinks, setPreviewLinks] = useState([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const autoSlug = queryParams.get('slug');

        const fetchData = async () => {
            try {
                setLoading(true);
                const [pagesRes, historyRes] = await Promise.all([
                    getLandingPages(),
                    getTrackedLinks()
                ]);
                const pages = Array.isArray(pagesRes) ? pagesRes : [];
                setLandingPages(pages);
                
                if (autoSlug) {
                    setConfig(prev => ({ ...prev, landingSlug: autoSlug }));
                } else if (pages.length > 0) {
                    setConfig(prev => ({ ...prev, landingSlug: pages[0].slug }));
                }
                
                setLinkHistory(Array.isArray(historyRes) ? historyRes : []);
            } catch (err) {
                // silent
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sources = [
        { id: 'instagram', name: 'Instagram', icon: LuInstagram, color: '#E1306C' },
        { id: 'whatsapp', name: 'WhatsApp', icon: LuMessageCircle, color: '#25D366' },
        { id: 'facebook', name: 'Facebook', icon: LuFacebook, color: '#1877F2' },
        { id: 'youtube', name: 'YouTube', icon: LuYoutube, color: '#FF0000' },
        { id: 'twitter', name: 'Twitter/X', icon: LuTwitter, color: '#1DA1F2' }
    ];

    // senior dev grouping logic - group links by landing page for a cleaner UI 🛡️✨
    const groupedHistory = useMemo(() => {
        const groups = {};
        linkHistory.forEach(link => {
            const slug = link.landingSlug || 'unknown';
            if (!groups[slug]) {
                groups[slug] = {
                    slug: slug,
                    links: [],
                    totalClicks: 0,
                    totalViews: 0,
                    totalSignups: 0,
                    totalBudget: 0,
                    lastGenerated: link.timestamp
                };
            }
            groups[slug].links.push(link);
            groups[slug].totalClicks += (link.clicks || 0);
            groups[slug].totalViews += (link.views || 0);
            groups[slug].totalSignups += (link.signups || 0);
            groups[slug].totalBudget = Math.max(groups[slug].totalBudget, link.adBudget || 0);
            if (new Date(link.timestamp) > new Date(groups[slug].lastGenerated)) {
                groups[slug].lastGenerated = link.timestamp;
            }
        });
        return Object.values(groups).sort((a,b) => new Date(b.lastGenerated) - new Date(a.lastGenerated));
    }, [linkHistory]);

    const toggleSource = (sourceId) => {
        const newSet = new Set(selectedSources);
        if (newSet.has(sourceId)) {
            if (newSet.size > 1) newSet.delete(sourceId);
        } else {
            newSet.add(sourceId);
        }
        setSelectedSources(newSet);
    };

    const toggleAllSources = () => {
        if (selectedSources.size === sources.length) {
            setSelectedSources(new Set(['instagram']));
        } else {
            setSelectedSources(new Set(sources.map(s => s.id)));
        }
    };

    const openModal = () => {
        if (!config.landingSlug || selectedSources.size === 0) return;
        updatePreviews(config);
        setShowModal(true);
    };

    const updatePreviews = (currentConfig) => {
        const baseUrl = window.location.origin;
        const previews = [];
        const finalCampaign = currentConfig.campaignName ? currentConfig.campaignName.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'promo';
        for (const sourceId of selectedSources) {
            let link = `${baseUrl}/landing/${currentConfig.landingSlug}?utm_source=${sourceId}&utm_medium=social&utm_campaign=${finalCampaign}`;
            if (currentConfig.couponCode) link += `&coupon=${encodeURIComponent(currentConfig.couponCode)}`;
            previews.push({ source: sourceId, url: link });
        }
        setPreviewLinks(previews);
    };

    const handleConfigChange = (field, value) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        updatePreviews(newConfig);
    };

    const generateLinks = async () => {
        const selectedPage = landingPages.find(p => p.slug === config.landingSlug);
        const baseUrl = window.location.origin;
        const results = [];
        const finalCampaign = config.campaignName ? config.campaignName.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'promo';
        try {
            setLoading(true);
            for (const sourceId of selectedSources) {
                let link = `${baseUrl}/landing/${config.landingSlug}?utm_source=${sourceId}&utm_medium=social&utm_campaign=${finalCampaign}`;
                if (config.couponCode) link += `&coupon=${encodeURIComponent(config.couponCode)}`;

                const payload = {
                    landingSlug: config.landingSlug,
                    source: sourceId,
                    medium: 'social',
                    campaign: finalCampaign,
                    generatedLink: link,
                    adBudget: config.adBudget ? Number(config.adBudget) : (selectedPage ? selectedPage.adBudget : 0)
                };
                const saved = await createTrackedLink(payload);
                results.push(saved);
            }
            setGeneratedLinks(results);
            setLinkHistory(prev => [...results, ...prev]);
            setShowModal(false);
            setCopied(false);
        } catch (err) {
            alert('Generation failed');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (linkText, id = null) => {
        navigator.clipboard.writeText(linkText);
        if (id) {
            setCopiedHistoryItemId(id);
            setTimeout(() => setCopiedHistoryItemId(null), 2000);
        } else {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const deleteGroup = async (slug) => {
        if (!window.confirm(`Delete all tracking links for /${slug}?`)) return;
        const toDelete = linkHistory.filter(l => l.landingSlug === slug);
        try {
            for (const item of toDelete) {
                await deleteTrackedLink(item.id);
            }
            setLinkHistory(prev => prev.filter(l => l.landingSlug !== slug));
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading && landingPages.length === 0) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="social-generator-container py-4 animate__animated animate__fadeIn">
            <div className="row g-4 mb-5">
                <div className="col-lg-5">
                    <div className="card premium-card h-100 h-100">
                        <div className="card-header bg-transparent border-0 p-4">
                            <h5 className="mb-0 fw-bold d-flex align-items-center"><LuRocket className="me-2 text-primary"/> Bulk Generator</h5>
                            <p className="text-muted small mb-0 mt-1">Generate multi-channel tracking links instantly</p>
                        </div>
                        <div className="card-body p-4 pt-0">
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase ls-1">1. Target Landing Page</label>
                                <select className="form-select form-select-lg border-2" value={config.landingSlug} onChange={(e) => handleConfigChange('landingSlug', e.target.value)}>
                                    {landingPages.map(p => <option key={p.slug} value={p.slug}>{p.title} (/{p.slug})</option>)}
                                </select>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <label className="form-label small fw-bold text-uppercase ls-1 mb-0">2. Select Platforms</label>
                                    <button className="btn btn-sm btn-link text-decoration-none small p-0 fw-bold" onClick={toggleAllSources}>
                                        {selectedSources.size === sources.length ? 'Reset' : 'Select All'}
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-3">
                                    {sources.map(s => (
                                        <div 
                                            key={s.id} 
                                            className={`platform-chip ${selectedSources.has(s.id) ? 'active shadow-lg' : ''}`}
                                            onClick={() => toggleSource(s.id)}
                                        >
                                            <s.icon style={{ color: selectedSources.has(s.id) ? s.color : '#94a3b8' }} />
                                            <span>{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {hasPermission('MARKETING_CREATE') && (
                                <button 
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-4 d-flex align-items-center justify-content-center shadow mt-5" 
                                    onClick={openModal} 
                                    disabled={loading || !config.landingSlug || selectedSources.size === 0}
                                >
                                    Configure Campaign Tracking <LuRocket className="ms-2" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card premium-card border-0 rounded-4 h-100 bg-opacity-50">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-secondary mb-4 small text-uppercase ls-1">Generated Success Batch</h6>
                            {generatedLinks.length > 0 ? (
                                <div className="d-flex flex-column gap-3 overflow-auto" style={{maxHeight: '400px', padding: '0.5rem'}}>
                                    {generatedLinks.map((l, i) => (
                                        <div key={i} className="bg-white p-3 rounded-4 border shadow-sm d-flex justify-content-between align-items-center animate__animated animate__slideInRight">
                                            <div className="text-truncate flex-grow-1 pe-3">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge success-badge rounded-pill">{l.source.toUpperCase()}</span>
                                                    {copied && <span className="text-success smallest fw-bold animate__animated animate__fadeOut animate__delay-1s">Copied!</span>}
                                                </div>
                                                <div className="smallest text-muted text-truncate font-monospace">{l.generatedLink}</div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <a href={l.generatedLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary border-0 rounded-pill px-3" title="Open Link">
                                                    <LuExternalLink size={16}/> Open
                                                </a>
                                                <button className="btn btn-sm btn-outline-primary border-0 rounded-pill px-3" onClick={() => copyToClipboard(l.generatedLink)}>
                                                    <LuCopy size={16}/> Copy
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 opacity-50">
                                    <div className="mb-3 text-primary bg-primary bg-opacity-10 d-inline-block p-4 rounded-circle">
                                        <LuLink size={48} />
                                    </div>
                                    <p className="small fw-bold text-secondary">No batch generated yet</p>
                                    <p className="smallest text-muted">Select platforms and click generate to start</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card premium-card border-0 rounded-5 overflow-hidden mb-5">
                <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0 fw-bold">Link Tracking & Performance</h5>
                        <p className="text-muted small mb-0 mt-1">Real-time engagement metrics for your campaigns</p>
                    </div>
                    <span className="badge bg-primary rounded-pill px-4 py-2 shadow-sm">{groupedHistory.length} Pages Active</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover analytics-table align-middle mb-0">
                        <thead>
                            <tr className="small text-muted text-uppercase">
                                <th className="ps-4">Landing Page Target</th>
                                <th>Connected Channels</th>
                                <th className="text-center">Total Imp.</th>
                                <th className="text-center">Conversion</th>
                                <th>Budget Allocation</th>
                                <th className="text-end pe-4">Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedHistory.map(group => (
                                <tr key={group.slug}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark d-flex align-items-center">
                                            <span className="text-primary me-2">/</span>{group.slug}
                                        </div>
                                        <div className="smallest text-muted">Analytics since {new Date(group.lastGenerated).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {group.links.map(link => {
                                                const sourceInfo = sources.find(s => s.id === link.source) || { icon: LuLink, color: '#94a3b8' };
                                                return (
                                                    <div 
                                                        key={link.id} 
                                                        className={`p-2 rounded-3 bg-white border cursor-pointer hover-shadow transition-all ${copiedHistoryItemId === link.id ? 'border-success' : ''}`}
                                                        onClick={() => copyToClipboard(link.generatedLink, link.id)}
                                                        title={`Click to copy ${link.source} link`}
                                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <sourceInfo.icon style={{ color: copiedHistoryItemId === link.id ? '#10b981' : sourceInfo.color }} size={20} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="fw-bold text-dark">{group.totalViews}</div>
                                        <div className="smallest text-muted">Total Views</div>
                                    </td>
                                    <td className="text-center">
                                        <div className="fw-bold text-success">{group.totalSignups}</div>
                                        <div className="smallest text-muted">Success Leads</div>
                                    </td>
                                    <td>
                                        <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 small fw-bold">
                                            ₹{group.totalBudget}
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <a href={`/landing/${group.slug}`} target="_blank" className="btn btn-sm btn-outline-primary border-0 bg-light-hover rounded-circle p-2">
                                                <LuExternalLink size={16}/>
                                            </a>
                                            {hasPermission('MARKETING_DELETE') && (
                                                <button className="btn btn-sm btn-outline-danger border-0 bg-light-hover rounded-circle p-2" onClick={() => deleteGroup(group.slug)}>
                                                    <LuTrash2 size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {groupedHistory.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <LuLink size={48} className="mb-3 opacity-25" />
                            <p className="fw-bold">No tracking data available</p>
                            <p className="smallest">Generate your first batch to see performance metrics here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Configuration Modal */}
            {showModal && (
                <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-header bg-primary bg-opacity-10 border-0 p-4">
                                <h5 className="modal-title fw-bold text-primary d-flex align-items-center">
                                    <LuRocket className="me-2" /> Generate Tracking Links
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 bg-light">
                                <div className="card border-0 shadow-sm rounded-3 mb-4">
                                    <div className="card-body">
                                        <h6 className="fw-bold text-muted small text-uppercase mb-3">Campaign Information</h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label small fw-semibold">Campaign Name *</label>
                                                <input type="text" className="form-control" placeholder="e.g. Summer Promo" value={config.campaignName} onChange={(e) => handleConfigChange('campaignName', e.target.value)} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold">Coupon Code (Optional)</label>
                                                <input type="text" className="form-control" placeholder="e.g. SAVE20" value={config.couponCode} onChange={(e) => handleConfigChange('couponCode', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold">Advertising Budget (Optional)</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">$</span>
                                                    <input type="number" className="form-control" placeholder="5000" value={config.adBudget || ''} onChange={(e) => handleConfigChange('adBudget', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="card border-0 shadow-sm rounded-3 bg-white">
                                    <div className="card-body">
                                        <h6 className="fw-bold text-muted small text-uppercase mb-3">URL Preview</h6>
                                        <div className="d-flex flex-column gap-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {previewLinks.map((preview, idx) => (
                                                <div key={idx} className="p-2 bg-light border rounded font-monospace small text-truncate">
                                                    <span className="badge bg-dark me-2">{preview.source}</span>
                                                    {preview.url}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-3 d-flex justify-content-between bg-light">
                                <button type="button" className="btn btn-outline-secondary px-4 fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary px-4 fw-bold" onClick={generateLinks} disabled={loading || !config.campaignName}>
                                    {loading ? 'Generating...' : 'Generate Links'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialLinkGenerator;
