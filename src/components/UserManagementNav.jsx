import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UserManagementNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Users', path: '/users' },
    { name: 'Roles', path: '/roles' },
    { name: 'Permissions', path: '/permissions' },
    { name: 'Role Hierarchy', path: '/role-hierarchy' },
  ];

  return (
    <div className="d-flex mb-4 border-bottom w-100">
      {tabs.map(tab => {
        const isActive = location.pathname.startsWith(tab.path) && (tab.path === '/users' ? !location.pathname.includes('permissions') : true);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`btn btn-link text-decoration-none px-4 py-3 fw-medium ${
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