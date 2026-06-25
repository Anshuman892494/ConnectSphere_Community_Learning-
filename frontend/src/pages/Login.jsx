import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

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
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex justify-center items-center gap-2">
          <span>🌐</span> ConnectSphere
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The Hub for Community Knowledge Sharing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="p-8 shadow bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.email && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.password
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.password && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.password}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-200 dark:border-darkborder text-primary-600 focus:ring-primary-500 focus:ring-offset-0 bg-transparent"
                />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Remember Me
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 rounded-xl text-xs font-semibold border border-rose-100 dark:border-rose-950/30">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to ConnectSphere?{' '}
              <Link
                to="/register"
                className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
