import React, { useState } from 'react';
import SocialLinkGenerator from './SocialLinkGenerator';
import MarketingAnalytics from './MarketingAnalytics';
import PromoCodes from './PromoCodes';
import LeadDashboard from './LeadDashboard';
import UniversalCampaignManager from './universal/UniversalCampaignManager';
import LandingPageManager from './LandingPageManager';

import {
    LuChartBar,
    LuRocket,
    LuMegaphone,
    LuTicket,
    LuUserPlus,
    LuFileCode
} from 'react-icons/lu';

const MarketingDashboard = () => {
    const [activeTab, setActiveTab] = useState('campaigns');

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: LuChartBar },
        { id: 'social', label: 'Social Booster', icon: LuRocket },
        { id: 'campaigns', label: 'Campaigns', icon: LuMegaphone },
        { id: 'pages', label: 'Landing Pages', icon: LuFileCode },
        { id: 'leads', label: 'Leads', icon: LuUserPlus }
    ];

    return (
        <div className="bg-light min-vh-100">
            {/* Sticky Tab Nav */}
            <div className="bg-white border-bottom shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 999 }}>
                <div className="container">
                    <ul className="nav nav-tabs border-0 mb-0">
                        {tabs.map((tab) => (
                            <li className="nav-item" key={tab.id}>
                                <button
                                    className={`nav-link border-0 px-4 py-3 d-flex align-items-center gap-2 fw-semibold ${activeTab === tab.id ? 'active border-bottom border-2 border-primary text-primary' : 'text-secondary'}`}
                                    style={{ borderBottom: activeTab === tab.id ? '3px solid #0d6efd' : '3px solid transparent', background: 'none', borderRadius: 0 }}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={16} />
                                    <span className="small">{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Content */}
            <div className="container py-4">
                {activeTab === 'analytics' && <MarketingAnalytics />}
                {activeTab === 'social' && <SocialLinkGenerator />}
                {activeTab === 'campaigns' && <UniversalCampaignManager />}
                {activeTab === 'pages' && <LandingPageManager />}
                {activeTab === 'leads' && <LeadDashboard />}
            </div>
        </div>
    );
};

export default MarketingDashboard;
