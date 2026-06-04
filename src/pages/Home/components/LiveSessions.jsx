import React from 'react';
import { FiVideo, FiCalendar, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const LiveSessions = () => {
    // Mock Data - In real app, fetch from API
    const sessions = [
        { id: 1, name: "React Hooks Deep Dive", module: "Live Class", status: "LIVE", time: "Now" },
        { id: 2, name: "Database Design 101", module: "Exam", status: "UPCOMING", time: "10:00 AM" },
        { id: 3, name: "UI Principles", module: "Live Class", status: "UPCOMING", time: "02:00 PM" },
    ];

    return (
        <div className="content-card h-100">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h3 className="card-title d-flex align-items-center gap-2">
                    <FiVideo className="text-primary" /> Live & Upcoming Today
                </h3>
                <span className="badge bg-light text-secondary">3 Items</span>
            </div>
            <div className="card-body pt-3">
                <div className="d-flex flex-column gap-3">
                    {sessions.map(session => (
                        <div key={session.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`status-indicator ${session.status === 'LIVE' ? 'bg-danger pulsate' : 'bg-primary'}`}
                                    style={{ width: '8px', height: '8px', borderRadius: '50%' }}></div>
                                <div>
                                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{session.name}</h6>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {session.module} • {session.time}
                                    </small>
                                </div>
                            </div>
                            <div>
                                {session.status === 'LIVE' ? (
                                    <button className="btn btn-sm btn-primary px-3" style={{ fontSize: '0.75rem' }}>Manage</button>
                                ) : (
                                    <button className="btn btn-sm btn-light px-3 text-muted" style={{ fontSize: '0.75rem' }}>View</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>
                {`
                .pulsate { animation: pulse-red 2s infinite; }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }
                `}
            </style>
        </div>
    );
};

export default LiveSessions;
