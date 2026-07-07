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
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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

  // Heuristic device classification
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      return 'mobile';
    }
    return window.screen.width <= 1600 ? 'laptop' : 'desktop';
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        dispatch(loginStart());
        const deviceType = getDeviceType();
        const response = await API.post('/auth/google', {
          token: tokenResponse.access_token,
          deviceType
        });
        
        if (response.data.requireOtp) {
          dispatch(loginFailure(null)); // Clear loading state
          setOtpEmail(response.data.email);
          setDevOtp(response.data._devOtp || '');
          setShowOtpModal(true);
          addToast(response.data.message || 'OTP Verification required.', 'info');
        } else {
          dispatch(loginSuccess(response.data));
          addToast(`Welcome, ${response.data.username}!`, 'success');
          navigate('/');
        }
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
      const deviceType = getDeviceType();
      const response = await API.post('/auth/login', {
        email,
        password,
        rememberMe: true,
        deviceType
      });

      if (response.data.requireOtp) {
        dispatch(loginFailure(null)); // Clear loading state
        setOtpEmail(response.data.email);
        setDevOtp(response.data._devOtp || '');
        setShowOtpModal(true);
        addToast(response.data.message || 'OTP Verification required.', 'info');
      } else {
        dispatch(loginSuccess(response.data));
        addToast(`Welcome back, ${response.data.username}!`, 'success');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(loginFailure(msg));
      addToast(msg, 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      addToast('Please enter a 6-digit OTP code', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const deviceType = getDeviceType();
      const response = await API.post('/auth/login/verify-otp', {
        email: otpEmail,
        otpCode,
        rememberMe: true,
        deviceType
      });
      dispatch(loginSuccess(response.data));
      addToast(`Welcome back, ${response.data.username}!`, 'success');
      setShowOtpModal(false);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed.';
      addToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F1F2F3] text-[#242729] font-sans relative">
      
      {/* OTP Verification Modal Overlay */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[380px] rounded-lg shadow-2xl p-6 border border-gray-100 flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-gray-900 text-center">Chrome Login Verification</h2>
            <p className="text-sm text-gray-600 text-center">
              We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{otpEmail}</span>.
            </p>

            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12px] text-amber-800 flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600">Developer Mode Assistant</span>
                <div className="flex justify-between items-center">
                  <span>Login OTP is: <strong className="font-mono text-sm">{devOtp}</strong></span>
                  <button
                    onClick={() => {
                      setOtpCode(devOtp);
                      addToast('Code autofilled!', 'info');
                    }}
                    className="text-[#0074CC] hover:underline font-semibold"
                  >
                    Autofill
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="otp" className="font-bold text-[14px] text-gray-800">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full p-2.5 text-center text-xl font-mono tracking-[0.5em] border border-gray-300 rounded focus:outline-none focus:ring-4 focus:ring-[#0A95FF]/20 focus:border-[#0A95FF]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="flex-1 py-2 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded font-bold text-[13px] shadow transition-colors disabled:opacity-50"
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify & Log in'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

