import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Music, Eye, EyeOff, User, Mail, Lock, Calendar, ClipboardCheck, X, Loader2 } from 'lucide-react';
import './Auth.css';

export const ListenerSignupPage: React.FC = () => {
  const { registerListener } = useMockState();
  const navigate = useNavigate();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation/Error states
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    dob?: string;
    agreePolicy?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Policy modal visibility
  const [policyOpen, setPolicyOpen] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    if (!agreePolicy) {
      newErrors.agreePolicy = 'You must review and agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      setSubmitError('Please resolve the form validation errors highlighted below before proceeding.');
      return;
    }

    setIsLoading(true);
    try {
      if (!registerListener) {
        throw new Error('Listener registration service is temporarily unavailable. Please try again later.');
      }
      
      // NOW ASYNCHRONOUS
      const result = await registerListener(displayName, email, password, dob, gender);
      
      if (result && result.success) {
        setSubmitSuccess('Registration successful! Launching your free stream plan...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setSubmitError(result ? result.message : 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Listener signup failure:", err);
      setSubmitError(err.message || 'An unexpected error occurred during registration. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card max-w-[540px]">
        
        {/* Brand Header */}
        <div className="auth-header">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Music className="text-black w-6 h-6" />
          </div>
          <h2 className="auth-title font-sans">Create Listener Account</h2>
          <p className="auth-subtitle">Get unlimited access to curated high fidelity audio tracks</p>
        </div>

        {/* Form error notification */}
        {submitError && (
          <div className="alert-box alert-error mb-4">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="alert-box alert-success mb-4">
            {submitSuccess}
          </div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSignupSubmit} className="auth-form">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="disp-name">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  id="disp-name"
                  type="text"
                  placeholder="e.g. Alex Carter"
                  value={displayName}
                  disabled={isLoading}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) setErrors({ ...errors, displayName: undefined });
                  }}
                  className={`form-input w-full pl-10 ${errors.displayName ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.displayName && <span className="error-message">{errors.displayName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="listener-email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  id="listener-email"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`form-input w-full pl-10 ${errors.email ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="listener-pass">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  id="listener-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`form-input w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="listener-confirm-pass">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  id="listener-confirm-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  disabled={isLoading}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`form-input w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label" htmlFor="listener-dob">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  id="listener-dob"
                  type="date"
                  value={dob}
                  disabled={isLoading}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (errors.dob) setErrors({ ...errors, dob: undefined });
                  }}
                  className={`form-input w-full pl-10 ${errors.dob ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>

            {/* Gender Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="listener-gender">Gender</label>
              <select
                id="listener-gender"
                value={gender}
                disabled={isLoading}
                onChange={(e) => setGender(e.target.value)}
                className={`form-input w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Privacy Policy Checkbox & Modal Trigger */}
          <div className="form-group">
            <div className="flex items-start gap-2.5">
              <input
                id="policy-chk"
                type="checkbox"
                checked={agreePolicy}
                disabled={isLoading}
                onChange={(e) => {
                  setAgreePolicy(e.target.checked);
                  if (errors.agreePolicy) setErrors({ ...errors, agreePolicy: undefined });
                }}
                className={`checkbox-input ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label htmlFor="policy-chk" className="text-xs text-zinc-400 leading-normal select-none">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => setPolicyOpen(true)}
                  disabled={isLoading}
                  className="text-emerald-400 underline font-semibold hover:text-emerald-300 cursor-pointer disabled:opacity-50"
                >
                  Privacy Policy terms & agreements
                </button>
              </label>
            </div>
            {errors.agreePolicy && <span className="error-message">{errors.agreePolicy}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="submit-btn w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating Account...' : 'Complete Registration & Stream'}
          </button>
        </form>

        {/* Footnote */}
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
          </p>
        </div>
      </div>

      {/* Privacy Policy terms popup */}
      {policyOpen && (
        <div className="forgot-pass-modal-overlay z-50">
          <div className="forgot-pass-modal max-w-lg">
            <button
              onClick={() => setPolicyOpen(false)}
              className="close-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="modal-title flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              <span>Platform Privacy Policy</span>
            </h3>
            <div className="modal-desc space-y-3 max-h-80 overflow-y-auto pr-1 text-xs text-zinc-400 scrollbar-thin mt-4 text-left">
              <p className="font-semibold text-white">1. Information We Collect</p>
              <p>
                We capture display profiles, emails, encrypted password hashes, age profiles (to enforce streaming legal requirements), and user-authored playlist selections locally inside your browser sandbox and our secure servers.
              </p>
              
              <p className="font-semibold text-white">2. Data Persistence</p>
              <p>
                No telemetry, audio logs, credentials, or personal profiles are transmitted to third-party advertising companies. Your data is strictly used to provide streaming services.
              </p>

              <p className="font-semibold text-white">3. Premium Tier Upgrades</p>
              <p>
                Upgrading to our Silver or Gold streaming models charges via secure payment gateways.
              </p>

              <p className="font-semibold text-white">4. User Rights</p>
              <p>
                You may request account deletion at any time from your settings panel to completely wipe your listener profiles, playlist histories, and credentials.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900 mt-4">
              <button
                onClick={() => {
                  setAgreePolicy(true);
                  setPolicyOpen(false);
                  if (errors.agreePolicy) setErrors({ ...errors, agreePolicy: undefined });
                }}
                className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer"
              >
                I Agree & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};