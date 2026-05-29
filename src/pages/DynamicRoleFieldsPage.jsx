import React from 'react';
import EntityListPage from '../components/EntityListPage';

export default function DynamicRoleFieldsPage() {
  return (
    <EntityListPage
      title="Dynamic Role Fields"
      description="Manage custom fields for different roles (e.g., Aadhaar for Students, PAN for Employees)"
    >
      <div className="card border-0 shadow-sm mt-3 p-5 text-center">
        <h5 className="text-secondary">UI Coming Soon</h5>
        <p className="text-muted small">
          This module is being extracted from the 'Roles' page to act as your central dynamic form builder.
        </p>
      </div>
    </EntityListPage>
  );
}
