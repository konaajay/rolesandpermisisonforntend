
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiUsers, FiMail, FiPhone, FiLock, FiCheckCircle } from 'react-icons/fi';
import './Affiliates.css'; // Reusing styles

const AffiliateRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        type: 'INDIVIDUAL',
        groupName: '',
        name: '',
        email: '',
        mobile: '',
        password: '',
        agreeTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        console.log("Registering Affiliate:", formData);
        setStep(2); // Show success
    };

    if (step === 2) {
        return (
            <div className="affiliate-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="summary-card text-center" style={{ maxWidth: 500, padding: 40 }}>
                    <div className="mb-4 text-green" style={{ fontSize: 60 }}><FiCheckCircle /></div>
                    <h2>Application Received!</h2>
                    <p className="text-muted mb-4">
                        Thank you for applying to our Affiliate Program. Your application is currently <strong>PENDING APPROVAL</strong>.
                        We will review your details and notify you via email within 24-48 hours.
                    </p>
                    <button className="btn-primary w-100" onClick={() => window.location.href = '/'}>Return to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="affiliate-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div className="commission-settings" style={{ maxWidth: 600, width: '100%', margin: 20 }}>
                <div className="text-center mb-4">
                    <h2 className="font-bold">Join Our Affiliate Program</h2>
                    <p className="text-muted">Earn commissions by promoting our courses.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Account Type */}
                    <div className="st-group">
                        <label>I am registering as:</label>
                        <div className="account-type-toggle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'INDIVIDUAL' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'INDIVIDUAL' })}
                                style={{ justifyContent: 'center' }}
                            >
                                <FiUser className="me-2" /> Individual
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'ORGANIZATION' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'ORGANIZATION' })}
                                style={{ justifyContent: 'center' }}
                            >
                                <FiUsers className="me-2" /> Organization
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.type === 'INFLUENCER' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'INFLUENCER' })}
                                style={{ justifyContent: 'center' }}
                            >
                                <FiTrendingUp className="me-2" /> Influencer
                            </button>
                        </div>
                    </div>

                    {formData.type === 'ORGANIZATION' && (
                        <div className="st-group">
                            <label>Organization Name <span className="text-danger">*</span></label>
                            <input type="text" name="groupName" className="st-input" required value={formData.groupName} onChange={handleChange} placeholder="e.g. Tech Academy" />
                        </div>
                    )}

                    <div className="st-group">
                        <label>Full Name <span className="text-danger">*</span></label>
                        <div className="input-group-simple">
                            <input type="text" name="name" className="st-input" required value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="st-group">
                                <label>Email <span className="text-danger">*</span></label>
                                <input type="email" name="email" className="st-input" required value={formData.email} onChange={handleChange} placeholder="name@example.com" />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="st-group">
                                <label>Mobile <span className="text-danger">*</span></label>
                                <input type="tel" name="mobile" className="st-input" required value={formData.mobile} onChange={handleChange} placeholder="+1 234 567 890" />
                            </div>
                        </div>
                    </div>

                    <div className="st-group">
                        <label>Payout Details <span className="text-danger">*</span></label>
                        <textarea name="payoutDetails" className="st-input" rows="2" required value={formData.payoutDetails} onChange={handleChange} placeholder="Enter your Bank Account or UPI ID for commissions..." />
                    </div>

                    <div className="st-group">
                        <label>Website / Social Profile (Optional)</label>
                        <input type="text" name="website" className="st-input" value={formData.website} onChange={handleChange} placeholder="https://instagram.com/yourprofile" />
                    </div>

                    <div className="st-group">
                        <label>Address (Optional)</label>
                        <textarea name="address" className="st-input" rows="2" value={formData.address} onChange={handleChange} placeholder="Your billing address..." />
                    </div>

                    <div className="st-group">
                        <label>Password <span className="text-danger">*</span></label>
                        <input type="password" name="password" className="st-input" required value={formData.password} onChange={handleChange} placeholder="Create a strong password" />
                    </div>

                    <div className="st-group">
                        <label className="d-flex gap-2 cursor-pointer">
                            <input type="checkbox" name="agreeTerms" required checked={formData.agreeTerms} onChange={handleChange} style={{ marginTop: 4 }} />
                            <span className="text-sm text-muted">
                                I agree to the <a href="#" className="text-blue">Terms & Conditions</a> and <a href="#" className="text-blue">Privacy Policy</a>.
                                I understand that my account is subject to approval.
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="btn-save w-100 py-3 text-lg">Submit Application</button>

                    <div className="text-center mt-3 text-sm">
                        Already have an account? <Link to="/login" className="text-blue font-bold">Login here</Link>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AffiliateRegister;
