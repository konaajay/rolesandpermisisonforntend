import React from 'react';
import './Marketing.css';

const CampaignPage = () => {
    return (
        <div className="container py-5">
            <div className="card shadow-sm border-0 p-5 text-center">
                <h2 className="fw-bold mb-3">Campaign Landing Page</h2>
                <p className="text-muted">This is a simplified view of your campaign landing page.</p>
                <div className="mt-4">
                    <button className="btn btn-primary px-4 py-2">Get Started Now</button>
                </div>
            </div>
        </div>
    );
};

export default CampaignPage;
