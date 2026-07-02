import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    if (searchParams.get('expired')) {
      addToast('Your session has expired. Please log in again.', 'warning');
    }
  }, [searchParams, addToast]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        dispatch(loginStart());
        const response = await API.post('/auth/google', { token: tokenResponse.access_token });
        dispatch(loginSuccess(response.data));
        addToast(`Welcome, ${response.data.username}!`, 'success');
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.message || 'Google Login failed.';
        dispatch(loginFailure(msg));
        addToast(msg, 'error');
      }
    },
    onError: (error) => {
      console.error('Google Login Failed', error);
      addToast('Google Login failed. Please try again.', 'error');
    }
  });

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
      const response = await API.post('/auth/login', { email, password, rememberMe: true });
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F1F2F3] text-[#242729] font-sans">
      
      {/* Small Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="text-[#F48024] w-8 h-8" />
          <span className="text-[24px] font-normal text-gray-800">
            connect<span className="font-bold text-black">sphere</span>
          </span>
        </div>
      </div>

      {/* OAuth Buttons container */}
      <div className="w-full max-w-[290px] mb-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[5px] border border-gray-300 bg-white text-[13px] text-[#3B4045] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.64 5.64 0 0 1 8.35 13a5.64 5.64 0 0 1 5.64-5.6c1.478 0 2.822.56 3.84 1.48l3.18-3.18C18.99 3.86 16.59 2.8 13.99 2.8A10.2 10.2 0 0 0 3.8 13a10.2 10.2 0 0 0 10.19 10.2c5.61 0 10.21-4.07 10.21-10.2 0-.62-.06-1.22-.16-1.8H12.24Z" />
          </svg>
          <span>Log in with Google</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[5px] border border-[#2F3337] bg-[#2F3337] text-[13px] text-white hover:bg-[#242729] transition-colors shadow-sm"
          onClick={() => addToast('GitHub login coming soon', 'info')}
        >
          <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
          </svg>
          <span>Log in with GitHub</span>
        </button>
      </div>

      {/* Main Login Form Box */}
      <div className="w-full max-w-[290px] bg-white rounded-[7px] shadow-xl p-6 mb-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-bold text-[15px] text-[#0C0D0E]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
              }`}
            />
            {errors.email && <span className="text-[12px] text-red-500 mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="font-bold text-[15px] text-[#0C0D0E]">
                Password
              </label>
              <Link to="/forgot-password" className="text-[12px] text-[#0074CC] hover:text-[#0A95FF]">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
              }`}
            />
            {errors.password && <span className="text-[12px] text-red-500 mt-1">{errors.password}</span>}
          </div>

          {error && (
            <div className="p-3 bg-[#FDF2F5] border border-[#DE4B59] text-[#C22E32] text-[13px] rounded-[3px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || password.length < 6}
            className="w-full py-2.5 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded-[3px] font-bold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 mt-2 transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <div className="text-[13px] text-[#242729] text-center w-full max-w-[290px]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#0074CC] hover:text-[#0A95FF]">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;

