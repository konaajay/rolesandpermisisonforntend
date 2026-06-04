import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdmitCardModal = ({ isOpen, onClose, exam, student }) => {
    if (!isOpen || !exam) return null;

    // Data to be encoded in QR
    const qrData = JSON.stringify({
        studentId: student.id,
        examId: exam.id,
        action: 'verify_attendance',
        timestamp: new Date().toISOString()
    });

    return (
        <AnimatePresence>
            <div className="modal-backdrop-custom" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="modal-content-custom admit-card-modal"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-header-custom">
                        <h5 className="mb-0 fw-bold">Exam Admit Card</h5>
                        <button className="btn-icon" onClick={onClose}><FiX /></button>
                    </div>

                    <div className="modal-body-custom p-0">
                        <div className="admit-card-paper">
                            {/* Header */}
                            <div className="ac-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="ac-logo-box">
                                            <span className="fw-bold text-primary fs-4">A</span>
                                        </div>
                                        <div>
                                            <h4 className="mb-0 fw-bold text-uppercase">Academy LMS</h4>
                                            <small className="text-muted">Official Examination Pass</small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <h6 className="mb-1 text-muted small">Admit Card ID</h6>
                                        <span className="font-monospace fw-bold">AC-{exam.id}-{student.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ac-body">
                                <div className="row g-4">
                                    {/* Student Details */}
                                    <div className="col-md-8">
                                        <div className="row g-3">
                                            <div className="col-4">
                                                <div className="student-photo-box">
                                                    <img src={student.image || 'https://via.placeholder.com/150'} alt="Student" />
                                                </div>
                                            </div>
                                            <div className="col-8">
                                                <h5 className="fw-bold mb-1">{student.name}</h5>
                                                <p className="text-muted mb-3">{student.course}</p>

                                                <div className="d-grid gap-2">
                                                    <div>
                                                        <small className="text-muted d-block x-small uppercase fw-bold">Student ID</small>
                                                        <span className="fw-bold">{student.enrollmentText || 'STD-2024-001'}</span>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block x-small uppercase fw-bold">Exam Center</small>
                                                        <span>Online / Remote Proctoring</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-top">
                                            <h6 className="fw-bold mb-3">Exam Details</h6>
                                            <div className="bg-light p-3 rounded">
                                                <h5 className="mb-2 text-primary">{exam.title}</h5>
                                                <div className="d-flex gap-4 text-muted small">
                                                    <span><i className="bi bi-calendar me-2"></i>{exam.date}</span>
                                                    <span><i className="bi bi-clock me-2"></i>{exam.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="col-md-4">
                                        <div className="qr-box-container">
                                            <div className="qr-frame">
                                                <QRCodeSVG
                                                    value={qrData}
                                                    size={140}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <p className="text-center small text-muted mt-2 mb-0">
                                                Scan to Verify &<br />Mark Attendance
                                            </p>
                                            <div className="mt-3 text-center">
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                                                    Allowed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="ac-footer">
                                <p className="mb-0 x-small text-muted text-center">
                                    Show this QR code to the proctor or scan it at the exam terminal to begin.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer-custom">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                            <FiPrinter className="me-2" /> Print
                        </button>
                        <button className="btn btn-primary btn-sm">
                            <FiDownload className="me-2" /> Download
                        </button>
                    </div>
                </motion.div>

                <style>{`
                    .modal-backdrop-custom {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.6); z-index: 1050;
                        display: flex; align-items: center; justify-content: center;
                        backdrop-filter: blur(4px);
                    }
                    .modal-content-custom.admit-card-modal {
                        width: 90%; max-width: 700px;
                        background: white; border-radius: 12px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .modal-header-custom {
                        padding: 16px 24px; border-bottom: 1px solid #e2e8f0;
                        display: flex; justify-content: space-between; align-items: center;
                        background: #f8fafc;
                    }
                    .modal-footer-custom {
                        padding: 16px 24px; border-top: 1px solid #e2e8f0;
                        display: flex; justify-content: flex-end; gap: 12px;
                        background: #f8fafc;
                    }
                    
                    /* Admit Card Paper Styles */
                    .admit-card-paper {
                        background: white;
                        /* Create a paper texture or pattern if desired */
                    }
                    .ac-header {
                        padding: 24px; border-bottom: 2px dashed #cbd5e1;
                    }
                    .ac-logo-box {
                        width: 48px; height: 48px; background: #eff6ff;
                        border-radius: 8px; display: flex; align-items: center; justify-content: center;
                    }
                    .ac-body {
                        padding: 24px;
                    }
                    
                    .student-photo-box {
                        width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden;
                        border: 1px solid #e2e8f0;
                        background: #f1f5f9;
                    }
                    .student-photo-box img {
                        width: 100%; height: 100%; object-fit: cover;
                    }
                    
                    .qr-box-container {
                        background: #f8fafc; border: 1px solid #e2e8f0;
                        border-radius: 12px; padding: 16px;
                        display: flex; flex-direction: column; align-items: center;
                        height: 100%; justify-content: center;
                    }
                    .qr-frame {
                        background: white; padding: 8px; border-radius: 8px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    }
                    
                    .ac-footer {
                        padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;
                    }
                    
                    .x-small { font-size: 11px; }
                    .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
                    .btn-icon { background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer; }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default AdmitCardModal;
