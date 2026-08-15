import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Music, Eye, EyeOff, Mail, Lock, ShieldAlert, CheckCircle2, HelpCircle, X, Loader2 } from 'lucide-react';
import './Auth.css';

export const LoginPage: React.FC = () => {
  const { authenticateUser } = useMockState();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation/Error states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // NOW ASYNCHRONOUS
      const result = await authenticateUser(email, password);
      
      if (result.success && result.user) {
        setAuthSuccess(`Welcome back, ${result.user.name}!`);
        setTimeout(() => {
          // Route users dynamically to their correct role dashboard
          const role = result.user?.role;
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else if (role === 'support') {
            navigate('/support-agent-dashboard');
          } else if (role === 'artist') {
            if (result.user?.status === 'pending' || result.user?.status === 'rejected') {
              navigate('/dashboard'); // ProtectedRoute will render the Pending screen
            } else {
              navigate('/artist-dashboard');
            }
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        setAuthError(result.message);
        setIsLoading(false);
      }
    } catch (error: any) {
      setAuthError(error.message || 'An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    } else if (!emailRegex.test(forgotEmail)) {
      setForgotError('Invalid email format.');
      return;
    }

    // Simulate sending password reset instructions
    setForgotSuccess(`We have dispatched a secure password reset link to ${forgotEmail}. Please check your inbox and spam folders!`);
    setForgotEmail('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        
        {/* Brand Banner */}
        <div className="auth-header">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Music className="text-black w-6 h-6" />
          </div>
          <h2 className="auth-title">Welcome to Spotify-Like</h2>
          <p className="auth-subtitle">Phase 1 Secure Identity Portal</p>
        </div>

        {/* Global Alert Notification */}
        {authError && (
          <div className="alert-box alert-error flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="alert-box alert-success flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Core login form */}
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="login-email"
                type="email"
                placeholder="e.g. alex@free.com"
                value={email}
                disabled={isLoading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`form-input w-full pl-10 ${errors.email ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center">
              <label className="form-label" htmlFor="login-password">Password</label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                disabled={isLoading}
                className="text-xs text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                disabled={isLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`form-input w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="submit-btn w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Authenticating...' : 'Log In to Dashboard'}
          </button>
        </form>

        {/* Footer info/links */}
        <div className="auth-footer space-y-3">
          <p>
            New listener? <Link to="/signup/listener" className="auth-link">Register Listener account</Link>
          </p>
          <p>
            Are you an artist? <Link to="/signup/artist" className="auth-link">Sign up as Creator</Link>
          </p>
          <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono">
            Standard mock pass: <strong className="text-zinc-500">password</strong>
          </div>
        </div>
      </div>

      {/* Forgot Password modal */}
      {forgotOpen && (
        <div className="forgot-pass-modal-overlay">
          <div className="forgot-pass-modal">
            <button
              onClick={() => {
                setForgotOpen(false);
                setForgotError(null);
                setForgotSuccess(null);
                setForgotEmail('');
              }}
              className="close-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="modal-title flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <span>Forgot Password</span>
            </h3>
            <p className="modal-desc">
              Enter your email address and we will dispatch a secure link to reset your password credentials.
            </p>

            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400 mb-4 animate-in fade-in">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-400 mb-4 animate-in fade-in">
                {forgotSuccess}
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">Account Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="e.g. alex@free.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="submit-btn w-full">
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};