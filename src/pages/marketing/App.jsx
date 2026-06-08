import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { LuLayoutDashboard, LuWallet, LuGift, LuRocket, LuMegaphone, LuUsers } from 'react-icons/lu';
import MarketingDashboard from './components/pages/MarketingDashboard';
import PromoCodes from './components/pages/PromoCodes';
import ReferralHub from './components/pages/ReferralHub';
import UniversalCampaignManager from './components/pages/universal/UniversalCampaignManager';
import SocialLinkGenerator from './components/pages/SocialLinkGenerator';
import CampaignPage from './CampaignPage';
import { getUTMParams } from './services/trackingUtils';

/**
 * Main Application Component - Marketing LMS
 * Clean Cut - Simplified Routes
 */
function App() {
  useEffect(() => {
    getUTMParams();
  }, []);

  return (
    <div className="bg-light d-flex flex-column min-vh-100">


      {/* Content Area */}
      <div className="flex-grow-1">
        <Routes>
          <Route index element={<MarketingDashboard />} />
          <Route path="promo-codes" element={<PromoCodes />} />
          <Route path="referral" element={<ReferralHub />} />
          <Route path="campaigns" element={<UniversalCampaignManager />} />
          <Route path="social-links" element={<SocialLinkGenerator />} />
          <Route path="page" element={<CampaignPage />} />

          <Route path="*" element={<Navigate to="/admin/marketing" replace />} />
        </Routes>
      </div>

    </div>
  );
}

export default App;
