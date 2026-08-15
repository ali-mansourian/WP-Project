import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Music, Eye, EyeOff, Mail, Lock, Sparkles, Upload, FileAudio, Trash2, Loader2 } from 'lucide-react';
import './Auth.css';

export const ArtistSignupPage: React.FC = () => {
  const { registerArtist } = useMockState();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [stageName, setStageName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Validation/Error states
  const [errors, setErrors] = useState<{
    stageName?: string;
    email?: string;
    password?: string;
    portfolio?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!stageName.trim()) {
      newErrors.stageName = 'Stage name or alias is required';
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

    if (portfolioFiles.length === 0) {
      newErrors.portfolio = 'Please upload at least one demo track or portfolio sample';
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
      if (!registerArtist) {
        throw new Error('Artist registration service is temporarily unavailable. Please try again later.');
      }
      
      // NOW ASYNCHRONOUS
      const result = await registerArtist(stageName, email, password, portfolioFiles);
      
      if (result && result.success) {
        setSubmitSuccess('Artist profile registered! Your application status has been set to "Pending Approval".');
        setTimeout(() => {
          // Redirection to dashboard (renders the Pending Review screen for pending status)
          navigate('/dashboard');
        }, 1500);
      } else {
        setSubmitError(result ? result.message : 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Artist signup failure:", err);
      setSubmitError(err.message || 'An unexpected error occurred during registration. Please try again.');
      setIsLoading(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setPortfolioFiles((prev) => [...prev, ...filesArray]);
      if (errors.portfolio) setErrors({ ...errors, portfolio: undefined });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      setPortfolioFiles((prev) => [...prev, ...filesArray]);
      if (errors.portfolio) setErrors({ ...errors, portfolio: undefined });
    }
  };

  const removeFile = (idx: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const triggerFileSelect = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="auth-header">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <h2 className="auth-title">Creator Signup</h2>
          <p className="auth-subtitle">Apply for certification to release high fidelity tracks</p>
        </div>

        {/* Global submission alerts */}
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

        {/* Artist Signup Form */}
        <form onSubmit={handleSignupSubmit} className="auth-form" onDragEnter={handleDrag}>
          
          {/* Stage Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="artist-stage-name">Stage Name / Alias</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="artist-stage-name"
                type="text"
                placeholder="e.g. DJ SynthWave"
                value={stageName}
                disabled={isLoading}
                onChange={(e) => {
                  setStageName(e.target.value);
                  if (errors.stageName) setErrors({ ...errors, stageName: undefined });
                }}
                className={`form-input w-full pl-10 ${errors.stageName ? 'input-error' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.stageName && <span className="error-message">{errors.stageName}</span>}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="artist-email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="artist-email"
                type="email"
                placeholder="e.g. producer@example.com"
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="artist-pass">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="artist-pass"
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

          {/* Portfolio Sample Upload */}
          <div className="form-group">
            <label className="form-label">Portfolio Track Samples (.mp3, .wav)</label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*"
              disabled={isLoading}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              className={`file-upload-zone ${dragActive ? 'border-emerald-500 bg-[#222222]' : ''} ${errors.portfolio ? 'border-rose-500' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <Upload className="file-upload-icon" />
              <p className="file-upload-text">
                <span className="file-upload-highlight">Click to select files</span> or drag and drop your demo recordings here
              </p>
            </div>

            {errors.portfolio && <span className="error-message mt-1">{errors.portfolio}</span>}

            {/* Uploaded portfolio tracks list */}
            {portfolioFiles.length > 0 && (
              <div className="uploaded-files-list">
                <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block mb-1">
                  Selected Demo Samples ({portfolioFiles.length})
                </span>
                {portfolioFiles.map((f, idx) => (
                  <div key={idx} className="uploaded-file-item">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="uploaded-file-name" title={f.name}>{f.name}</span>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="remove-file-btn hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className="submit-btn w-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            {isLoading ? 'Submitting Application...' : 'Submit Creator Application'}
          </button>
        </form>

        {/* Footnote links */}
        <div className="auth-footer">
          <p>
            Already registered? <Link to="/login" className="auth-link">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};