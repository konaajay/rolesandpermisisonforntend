import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';
import Modal from '../components/Modal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState(null);

  // Forgot password state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMessage, setFpMessage] = useState('');

  React.useEffect(() => {
    const hostname = window.location.hostname;
    // Skip if localhost or standard IP/base domains (customize as needed)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      api.get(`/public/tenant-branding?domain=${hostname}`)
        .then(res => {
          if (res.data) setBranding(res.data);
        })
        .catch(() => {});
    }
  }, []);

  const { login: authLogin } = useAuth();
  const { setCurrentUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, tenantCode: respTenantCode, roleName, permissions, modules } = response.data;
      
      // Setup both AuthContext and Zustand AppStore
      authLogin(token, permissions, modules, respTenantCode);
      
      // External vendor (role literally named VENDOR) → simple vendor portal
      // Internal staff with VENDOR module access → VendorOS dashboard
      // Everyone else → main dashboard
      const isExternalVendor = roleName && roleName.toUpperCase() === 'VENDOR';
      const hasVendorModule = Array.isArray(modules) && modules.includes('VENDOR');
      
      const storeRole = isExternalVendor ? 'VENDOR' : 'STAFF';
      setCurrentUser(email, storeRole);
      
      if (isExternalVendor) {
        navigate('/vendor-portal');
      } else if (hasVendorModule) {
        navigate('/vendor-dashboard/analytics');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpMessage('');
    try {
      await api.post('/auth/forgot-password', { email: fpEmail });
      setFpStep(2);
      setFpMessage('OTP sent to your email.');
    } catch (err) {
      setFpMessage(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (fpNewPassword.length < 8) {
        setFpMessage('Password must be at least 8 characters long');
        return;
    }
    setFpLoading(true);
    setFpMessage('');
    try {
      await api.post('/auth/reset-password-otp', { email: fpEmail, otp: fpOtp, newPassword: fpNewPassword });
      setFpMessage('Password reset successfully! You can now log in.');
      setFpStep(1);
      setTimeout(() => {
          setIsForgotPasswordOpen(false);
          setFpMessage('');
      }, 2000);
    } catch (err) {
      setFpMessage(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-4 shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
              <span className="text-3xl font-bold text-cyan-400">V</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-50">
            {branding?.companyName ? `Welcome to ${branding.companyName}` : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <Modal isOpen={!!error} onClose={() => setError('')} title="Login Failed">
          <div className="text-center text-slate-300 p-4">
            <p className="mb-6 text-rose-400">{error}</p>
            <button 
              onClick={() => setError('')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>

        <Modal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} title="Reset Password">
            <div className="p-4 text-slate-200">
                {fpMessage && <div className={`mb-4 p-3 rounded-lg text-sm ${fpMessage.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>{fpMessage}</div>}
                
                {fpStep === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Enter your Email</label>
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600"
                                value={fpEmail}
                                onChange={(e) => setFpEmail(e.target.value)}
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsForgotPasswordOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                            <button type="submit" disabled={fpLoading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50">
                                {fpLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
                            <input
                                type="text"
                                required
                                placeholder="123456"
                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600"
                                value={fpOtp}
                                onChange={(e) => setFpOtp(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600"
                                value={fpNewPassword}
                                onChange={(e) => setFpNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setFpStep(1)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Back</button>
                            <button type="submit" disabled={fpLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50">
                                {fpLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">


          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <button 
                type="button" 
                onClick={() => { setFpStep(1); setFpMessage(''); setFpEmail(email); setIsForgotPasswordOpen(true); }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-8 relative z-10">
          <span className="text-slate-400 text-sm">
            Don't have an account? <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign Up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
