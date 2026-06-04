import React from 'react';

const WelcomeBanner = () => {
    return (
        <div className="welcome-banner">
            <div className="banner-content">
                <h2 className="banner-title">Learn With Effectively With Us!</h2>
                <p className="banner-subtitle">Get 30% off every course on January.</p>

                <div className="banner-stats">
                    <div className="banner-stat-item">
                        <div className="icon-circle red-icon">
                            <i className="bi bi-mortarboard-fill"></i>
                        </div>
                        <div className="stat-group">
                            <p className="stat-label">Students</p>
                            <p className="stat-number">75,000+</p>
                        </div>
                    </div>
                    <div className="banner-stat-item">
                        <div className="icon-circle yellow-icon">
                            <i className="bi bi-person-video3"></i>
                        </div>
                        <div className="stat-group">
                            <p className="stat-label">Expert Mentors</p>
                            <p className="stat-number">200+</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="banner-image-container">
                {/* Illustration matching the screenshot */}
                <div className="illustration-placeholder">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/books-3d-icon-download-in-png-blend-fbx-gltf-file-formats--stacked-library-education-school-pack-icons-5227768.png" alt="Education" className="banner-img-overlay" />
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
