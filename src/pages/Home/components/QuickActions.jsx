import React from 'react';
import { FiPlay, FiUpload, FiDownload, FiPlusSquare, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ActionButton = ({ icon: Icon, label, onClick, color }) => (
    <button
        className={`btn btn-white shadow-sm w-100 h-100 p-3 d-flex flex-column align-items-center justify-content-center gap-2 border-0 action-btn-hover`}
        onClick={onClick}
    >
        <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
            <Icon size={20} />
        </div>
        <span className="small fw-bold text-dark">{label}</span>
    </button>
);

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </div>
            <div className="card-body pt-0">
                <div className="row g-2">
                    {/* Add logic to navigate or open modals */}
                    <div className="col-4 col-md-4">
                        <ActionButton icon={FiPlay} label="Start Session" color="primary" onClick={() => navigate('/sessions')} />
                    </div>
                    <div className="col-4 col-md-4">
                        <ActionButton icon={FiUpload} label="Upload CSV" color="warning" onClick={() => navigate('/attendance/offline')} />
                    </div>
                    <div className="col-4 col-md-4">
                        <ActionButton icon={FiDownload} label="Reports" color="success" onClick={() => navigate('/reports')} />
                    </div>
                    <div className="col-6 col-md-6 mt-2">
                        <ActionButton icon={FiPlusSquare} label="New Batch" color="info" onClick={() => navigate('/batches')} />
                    </div>
                    <div className="col-6 col-md-6 mt-2">
                        <ActionButton icon={FiSettings} label="Rules" color="secondary" onClick={() => navigate('/settings')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;
