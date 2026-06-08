import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SettingsNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Company Profile', path: '/settings/company-profile' },
    { name: 'Entities', path: '/settings/entities' },
    { name: 'Departments', path: '/settings/departments' },
    { name: 'ID Generation', path: '/settings/id-generation' },
    { name: 'Templates', path: '/settings/templates' },
    { name: 'Certificates', path: '/settings/certificates' },
    { name: 'Branches (HRMS)', path: '/hrms/branches' },
    { name: 'Shifts (HRMS)', path: '/hrms/shifts' },
    { name: 'Lead Stages (CRM)', path: '/crm/stages' },
  ];

  return (
    <div className="d-flex mb-4 border-bottom w-100 overflow-auto" style={{ whiteSpace: 'nowrap' }}>
      {tabs.map(tab => {
        const isActive = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`btn btn-link text-decoration-none px-3 py-3 fw-medium ${
              isActive
                ? 'border-bottom border-primary text-primary'
                : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              borderRadius: 0, 
              borderBottomWidth: isActive ? '3px' : '0', 
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
