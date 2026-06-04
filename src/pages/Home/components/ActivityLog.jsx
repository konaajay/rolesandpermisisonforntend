import React from 'react';
import { FiClock } from 'react-icons/fi';

const ActivityLog = ({ logs }) => {
    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">Recent Activity</h5>
            </div>
            <div className="card-body p-0">
                <div className="list-group list-group-flush">
                    {logs.map(log => (
                        <div key={log.id} className="list-group-item border-0 py-3 d-flex align-items-start gap-3">
                            <div className="mt-1 text-muted"><FiClock size={14} /></div>
                            <div>
                                <div className="text-dark small fw-medium">{log.text}</div>
                                <div className="text-muted extra-small">{log.time} • {log.user}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
