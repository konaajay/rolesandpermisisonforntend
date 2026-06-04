import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NeedsAttention = () => {
    const navigate = useNavigate();

    // Mock Alerts Data - Ideally comes from API
    const alerts = [
        { id: 1, type: 'CRITICAL', text: "Attendance not finalized for 2 sessions", link: '/attendance' },
        { id: 2, type: 'CRITICAL', text: "Offline CSV pending for (1) session", link: '/attendance/offline' },
        { id: 3, type: 'WARNING', text: "14 Students below 75% attendance", link: '/attendance/reports' },
        { id: 4, type: 'WARNING', text: "Exam scheduled without eligibility check", link: '/exams' },
    ];

    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="content-card h-100">
            <div className="card-header border-0 pb-0">
                <h3 className="card-title text-danger d-flex align-items-center gap-2">
                    <FiAlertCircle /> Needs Attention
                </h3>
            </div>
            <div className="card-body pt-3">
                <div className="d-flex flex-column gap-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`alert-item p-3 rounded d-flex align-items-center justify-content-between cursor-pointer ${alert.type === 'CRITICAL' ? 'bg-red-soft border-red' : 'bg-yellow-soft border-yellow'
                                }`}
                            onClick={() => navigate(alert.link)}
                            style={{
                                backgroundColor: alert.type === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                                border: `1px solid ${alert.type === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                {alert.type === 'CRITICAL' ? (
                                    <FiAlertCircle className="text-danger" size={18} />
                                ) : (
                                    <FiAlertTriangle className="text-warning" size={18} />
                                )}
                                <span className={`fw-medium small ${alert.type === 'CRITICAL' ? 'text-danger' : 'text-warning-dark'}`} style={{ color: alert.type === 'CRITICAL' ? '#dc2626' : '#b45309' }}>
                                    {alert.text}
                                </span>
                            </div>
                            <FiArrowRight className="text-muted" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NeedsAttention;
