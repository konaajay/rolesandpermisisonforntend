import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertTriangle, FiCamera } from 'react-icons/fi';

const FaceVerificationModal = ({ isOpen, onClose, onVerified }) => {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, scanning, verified, failed
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let stream = null;
        if (isOpen) {
            startCamera();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setStatus('error');
        }
    };

    const handleVerify = () => {
        setStatus('scanning');
        // Simulate scanning process
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setStatus('verified');
                setTimeout(() => {
                    onVerified();
                }, 1000);
            }
        }, 30);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-backdrop-custom" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="modal-content-custom face-modal"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-body-custom p-0 overflow-hidden text-center">
                        <div className="position-relative bg-black" style={{ height: '400px' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                            />

                            {/* Overlay Frame */}
                            <div className="overlay-frame">
                                <div className={`scan-frame ${status === 'scanning' ? 'scanning' : ''} ${status === 'verified' ? 'verified' : ''}`}>
                                    <div className="corner tl"></div>
                                    <div className="corner tr"></div>
                                    <div className="corner bl"></div>
                                    <div className="corner br"></div>
                                    {status === 'scanning' && <div className="scanner-line"></div>}
                                </div>
                            </div>

                            {/* Status Overlay */}
                            <div className="status-overlay">
                                {status === 'idle' && (
                                    <p className="text-white mb-0 bg-dark bg-opacity-50 px-3 py-1 rounded-pill">
                                        <FiCamera className="me-2" /> Position your face in the frame
                                    </p>
                                )}
                                {status === 'scanning' && (
                                    <div className="text-white">
                                        <p className="mb-2">Verifying Identity...</p>
                                        <div className="progress" style={{ height: '6px', width: '200px', background: 'rgba(255,255,255,0.2)' }}>
                                            <div className="progress-bar bg-success" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                {status === 'verified' && (
                                    <div className="text-success bg-white px-4 py-2 rounded-pill shadow-sm animate-bounce-in">
                                        <FiCheckCircle className="me-2 fs-5" /> <span className="fw-bold">Verified Successfully</span>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="text-danger bg-white px-4 py-2 rounded-pill shadow-sm">
                                        <FiAlertTriangle className="me-2" /> Camera Error
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white">
                            <h5 className="fw-bold mb-2">Identity Verification</h5>
                            <p className="text-muted small mb-4">
                                reliable AI security check to ensure candidate authenticity before the exam starts.
                            </p>

                            {status === 'idle' && (
                                <button className="btn btn-primary px-5 rounded-pill fw-bold" onClick={handleVerify}>
                                    Start Verification
                                </button>
                            )}
                            {status === 'scanning' && (
                                <button className="btn btn-light px-5 rounded-pill fw-bold text-muted" disabled>
                                    Scanning...
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                <style>{`
                    .modal-backdrop-custom {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.85); z-index: 1060;
                        display: flex; align-items: center; justify-content: center;
                        backdrop-filter: blur(8px);
                    }
                    .modal-content-custom.face-modal {
                        width: 90%; max-width: 500px;
                        background: white; border-radius: 20px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        overflow: hidden;
                    }
                    .overlay-frame {
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        display: flex; align-items: center; justify-content: center;
                        pointer-events: none;
                    }
                    .scan-frame {
                        width: 280px; height: 350px; border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 180px; position: relative;
                        transition: all 0.3s;
                    }
                    .scan-frame.verified { border-color: #22c55e; box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
                    
                    .scanner-line {
                        position: absolute; width: 100%; height: 2px; background: #22c55e;
                        top: 0; animation: scan 2s infinite linear;
                        box-shadow: 0 0 10px #22c55e;
                    }
                    
                    .status-overlay {
                        position: absolute; bottom: 30px; left: 0; width: 100%;
                        display: flex; justify-content: center;
                        z-index: 10;
                    }

                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default FaceVerificationModal;
