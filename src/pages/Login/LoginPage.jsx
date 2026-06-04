import React, { useState } from 'react';
import { useAuth } from '../Library/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { GraduationCap, BarChart, BookOpen, Lock, Eye, EyeOff, LayoutGrid, BookCopy } from 'lucide-react';
import './Login.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { settings } = useSettings();

    const siteName = settings?.generalSettings?.siteName || 'Class X 360';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side: Brand & Roles */}
                <div className="login-left">
                    <div className="brand-section">
                        <div className="brand-icon-circle">
                            <BookOpen size={40} />
                        </div>
                        <h1 className="brand-title">{siteName}</h1>
                        <p className="brand-subtitle">
                            Your complete Learning Management System. 
                            Smarter learning. Seamless management.
                        </p>
                    </div>

                    <div className="role-selectors">
                        <div className="role-card">
                            <div className="role-icon student"><GraduationCap size={18} /></div>
                            <div className="role-info">
                                <h4 className="role-name">Students</h4>
                                <p className="role-desc">Track progress, attend batches, view fees</p>
                            </div>
                        </div>
                        <div className="role-card">
                            <div className="role-icon admin"><BarChart size={18} /></div>
                            <div className="role-info">
                                <h4 className="role-name">Admins</h4>
                                <p className="role-desc">Manage courses, fees, users & reports</p>
                            </div>
                        </div>
                        <div className="role-card">
                            <div className="role-icon librarian"><BookCopy size={18} /></div>
                            <div className="role-info">
                                <h4 className="role-name">Librarians</h4>
                                <p className="role-desc">Issue books and manage library resources</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="login-right">
                    <div className="login-form-card">
                        <div className="form-header">
                            <h2>Welcome back 👋</h2>
                            <p>Sign in to your account to continue</p>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="field-label">Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="admin@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="field-label">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button className="submit-btn" disabled={isLoading} type="submit">
                                {isLoading ? (
                                    <>Signing In...</>
                                ) : (
                                    <>
                                        <Lock size={18} fill="currentColor" style={{ opacity: 0.8 }} />
                                        Sign In
                                    </>
                                )}
                            </button>

                            <p className="trouble-text">
                                Having trouble? <a href="#">Contact your administrator</a>.
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            <footer className="page-footer">
                &copy; 2026 {siteName}. All rights reserved.
            </footer>
        </div>
    );
};

export default LoginPage;
