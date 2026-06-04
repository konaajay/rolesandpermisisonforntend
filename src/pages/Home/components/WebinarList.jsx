import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { CalendarPlus } from 'lucide-react';

const WebinarList = ({ webinars }) => {
    const navigate = useNavigate();

    const handleViewAll = () => {
        navigate('/webinar');
    };

    const handleRegister = (webinarTitle) => {
        toast.success(`Registered for ${webinarTitle}`);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <h3 className="card-title">Live Webinars</h3>
                <button className="view-all-btn" onClick={handleViewAll}>View All</button>
            </div>
            <div className="course-list"> {/* Reusing course-list class for consistent styling */}
                {webinars.map((webinar) => (
                    <div key={webinar.id} className="course-item">
                        <div className="course-icon" style={{ backgroundColor: `${webinar.color}20`, color: webinar.color, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {webinar.icon}
                        </div>
                        <div className="course-info">
                            <h4 className="course-name">{webinar.title}</h4>
                            <p className="course-count">{webinar.date} • {webinar.time}</p>
                            <div className="course-rating">
                                <span className="review-count">Host: {webinar.host}</span>
                            </div>
                        </div>
                        <button className="more-btn" onClick={() => handleRegister(webinar.title)} title="Register">
                            <CalendarPlus size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebinarList;
