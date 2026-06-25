import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { addToast } = useToast();

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
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex justify-center items-center gap-2">
          <span>🌐</span> ConnectSphere
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create an account to join the community learning network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="p-8 shadow bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.username
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.username && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.username}</span>
              )}
            </div>

            {/* Email Address */}
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

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.phone
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.phone && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.phone}</span>
              )}
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.confirmPassword && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Error message */}
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
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing Up...</span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
