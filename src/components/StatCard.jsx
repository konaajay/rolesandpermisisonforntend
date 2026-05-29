import React from 'react';

const StatCard = ({ title, value, icon, color, loading, sub, onClick }) => {
  return (
    <div className="col-12 col-md-6 col-lg-3" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div 
        className="card border-0 shadow-sm rounded-3 h-100 stat-card-hover"
        style={{ transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
          }
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="text-muted fw-medium mb-0 small">{title}</h6>
            <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center`}
              style={{ width: 40, height: 40, fontSize: 18 }}>
              {icon}
            </div>
          </div>
          <h2 className="fw-bold mb-0 text-dark">
            {loading
              ? <span className="spinner-border spinner-border-sm text-primary" role="status" />
              : value ?? '—'}
          </h2>
          {sub && <div className="mt-2 small text-muted">{sub}</div>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
