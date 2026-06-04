import React from 'react';
import { toast } from 'react-toastify';

const BatchList = ({ batches }) => {
    const handleSeeAll = () => {
        toast.info("Loading all upcoming batches...");
    };

    const handleEnroll = (batchName) => {
        toast.info(`Checking enrollment for ${batchName}`);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <h3 className="card-title">Upcoming Batches</h3>
                <button className="view-all-btn" onClick={handleSeeAll}>See All</button>
            </div>
            <div className="instructor-list"> {/* Reusing instructor-list class for layout if appropriate, or adjust */}
                {batches.map((batch) => (
                    <div key={batch.id} className="instructor-item" style={{ alignItems: 'center' }}>
                        <div className="course-icon" style={{ backgroundColor: `${batch.color}20`, color: batch.color, width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold' }}>
                            {batch.name.charAt(0)}
                        </div>
                        <div className="instructor-info">
                            <h4 className="instructor-name">{batch.name}</h4>
                            <p className="instructor-role">Starts: {batch.startDate}</p>
                            <p className="instructor-role" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {batch.enrolled}/{batch.maxSeats} Enrolled
                            </p>
                        </div>
                        <button className="course-btn" onClick={() => handleEnroll(batch.name)}>Enroll</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BatchList;
