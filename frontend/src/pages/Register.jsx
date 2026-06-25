import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppCard from '../components/layout/AppCard';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
      const response = await API.post('/auth/register', { username, email, password });
      dispatch(loginSuccess(response.data));
      addToast(`Account created! Welcome, ${response.data.username}!`, 'success');
      navigate('/');
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
        <AppCard className="p-8 shadow-xl bg-white dark:bg-darkcard border border-slate-100 dark:border-darkborder glassmorphism">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <AppInput
              label="Username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="johndoe"
              required
            />

            <AppInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <AppInput
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <AppInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 rounded-xl text-xs font-semibold border border-rose-100 dark:border-rose-950/30">
                ⚠️ {error}
              </div>
            )}

            <div>
              <AppButton
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={isLoading}
              >
                Sign Up
              </AppButton>
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
        </AppCard>
      </div>
    </div>
  );
};

export default Register;
