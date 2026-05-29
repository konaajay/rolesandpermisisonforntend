import React from 'react';
import EntityListPage from '../components/EntityListPage';

export default function OnboardingRulesPage() {
  return (
    <EntityListPage
      title="Onboarding Rules"
      description="Configure auto-generation of IDs, welcome emails, and documents upon role creation"
    >
      <div className="card border-0 shadow-sm mt-3 p-5 text-center">
        <h5 className="text-secondary">UI Coming Soon</h5>
        <p className="text-muted small">
          We have just finished the backend APIs for OnboardingConfigs! The React UI is being built next.
        </p>
      </div>
    </EntityListPage>
  );
}
