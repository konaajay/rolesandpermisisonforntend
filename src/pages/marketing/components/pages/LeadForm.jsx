import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackEvent, captureLead } from '../../services/api';
import { getStoredMarketingData, generateSessionId } from '../../services/trackingUtils';
import { LuCircleCheck } from 'react-icons/lu';

// Timestamp: 2026-03-16 12:10 (Force Refresh)
const LeadForm = ({ courseTitle = "the course", buttonText = "Get Syllabus" }) => {
    const [searchParams] = useSearchParams();
    const formRef = React.useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        referralCode: searchParams.get('ref') || '',
        aff') || ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleClear = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            referralCode: searchParams.get('ref') || '',
            aff') || ''
        });
        setStatus({ type: '', message: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setStatus({ type: 'info', message: 'Processing your request...' });

        const marketingData = getStoredMarketingData();
        const sessionId = generateSessionId();

        // Track the click event immediately
        try {
            await trackEvent({
                sessionId,
                source: marketingData.source,
                utmSource: marketingData.utmSource,
                utmMedium: marketingData.utmMedium,
                utmCampaign: marketingData.utmCampaign,
                page: window.location.pathname,
                eventType: 'CLICK',
                metadataJSON: JSON.stringify({ action: 'lead_form_submit_click', course_interest: courseTitle })
            });
        } catch (e) {
            console.warn('Click tracking failed', e);
        }
        
        try {
            const name = `${formData.firstName} ${formData.lastName}`.trim();
            if (!name || !formData.email || !formData.phone) {
                console.warn('LeadForm DEBUG: Missing required fields');
                setStatus({ type: 'danger', message: 'Please fill in all required fields.' });
                return;
            }

            const payload = {
                name,
                email: formData.email,
                phone: formData.phone,
                courseInterest: courseTitle || 'LMS Course',
                ...marketingData,
                sessionId
            };
            
            console.log('LeadForm DEBUG: Sending captureLead payload', payload);
            const res = await captureLead(payload);
            console.log('LeadForm DEBUG: captureLead response received', res);
            
            try {
                const eventPayload = {
                    sessionId,
                    source: marketingData.source || (formData.referralCode ? 'REFERRAL' : 'DIRECT'),
                    utmSource: marketingData.utmSource,
                    utmMedium: marketingData.utmMedium,
                    utmCampaign: marketingData.utmCampaign,
                    page: window.location.pathname,
                    eventType: 'SIGNUP',
                    metadataJSON: JSON.stringify({ course_interest: courseTitle, ref: formData.referralCode })
                };
                console.log('LeadForm DEBUG: Sending trackEvent payload', eventPayload);
                await trackEvent(eventPayload);
            } catch (trackError) {
                console.warn('LeadForm DEBUG: Tracking failed, continuing anyway', trackError);
            }

            setStatus({ type: 'success', message: 'Success! Your information has been captured. We will contact you soon.' });
            alert('Submitted Successfully!');
            setFormData({ firstName: '', lastName: '', email: '', phone: '', referralCode: '', ' });
        } catch (err) {
            console.error('LeadForm DEBUG Error:', err);
            const errorMsg = err.response?.data?.message 
                || err.response?.data?.error 
                || (typeof err.response?.data === 'string' ? err.response.data : null)
                || err.message 
                || 'Something went wrong. Please check your connection and try again.';
            setStatus({ type: 'danger', message: errorMsg });
        }
    };

    return (
        <div className="card shadow border-0 overflow-hidden bg-white" style={{ borderRadius: '15px' }}>
            <div className="bg-primary p-4 text-white text-center">
                <h4 className="mb-1 fw-bold">Interested in {courseTitle}?</h4>
                <p className="mb-0 opacity-75 small">Fill the form to get started with your learning journey.</p>
            </div>
            <div className="card-body p-4">
                <form ref={formRef} onSubmit={handleSubmit} id="leadCaptureForm">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">First Name *</label>
                            <input
                                type="text"
                                className="form-control form-control-lg border-primary border-opacity-25 shadow-sm"
                                placeholder="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Last Name *</label>
                            <input
                                type="text"
                                className="form-control form-control-lg border-primary border-opacity-25 shadow-sm"
                                placeholder="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Email Address *</label>
                        <input
                            type="email"
                            className="form-control form-control-lg border-primary border-opacity-25 shadow-sm"
                            placeholder="name@example.com"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Phone Number *</label>
                        <input
                            type="tel"
                            className="form-control form-control-lg border-primary border-opacity-25 shadow-sm"
                            placeholder="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {(formData.referralCode) && (
                        <div className="row g-2 mb-3">
                            {formData.referralCode && (
                                <div className="col">
                                    <span className="badge bg-light text-dark border p-2">Ref: {formData.referralCode}</span>
                                </div>
                            
                            
                                <div className="col">

                                </div>
                            
                        </div>
                    
                    
                    <div className="d-grid gap-2 mt-4">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg shadow fw-bold py-3 text-uppercase"
                        >
                            {buttonText}
                        </button>
                        <button type="button" className="btn btn-link text-muted btn-sm text-decoration-none" onClick={handleClear}>
                            Reset Form
                        </button>
                    </div>

                    {status.message && (
                        <div className={`alert alert-${status.type} mt-3 mb-0 shadow-sm border-0 fade show text-center`} style={{ fontSize: '0.9rem' }}>
                            {status.type === 'success' && <LuCircleCheck className="me-2" />}
                            {status.message}
                        </div>
                    
                </form>
            </div>
        </div>
    );
};

export default LeadForm;
