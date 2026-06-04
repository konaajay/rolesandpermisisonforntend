import React from 'react';
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AlertItem = ({ alert }) => {
    const navigate = useNavigate();
    const bgClass = alert.type === 'CRITICAL' ? 'bg-red-soft' : alert.type === 'WARNING' ? 'bg-yellow-soft' : 'bg-blue-soft';
    const iconColor = alert.type === 'CRITICAL' ? 'text-danger' : alert.type === 'WARNING' ? 'text-warning' : 'text-primary';
    const Icon = alert.type === 'CRITICAL' ? FiAlertCircle : alert.type === 'WARNING' ? FiAlertTriangle : FiInfo;

    return (
        <div
            className={`d-flex align-items-center justify-content-between p-3 rounded mb-2 cursor-pointer alert-row ${bgClass}`}
            onClick={() => alert.link && navigate(alert.link)}
        >
            <div className="d-flex align-items-center gap-3">
                <Icon className={iconColor} size={20} />
                <span className="fw-medium text-dark small">{alert.message}</span>
            </div>
            <FiChevronRight className="text-muted" />
        </div>
    );
};

const AlertsSection = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-4">
            <h6 className="text-muted text-uppercase fw-bold small mb-3 ls-1">Requires Attention</h6>
            <div className="d-flex flex-column gap-2">
                {alerts.map(a => <AlertItem key={a.id} alert={a} />)}
            </div>
        </div>
    );
};

export default AlertsSection;
