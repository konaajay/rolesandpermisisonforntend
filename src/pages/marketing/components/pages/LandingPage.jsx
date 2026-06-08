import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { trackEvent, getLandingPageBySlug } from '../../services/api';
import { generateSessionId, getStoredMarketingData, getUTMParams } from '../../services/trackingUtils';
import { LuCircleCheck, LuMessageCircle } from 'react-icons/lu';

const LandingPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // First capture any UTMs from URL
        getUTMParams();

        const loadContent = async () => {
            try {
                const res = await getLandingPageBySlug(slug);
                if (res) setPageData(res);
            } catch (err) {
                console.error('Content fetch error', err);
            }
        };
        loadContent();

        // Track PAGE_VIEW
        const mData = getStoredMarketingData();
        trackEvent({
            sessionId: generateSessionId(),
            source: mData.source || 'DIRECT',
            utmSource: mData.utmSource,
            utmMedium: mData.utmMedium,
            utmCampaign: mData.utmCampaign,
            page: `/landing/${slug}`,
            eventType: 'PAGE_VIEW'
        });
    }, [slug]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const mData = getStoredMarketingData();
        
        // Map dynamic form data to standard lead fields
        const leadName = formData.name || formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
        
        const submissionPayload = {
            name: leadName,
            email: formData.email,
            phone: formData.phone,
            courseInterest: pageData.title, // Or pass specific course if LMS
            source: pageData.moduleType || 'CRM',
            utmSource: mData.utmSource,
            utmMedium: mData.utmMedium,
            utmCampaign: mData.utmCampaign || mData.campaignCode,
            sessionId: generateSessionId()
        };

        console.log("Submitting dynamic lead to backend:", submissionPayload);
        
        api.post('/public/leads', submissionPayload)
            .then(() => {
                trackEvent({
                    sessionId: generateSessionId(),
                    source: mData.source || 'DIRECT',
                    utmSource: mData.utmSource,
                    utmMedium: mData.utmMedium,
                    utmCampaign: mData.utmCampaign,
                    page: `/landing/${slug}`,
                    eventType: 'SIGNUP'
                });
                setSubmitted(true);
            })
            .catch(err => {
                console.error("Form submission failed:", err);
                alert("Failed to submit the form. Please try again later.");
            });
    };

    if (!pageData) return null;

    const renderDynamicForm = () => {
        const modType = pageData.moduleType || 'CRM';

        if (modType === 'CRM') {
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">First Name *</label>
                        <input type="text" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Last Name</label>
                        <input type="text" className="form-control bg-light border-0" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email *</label>
                        <input type="email" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Mobile Number *</label>
                        <input type="tel" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Company Name</label>
                        <input type="text" className="form-control bg-light border-0" onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                </>
            );
        }

        if (modType === 'HRMS') {
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Full Name *</label>
                        <input type="text" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email *</label>
                        <input type="email" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Phone *</label>
                        <input type="tel" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Experience (Years) *</label>
                        <select className="form-select bg-light border-0" required onChange={e => setFormData({...formData, experience: e.target.value})}>
                            <option value="">Select</option>
                            <option value="0-2">0 - 2 Years</option>
                            <option value="3-5">3 - 5 Years</option>
                            <option value="5+">5+ Years</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Resume Upload *</label>
                        <input type="file" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, resume: e.target.files[0]})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">LinkedIn URL</label>
                        <input type="url" className="form-control bg-light border-0" onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                    </div>
                </>
            );
        }

        if (false) {
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Name *</label>
                        <input type="text" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email *</label>
                        <input type="email" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Phone *</label>
                        <input type="tel" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Website</label>
                        <input type="url" className="form-control bg-light border-0" onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Instagram Profile</label>
                        <input type="text" className="form-control bg-light border-0" onChange={e => setFormData({...formData, instagram: e.target.value})} />
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input type="text" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address *</label>
                    <input type="email" className="form-control bg-light border-0" required onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input type="tel" className="form-control bg-light border-0" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
            </>
        );
    };

    return (
        <div className="landing-page bg-light min-vh-100 font-sans">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Dynamic Header Section */}
                        <div className="text-center mb-5 animate__animated animate__fadeInDown">
                            {pageData.moduleType && (
                                <span className="badge bg-dark bg-opacity-10 text-dark mb-3 px-3 py-2 rounded-pill ls-1 small fw-bold">
                                    {pageData.moduleType} / {pageData.landingPageType || 'Landing Page'}
                                </span>
                            )}
                            <h1 className="display-4 fw-bolder text-dark mb-3" style={{ letterSpacing: '-1px' }}>{pageData.title}</h1>
                            {pageData.subtitle && <p className="lead text-secondary mb-4">{pageData.subtitle}</p>}
                            {pageData.description && <p className="text-muted">{pageData.description}</p>}
                        </div>

                        {/* Dynamic Form Card */}
                        <div className="card border-0 shadow-lg rounded-5 overflow-hidden animate__animated animate__fadeInUp">
                            <div className="card-body p-5 p-md-5">
                                {submitted ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <LuCircleCheck size={64} className="text-success" />
                                        </div>
                                        <h3 className="fw-bold text-dark mb-2">Success!</h3>
                                        <p className="text-muted mb-0">Your information has been securely submitted. We will be in touch shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit}>
                                        {/* Hidden fields tracked automatically in state, no need to render input type hidden */}
                                        <h4 className="fw-bold mb-4 border-bottom pb-3">{pageData.ctaText || 'Complete the Form Below'}</h4>
                                        
                                        {renderDynamicForm()}

                                        <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill py-3 mt-4 shadow fw-bold fs-5" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', border: 'none' }}>
                                            {pageData.ctaText || 'Submit'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
