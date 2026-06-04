import React from 'react';
import { FiUsers, FiBook, FiActivity, FiUserX, FiCheckCircle } from 'react-icons/fi';

const StatBox = ({ title, value, label, icon: Icon, colorClass }) => (
    <div className={`col-sm-6 col-lg-3`}>
        <div className={`card border-0 shadow-sm h-100 stat-box ${colorClass}`}>
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
                <div>
                    <h3 className="mb-0 fw-bold">{value}</h3>
                    <div className="text-muted small fw-semibold text-uppercase mt-1">{title}</div>
                    {label && <small className="opacity-75">{label}</small>}
                </div>
                <div className={`icon-circle`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    </div>
);

const GlobalSummary = ({ stats }) => {
    return (
        <div className="row g-3 mb-4">
            <StatBox
                title="Total Students"
                value={stats.totalStudents || 0}
                icon={FiUsers}
                colorClass="stat-blue"
            />
            <StatBox
                title="Total Courses"
                value={stats.totalCourses || 0}
                icon={FiBook}
                colorClass="stat-indigo"
            />
            <StatBox
                title="Active Sessions"
                value={stats.activeSessions || 0}
                label="Happening Now"
                icon={FiActivity}
                colorClass="stat-green"
            />
            <StatBox
                title="Attendance"
                value={`${stats.attendancePercent || 0}%`}
                label="Today's Average"
                icon={FiCheckCircle}
                colorClass="stat-teal"
            />
            {/* Optional: At Risk could be a specialized alert instead of a main box if space is tight, but requested. */}
        </div>
    );
};

export default GlobalSummary;
