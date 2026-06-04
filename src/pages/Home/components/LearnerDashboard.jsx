import React, { useState } from 'react';
import { FiBookOpen, FiClock, FiAward, FiPlayCircle, FiCalendar, FiArrowRight } from "react-icons/fi";
import AdmitCardModal from './AdmitCardModal';
import FaceVerificationModal from './FaceVerificationModal';
import '../Home.css';

const LearnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [selectedExamForCard, setSelectedExamForCard] = useState(null);
    const [showFaceVerify, setShowFaceVerify] = useState(false);

    // Mock Student Data
    const studentData = {
        id: 101,
        name: "Alice Johnson",
        course: "Computer Science",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        enrollmentText: "ST-2024-8842"
    };

    const enrolledCourses = [
        {
            id: 1,
            title: "Advanced React Native Masterclass",
            instructor: "Sarah Wilson",
            progress: 75,
            totalLessons: 48,
            completedLessons: 36,
            lastAccessed: "2 hours ago",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 2,
            title: "UI/UX Design Fundamentals",
            instructor: "Emma Davis",
            progress: 30,
            totalLessons: 24,
            completedLessons: 8,
            lastAccessed: "1 day ago",
            image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 3,
            title: "Python for Data Science",
            instructor: "David Chen",
            progress: 0,
            totalLessons: 60,
            completedLessons: 0,
            lastAccessed: "Not started",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
    ];

    const upcomingEvents = [
        { id: 1, title: "React Live Session - Q&A", time: "Today, 4:00 PM", type: "Live Class" },
        { id: 2, title: "UI Design Quiz", time: "Tomorrow, 10:00 AM", type: "Exam" },
        { id: 3, title: "Submit Project Assignment", time: "Jan 10, 11:59 PM", type: "Deadline" }
    ];

    const availableExams = [
        {
            id: 101,
            title: "Mid-Term Assessment: UI Principles",
            course: "UI/UX Design",
            date: "Jan 06, 2026 • 10:00 AM",
            duration: "60 Mins",
            marks: 50,
            status: "live", // live, upcoming, completed
            attemptsUsed: 0,
            attemptsMax: 2
        },
        {
            id: 102,
            title: "React Hooks Deep Dive",
            course: "Advanced React",
            date: "Jan 08, 2026 • 02:00 PM",
            duration: "45 Mins",
            marks: 30,
            status: "upcoming",
            attemptsUsed: 0,
            attemptsMax: 1
        },
        {
            id: 103,
            title: "Python Basics Quiz",
            course: "Python for Data Science",
            date: "Jan 02, 2026",
            duration: "30 Mins",
            marks: 20,
            status: "completed",
            attemptsUsed: 1,
            attemptsMax: 3
        }
    ];

    return (
        <div className="learner-dashboard animate-fade-in">
            {/* Welcome Section */}
            <div className="learner-welcome-banner mb-5">
                <div className="welcome-text">
                    <h1>Welcome back, <span className="highlight-text">Alice!</span> 👋</h1>
                    <p>You have <strong>2 tasks</strong> pending for today. Let's keep up the momentum!</p>
                    <button className="btn-resume">
                        <FiPlayCircle className="me-2" /> Resume "React Native"
                    </button>
                </div>
                <div className="welcome-stats">
                    <div className="l-stat-item">
                        <div className="icon-box bg-blue-subtle text-blue">
                            <FiBookOpen />
                        </div>
                        <div>
                            <h4>12</h4>
                            <span>Courses</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-green-subtle text-green">
                            <FiAward />
                        </div>
                        <div>
                            <h4>4</h4>
                            <span>Certificates</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-orange-subtle text-orange">
                            <FiClock />
                        </div>
                        <div>
                            <h4>126h</h4>
                            <span>Learning</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-purple-subtle text-purple">
                            <FiCalendar />
                        </div>
                        <div>
                            <h4>85%</h4>
                            <span>Attendance</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-layout">
                {/* Left Column: My Courses & Exams */}
                <div className="main-content-col">
                    {/* Tabs */}
                    <div className="d-flex align-items-center gap-4 border-bottom mb-4 pb-1">
                        <button
                            className={`btn-tab ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            My Courses
                        </button>
                        <button
                            className={`btn-tab ${activeTab === 'exams' ? 'active' : ''}`}
                            onClick={() => setActiveTab('exams')}
                        >
                            Exams & Quizzes
                            {availableExams.some(e => e.status === 'live') && <span className="badge-dot"></span>}
                        </button>
                    </div>

                    {activeTab === 'courses' && (
                        <div className="my-courses-grid animate-slide-up">
                            {enrolledCourses.map(course => (
                                <div key={course.id} className="course-progress-card">
                                    <div className="c-image">
                                        <img src={course.image} alt={course.title} />
                                    </div>
                                    <div className="c-details">
                                        <h4 className="c-title">{course.title}</h4>
                                        <p className="c-instructor">by {course.instructor}</p>

                                        <div className="c-progress">
                                            <div className="progress-info">
                                                <span>{course.progress}% Complete</span>
                                                <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                            </div>
                                            <div className="progress-bar-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${course.progress}%`, background: course.progress === 100 ? '#10b981' : '#3b82f6' }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="c-footer">
                                            <span className="last-access"><FiClock className="me-1" /> {course.lastAccessed}</span>
                                            <button className="btn-continue">
                                                {course.progress === 0 ? 'Start' : 'Continue'} <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="animate-slide-up">
                            {/* Exam Filters */}
                            <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                                <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                                    <option>All Courses</option>
                                    <option>React Native</option>
                                    <option>UI/UX Design</option>
                                </select>
                                <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                                    <option>All Status</option>
                                    <option>Live</option>
                                    <option>Upcoming</option>
                                    <option>Completed</option>
                                </select>
                                <input type="date" className="form-control form-control-sm" style={{ width: 'auto' }} />
                            </div>

                            {/* Exam Cards */}
                            <div className="d-flex flex-column gap-3">
                                {availableExams.map(exam => (
                                    <div key={exam.id} className={`exam-card ${exam.status === 'live' ? 'border-primary' : ''}`}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            {/* ... (Exam Info) */}
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    {exam.status === 'live' && <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1 rounded-pill x-small fw-bold">● LIVE</span>}
                                                    {exam.status === 'upcoming' && <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill x-small fw-bold">UPCOMING</span>}
                                                    {exam.status === 'completed' && <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded-pill x-small fw-bold">COMPLETED</span>}
                                                    <span className="text-muted small fw-bold text-uppercase">{exam.course}</span>
                                                </div>
                                                <h5 className="fw-bold mb-1">{exam.title}</h5>
                                                <div className="d-flex gap-3 text-muted small mt-2">
                                                    <span><FiCalendar className="me-1" /> {exam.date}</span>
                                                    <span><FiClock className="me-1" /> {exam.duration}</span>
                                                    <span><FiAward className="me-1" /> {exam.marks} Marks</span>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="mb-2">
                                                    <span className="small text-muted d-block">Attempts</span>
                                                    <span className="fw-bold">{exam.attemptsUsed} / {exam.attemptsMax === 'unlimited' ? '∞' : exam.attemptsMax}</span>
                                                </div>

                                                <div className="d-flex gap-2 justify-content-end">
                                                    {(exam.status === 'live' || exam.status === 'upcoming') && (
                                                        <button
                                                            className="btn btn-light btn-sm"
                                                            onClick={() => setSelectedExamForCard(exam)}
                                                            title="View Admit Card"
                                                        >
                                                            <i className="bi bi-qr-code"></i>
                                                        </button>
                                                    )}

                                                    {exam.status === 'live' && (
                                                        <button
                                                            className="btn btn-primary btn-sm fw-bold px-4"
                                                            onClick={() => setShowFaceVerify(true)}
                                                        >
                                                            Join Exam
                                                        </button>
                                                    )}
                                                    {exam.status === 'upcoming' && (
                                                        <button className="btn btn-outline-secondary btn-sm px-4" disabled>Starts Soon</button>
                                                    )}
                                                    {exam.status === 'completed' && (
                                                        <button className="btn btn-light btn-sm text-primary px-4">View Result</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Schedule & Quick Actions */}
                <div className="sidebar-col">
                    {/* Schedule */}
                    <div className="dashboard-card mb-4">
                        <div className="card-header-simple">
                            <h3><FiCalendar className="me-2" /> Upcoming Schedule</h3>
                        </div>
                        <div className="schedule-list">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="schedule-item">
                                    <div className="date-box">
                                        <span className="event-type-dot"></span>
                                    </div>
                                    <div className="event-info">
                                        <h5>{event.title}</h5>
                                        <span className="event-time">{event.time}</span>
                                        <span className={`event-badge ${event.type === 'Exam' ? 'badge-red' : 'badge-blue'}`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-block-outline mt-3">View Full Calendar</button>
                    </div>

                    {/* Quick Stats / Achievements */}
                    <div className="dashboard-card bg-gradient-primary text-white">
                        <div className="p-4">
                            <h3 className="mb-3">Weekly Goal</h3>
                            <div className="d-flex align-items-end gap-2 mb-2">
                                <h1 className="mb-0 display-4 fw-bold">4.5</h1>
                                <span className="mb-2 opacity-75">/ 5 hrs</span>
                            </div>
                            <p className="small opacity-75 mb-3">You're almost there! Just 30 mins more to reach your weekly learning goal.</p>
                            <div className="progress-white mb-0">
                                <div className="fill" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AdmitCardModal
                isOpen={!!selectedExamForCard}
                onClose={() => setSelectedExamForCard(null)}
                exam={selectedExamForCard}
                student={studentData}
            />

            <FaceVerificationModal
                isOpen={showFaceVerify}
                onClose={() => setShowFaceVerify(false)}
                onVerified={() => {
                    setShowFaceVerify(false);
                    // Navigate to exam start
                    alert("Verification Successful! Redirecting to Exam...");
                }}
            />

            <style>{`
                .learner-welcome-banner {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                .highlight-text { color: #3b82f6; }
                .welcome-text h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
                .welcome-text p { color: #64748b; margin-bottom: 24px; }
                .btn-resume { 
                    background: #0f172a; color: white; border: none; padding: 10px 24px; 
                    border-radius: 8px; font-weight: 600; display: flex; align-items: center; 
                    cursor: pointer; transition: transform 0.2s;
                }
                .btn-resume:hover { transform: translateY(-2px); background: #1e293b; }

                .welcome-stats { display: flex; gap: 32px; }
                .l-stat-item { display: flex; align-items: center; gap: 16px; }
                .l-stat-item .icon-box { 
                    width: 48px; height: 48px; border-radius: 12px; 
                    display: flex; align-items: center; justify-content: center; font-size: 24px; 
                }
                .l-stat-item h4 { font-size: 20px; font-weight: 700; margin: 0; color: #0f172a; }
                .l-stat-item span { font-size: 13px; color: #64748b; }

                .dashboard-grid-layout {
                    display: grid; grid-template-columns: 1fr 340px; gap: 24px;
                }

                .course-progress-card {
                    background: white; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;
                    display: flex; gap: 20px; margin-bottom: 16px; transition: all 0.2s;
                }
                .course-progress-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .c-image img { width: 140px; height: 100px; border-radius: 8px; object-fit: cover; }
                .c-details { flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .c-title { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; }
                .c-instructor { font-size: 13px; color: #64748b; margin-bottom: 12px; }
                
                .c-progress { margin-bottom: 12px; }
                .progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; font-weight: 500; }
                .progress-bar-track { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
                .progress-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }

                .c-footer { display: flex; justify-content: space-between; align-items: center; }
                .last-access { font-size: 12px; color: #94a3b8; display: flex; align-items: center; }
                .btn-continue { background: none; border: none; color: #3b82f6; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
                .btn-continue:hover { text-decoration: underline; }

                .dashboard-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .card-header-simple { padding: 16px; border-bottom: 1px solid #f1f5f9; }
                .card-header-simple h3 { font-size: 16px; font-weight: 700; margin: 0; display: flex; align-items: center; }
                .schedule-list { padding: 16px; }
                .schedule-item { display: flex; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #f1f5f9; }
                .schedule-item:last-child { margin-bottom: 0; padding-bottom: 0; border: none; }
                .event-info h5 { font-size: 14px; font-weight: 600; margin: 0 0 4px 0; }
                .event-time { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
                .event-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
                .badge-blue { background: #eff6ff; color: #3b82f6; }
                .badge-red { background: #fef2f2; color: #ef4444; }

                .bg-blue-subtle { background: #eff6ff; } .text-blue { color: #3b82f6; }
                .bg-green-subtle { background: #dcfce7; } .text-green { color: #16a34a; }
                .bg-orange-subtle { background: #ffedd5; } .text-orange { color: #c2410c; }
                .bg-purple-subtle { background: #f3e8ff; } .text-purple { color: #9333ea; }

                .btn-block-outline { width: 100%; padding: 10px; border: 1px solid #e2e8f0; background: none; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; }
                .btn-block-outline:hover { background: #f8fafc; }

                .progress-white { background: rgba(255,255,255,0.2); height: 6px; border-radius: 10px; overflow: hidden; }
                .progress-white .fill { background: white; height: 100%; border-radius: 10px; }

                @media (max-width: 1024px) {
                    .dashboard-grid-layout { grid-template-columns: 1fr; }
                    .sidebar-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                }
                @media (max-width: 768px) {
                    .learner-welcome-banner { flex-direction: column; align-items: flex-start; gap: 24px; }
                    .welcome-stats { width: 100%; justify-content: space-between; flex-wrap: wrap; }
                    .sidebar-col { grid-template-columns: 1fr; }
                    .course-progress-card { flex-direction: column; }
                    .c-image img { width: 100%; height: 160px; }
                    .c-footer { flex-wrap: wrap; gap: 12px; }
                }

                /* New Tab Styles */
                .btn-tab {
                    background: none; border: none; padding: 8px 0; margin-right: 0;
                    color: #64748b; font-weight: 600; font-size: 15px; position: relative;
                    cursor: pointer; transition: color 0.2s;
                }
                .btn-tab:hover { color: #0f172a; }
                .btn-tab.active { color: #0f172a; }
                .btn-tab.active::after {
                    content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #0f172a; border-radius: 2px;
                }
                .badge-dot {
                    width: 6px; height: 6px; background: #ef4444; border-radius: 50%;
                    display: inline-block; vertical-align: top; margin-left: 4px;
                }

                /* Exam Card Styles */
                .exam-card { 
                    background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; 
                    transition: all 0.2s;
                }
                .exam-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .x-small { font-size: 11px; }
            `}</style>
        </div>
    );
};

export default LearnerDashboard;
