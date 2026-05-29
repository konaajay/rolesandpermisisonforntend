import React from 'react';
import EntityListPage from '../components/EntityListPage';

export default function NotificationsPage() {
  return (
    <EntityListPage
      title="Notifications Settings"
      description="Configure email, SMS, and in-app notification triggers and templates"
    >
      <div className="card border-0 shadow-sm mt-3 p-5 text-center">
        <h5 className="text-secondary">UI Coming Soon</h5>
        <p className="text-muted small">
          This module is part of the upcoming SaaS enhancement sprint.
        </p>
      </div>
    </EntityListPage>
  );
}
