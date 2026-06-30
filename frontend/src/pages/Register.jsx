import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight, Globe, User, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const { addToast } = useToast();
  const { t } = useLanguage();

  const validate = () => {
    const tempErrors = {};
    if (!username) tempErrors.username = 'Username is required';
    else if (username.length < 3) tempErrors.username = 'Username must be at least 3 characters';
    
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Valid email is required';
    
    if (!phone) tempErrors.phone = 'Phone number is required';
    else if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      tempErrors.phone = 'Valid phone format expected (e.g. +1234567890)';
    }

    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(loginStart());
    try {
      const response = await API.post('/auth/register', { username, email, phone, password });
      dispatch(loginSuccess(response.data));
      addToast(`Account created! Welcome, ${response.data.username}!`, 'success');
      navigate('/verify', {
        state: {
          emailOtp: response.data._devEmailOtp,
          phoneOtp: response.data._devPhoneOtp,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try a different username/email.';
      dispatch(loginFailure(msg));
      addToast(msg, 'error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 py-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-500">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-sky-500/15 dark:bg-sky-600/10 blur-3xl animate-float-reverse pointer-events-none" />

      {/* Theme Toggle Button */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all duration-300 backdrop-blur-md cursor-pointer shadow-sm hover:scale-105 active:scale-95 z-10"
        aria-label="Toggle Theme"
      >
        {darkMode ? <Sun size={18} className="text-amber-500 animate-pulse" /> : <Moon size={18} />}
      </button>

      {/* Main Glass Box */}
      <div className="w-full max-w-[390px] z-10 animate-fade-in-up duration-500 my-6">
        <div className="glassmorphism p-8 md:p-10 flex flex-col rounded-2xl shadow-xl border border-white/20 dark:border-neutral-800/40">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10 mb-3 hover:rotate-12 transition-transform duration-300">
              <Globe className="text-white w-6 h-6" />
            </div>
            <h2 className="font-sans font-black text-3xl tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 dark:from-indigo-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ConnectSphere
            </h2>
            <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
              {t('signup')}
            </p>
          </div>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative group w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <User size={16} />
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                required
                className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                  errors.username 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                } peer`}
              />
              <label
                htmlFor="username"
                className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                  peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                  peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                  ${username ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
              >
                {t('username')}
              </label>
              {errors.username && (
                <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{errors.username}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="relative group w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <Mail size={16} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                  errors.email 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                } peer`}
              />
              <label
                htmlFor="email"
                className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                  peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                  peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                  ${email ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
              >
                {t('email')}
              </label>
              {errors.email && (
                <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{errors.email}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className="relative group w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder=" "
                required
                className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                  errors.phone 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                } peer`}
              />
              <label
                htmlFor="phone"
                className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                  peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                  peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                  ${phone ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
              >
                {t('phone')}
              </label>
              {errors.phone && (
                <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{errors.phone}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="relative group w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className={`w-full pl-10 pr-10 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                  errors.password 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                } peer`}
              />
              <label
                htmlFor="password"
                className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                  peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                  peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                  ${password ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
              >
                {t('password')}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-md cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative group w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <Lock size={16} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                required
                className={`w-full pl-10 pr-10 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                  errors.confirmPassword 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                } peer`}
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                  peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                  peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                  ${confirmPassword ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
              >
                {t('confirmPassword')}
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-md cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {errors.confirmPassword && (
                <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 text-[11px] font-semibold border border-rose-100 dark:border-rose-950/30 text-center rounded-xl animate-shake">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !email || !phone || password.length < 6 || password !== confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-6 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('signup')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-8">
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-350 hover:underline transition-colors ml-1"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

