import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getLandingPages, createLandingPage, updateLandingPage, deleteLandingPage, seedLandingPages, getTrackedLinks } from '../../services/api';
import { LuDatabase, LuPlus, LuFilePlus, LuEye, LuSearch, LuPencil, LuTrash2, LuX, LuLink, LuExternalLink, LuMousePointerClick, LuChevronDown, LuChevronUp, LuInfo } from 'react-icons/lu';



const LandingPageManager = () => {
    const [pages, setPages] = useState([]);
    const [trackedLinks, setTrackedLinks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [expandedPages, setExpandedPages] = useState(new Set());

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        ctaText: '',
        status: 'DRAFT'
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const [lpRes, tlRes] = await Promise.all([
                getLandingPages(),
                getTrackedLinks()
            ]);
            setPages(Array.isArray(lpRes.data) ? lpRes.data : (Array.isArray(lpRes) ? lpRes : []));
            setTrackedLinks(Array.isArray(tlRes.data) ? tlRes.data : (Array.isArray(tlRes) ? tlRes : []));
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setLoading(false);
    };

    const toggleExpand = (pageId) => {
        const newExpanded = new Set(expandedPages);
        if (newExpanded.has(pageId)) {
            newExpanded.delete(pageId);
        } else {
            newExpanded.add(pageId);
        }
        setExpandedPages(newExpanded);
    };

    const filteredPages = pages.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (page, e) => {
        if (e) e.stopPropagation();
        setEditingPage(page);
        setFormData({
            title: page.title || '',
            slug: page.slug || '',
            description: page.description || '',
            ctaText: page.ctaText || '',
            status: page.status || 'ACTIVE'
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this landing page?')) {
            try {
                await deleteLandingPage(id);
                fetchPages();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const submissionData = { ...formData };

            if (editingPage) {
                await updateLandingPage(editingPage.id, submissionData);
            } else {
                await createLandingPage(submissionData);
            }
            
            resetForm();
            fetchPages();
        } catch (err) {
            alert('Save failed');
        }
        setSaving(false);
    };

    const resetForm = () => {
        setFormData({ 
            title: '', slug: '', 
            description: '', ctaText: '', status: 'DRAFT'
        });
        setEditingPage(null);
        setShowForm(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading && pages.length === 0) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h4 className="fw-bold mb-0">Landing Page Portfolio</h4>
                    <p className="text-muted small mb-0">Unified table view for high-conversion management.</p>
                </div>
                <div className="d-flex gap-2">
                   <button 
                        className="btn shadow-lg px-4 fw-bold" 
                        style={{ 
                            background: showForm ? '#dc3545' : '#0d6efd', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px'
                        }} 
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Close Form' : <><LuPlus className="me-2" /> Create New Page</>}
                   </button>
                </div>
            </div>

            {showForm && (
                <div className="card shadow-sm border-0 bg-white rounded-4 mb-5 overflow-hidden">
                    <div className="card-header bg-primary bg-opacity-10 border-0 p-0">
                        <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
                            <h6 className="mb-0 fw-bold text-primary">{editingPage ? 'Update Landing Page' : 'New Page Configuration'}</h6>
                        </div>
                    </div>
                    <div className="card-body p-4 bg-white">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 animate__animated animate__fadeIn">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">PAGE TITLE</label>
                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleFormChange} required placeholder="e.g., Free CRM Demo" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">URL SLUG</label>
                                    <input type="text" className="form-control" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} required placeholder="free-crm-demo" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">MAIN DESCRIPTION</label>
                                    <textarea className="form-control" name="description" value={formData.description} onChange={handleFormChange} rows="3" placeholder="Discover how our platform helps businesses..."></textarea>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">CALL TO ACTION (CTA) TEXT</label>
                                    <input type="text" className="form-control" name="ctaText" value={formData.ctaText || ''} onChange={handleFormChange} placeholder="e.g., Register Now" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">PUBLISH STATUS</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleFormChange}>
                                        <option value="DRAFT">Draft (Hidden)</option>
                                        <option value="ACTIVE">Active (Published)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-top d-flex justify-content-between">
                                <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                                <button 
                                    type="submit" 
                                    className="btn px-5 fw-bold rounded-3 shadow-sm text-white" 
                                    style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }} 
                                    disabled={saving}
                                >
                                    {saving ? 'Processing...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light bg-opacity-50">
                            <tr className="small text-muted text-uppercase ls-1">
                                <th className="ps-4">Page Details</th>
                                <th className="text-center">Related Links</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPages.map(page => {
                                const pageLinks = trackedLinks.filter(tl => tl.landingSlug === page.slug);
                                const isExpanded = expandedPages.has(page.id);
                                return (
                                    <React.Fragment key={page.id}>
                                        <tr className={`cursor-pointer transition-all ${isExpanded ? 'bg-primary bg-opacity-5' : ''}`} onClick={() => toggleExpand(page.id)}>
                                            <td className="ps-4 py-4">
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <div className="fw-bold fs-6">{page.title}</div>
                                                        <div className="text-primary smaller">/{page.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center text-primary fw-bold">
                                                    {pageLinks.length} <LuLink className="ms-1" size={14}/>
                                                    {isExpanded ? <LuChevronUp className="ms-2 text-muted"/> : <LuChevronDown className="ms-2 text-muted"/>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge px-2 py-1 ${page.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>{page.status || 'ACTIVE'}</span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group shadow-sm bg-white rounded border overflow-hidden">
                                                    <button className="btn btn-sm btn-white border-0 text-primary" onClick={(e) => handleEdit(page, e)}><LuPencil size={15} /></button>
                                                    <button className="btn btn-sm btn-white border-0 text-danger" onClick={(e) => handleDelete(page.id, e)}><LuTrash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="6" className="bg-light bg-opacity-50 p-0 border-top-0">
                                                    <div className="p-4 animate__animated animate__fadeIn">
                                                        <div className="row g-3">
                                                            {pageLinks.length > 0 ? pageLinks.map(link => (
                                                                <div key={link.id} className="col-md-4">
                                                                    <div className="card h-100 border-0 shadow-sm rounded-3">
                                                                        <div className="card-body p-3">
                                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                <span className="badge bg-dark rounded-pill extra-small">{link.source.toUpperCase()}</span>
                                                                                <a href={link.generatedLink} target="_blank" className="text-primary"><LuExternalLink size={12}/></a>
                                                                            </div>
                                                                            <div className="progress mb-2" style={{height: '4px'}}>
                                                                                <div className="progress-bar bg-primary" style={{width: '100%'}}></div>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between smallest fw-bold text-muted mt-1">
                                                                                <span>Clicks: <span className="text-dark">{link.clicks || 0}</span></span>
                                                                                <span>Leads: <span className="text-success">{link.signups || 0}</span></span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <div className="col-12 text-center py-3 text-muted small italic">
                                                                    No tracking links linked to this landing page yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LandingPageManager;
