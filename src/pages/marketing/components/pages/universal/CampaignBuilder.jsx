import React, { useState } from 'react';
import { LuSave, LuRocket } from 'react-icons/lu';

export default function CampaignBuilder({ onSave, onCancel }) {
    const [formData, setFormData] = useState({
        campaignName: '',
        recipients: '',
        subject: '',
        content: '',
        status: 'ACTIVE'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Parse comma-separated emails
        const manualRecipients = formData.recipients 
            ? formData.recipients.split(/[,\n]/).map(e => e.trim()).filter(e => e.includes('@'))
            : [];
            
        onSave({ 
            campaignName: formData.campaignName,
            subject: formData.subject,
            content: formData.content,
            status: formData.status,
            recipients: manualRecipients 
        });
    };

    return (
        <div className="bg-white rounded shadow-sm border p-4 animate-in">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h4 className="mb-0 fw-bold">Create Campaign</h4>
                <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small fw-bold">Campaign Name *</label>
                        <input type="text" className="form-control" name="campaignName" value={formData.campaignName} onChange={handleChange} placeholder="e.g., Java Course Offer" required />
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold">Recipients (Comma separated emails) *</label>
                        <textarea className="form-control" name="recipients" value={formData.recipients} onChange={handleChange} placeholder="test@gmail.com, demo@gmail.com" rows="2" required></textarea>
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold">Subject *</label>
                        <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Special Offer" required />
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold">Message *</label>
                        <textarea className="form-control font-monospace" name="content" value={formData.content} onChange={handleChange} rows="6" placeholder="Write your message here..." required></textarea>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Status</label>
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Send Now</option>
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                    <div></div>
                    <div className="d-flex gap-2">
                        {formData.status === 'DRAFT' ? (
                            <button type="submit" className="btn btn-light shadow-sm">
                                <LuSave className="me-2"/> Save Draft
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-success shadow-sm px-4 fw-bold">
                                <LuRocket className="me-2"/> Send Email
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
