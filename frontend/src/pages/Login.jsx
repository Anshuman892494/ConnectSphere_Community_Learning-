import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    if (searchParams.get('expired')) {
      addToast('Your session has expired. Please log in again.', 'warning');
    }
  }, [searchParams, addToast]);

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Valid email is required';
    
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(loginStart());
    try {
      const response = await API.post('/auth/login', { email, password, rememberMe });
      dispatch(loginSuccess(response.data));
      addToast(`Welcome back, ${response.data.username}!`, 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(loginFailure(msg));
      addToast(msg, 'error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-500">
      
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
      <div className="w-full max-w-[380px] z-10 animate-fade-in-up duration-500">
        <div className="glassmorphism p-8 md:p-10 flex flex-col rounded-2xl shadow-xl border border-white/20 dark:border-neutral-800/40">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10 mb-3 hover:rotate-12 transition-transform duration-300">
              <Globe className="text-white w-6 h-6" />
            </div>
            <h2 className="font-sans font-black text-3xl tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 dark:from-indigo-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ConnectSphere
            </h2>
            <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
              Community Learning
            </p>
          </div>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Email Field with Floating Label */}
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

            {/* Password Field with Floating Label & Toggle */}
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

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 text-[11px] font-semibold border border-rose-100 dark:border-rose-950/30 text-center rounded-xl animate-shake">
                {error}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs px-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer group text-neutral-500 dark:text-neutral-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-neutral-300 dark:border-neutral-800 text-indigo-600 focus:ring-indigo-500/25 dark:bg-neutral-900/60 transition-all duration-200 cursor-pointer"
                />
                <span className="group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                  {t('rememberMe')}
                </span>
              </label>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isLoading || !email || password.length < 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-6 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('login')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full my-6">
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800/80" />
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {t('or')}
            </span>
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800/80" />
          </div>

          {/* Social Logins */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => addToast('Google login is not implemented yet', 'info')}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800/85 bg-white/50 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.64 5.64 0 0 1 8.35 13a5.64 5.64 0 0 1 5.64-5.6c1.478 0 2.822.56 3.84 1.48l3.18-3.18C18.99 3.86 16.59 2.8 13.99 2.8A10.2 10.2 0 0 0 3.8 13a10.2 10.2 0 0 0 10.19 10.2c5.61 0 10.21-4.07 10.21-10.2 0-.62-.06-1.22-.16-1.8H12.24Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>


          {/* Switch to Register / Forgot Password Link bottom */}
          <div className="flex flex-col gap-2.5 items-center mt-8 text-xs">
            <Link
              to="/forgot-password"
              className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              {t('forgotPassword')}
            </Link>
            <div className="text-neutral-500 dark:text-neutral-400">
              {t('dontHaveAccount')}{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors ml-1"
              >
                {t('signup')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

