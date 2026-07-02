import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
    <div className="min-h-screen flex justify-center items-center bg-[#F1F2F3] text-[#242729] font-sans py-12 px-4">
      
      {/* Container for text (hidden on small screens) and form */}
      <div className="flex gap-12 items-center max-w-[800px] w-full">
        
        {/* Left Marketing Text (visible on larger screens) */}
        <div className="hidden md:flex flex-col gap-6 flex-1 text-[15px]">
          <h1 className="text-[27px] font-normal leading-tight mb-2">
            Join the ConnectSphere community
          </h1>
          <div className="flex items-center gap-2">
            <svg className="w-[26px] h-[26px] text-[#0A95FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Get unstuck — ask a question</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-[26px] h-[26px] text-[#0A95FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21v-2z" />
            </svg>
            <span>Unlock new privileges like voting and commenting</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-[26px] h-[26px] text-[#0A95FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Save your favorite posts, tags, and filters</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-[26px] h-[26px] text-[#0A95FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
            </svg>
            <span>Earn reputation and badges</span>
          </div>
          <div className="text-[13px] text-gray-500 mt-2">
            Collaborate and share knowledge with a private group for FREE.
            <br />
            <a href="#" className="text-[#0074CC] hover:text-[#0A95FF]">Get ConnectSphere for Teams free for up to 50 users.</a>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full max-w-[316px] mx-auto flex flex-col items-center">
          
          {/* Logo (only shown on small screens where text is hidden) */}
          <div className="mb-6 md:hidden flex items-center justify-center gap-2">
            <Globe className="text-[#F48024] w-8 h-8" />
            <span className="text-[24px] font-normal text-gray-800">
              connect<span className="font-bold text-black">sphere</span>
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="w-full flex flex-col gap-2 mb-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[5px] border border-gray-300 bg-white text-[13px] text-[#3B4045] hover:bg-gray-50 transition-colors shadow-sm"
              onClick={() => addToast('Google signup via backend only currently', 'info')}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.64 5.64 0 0 1 8.35 13a5.64 5.64 0 0 1 5.64-5.6c1.478 0 2.822.56 3.84 1.48l3.18-3.18C18.99 3.86 16.59 2.8 13.99 2.8A10.2 10.2 0 0 0 3.8 13a10.2 10.2 0 0 0 10.19 10.2c5.61 0 10.21-4.07 10.21-10.2 0-.62-.06-1.22-.16-1.8H12.24Z" />
              </svg>
              <span>Sign up with Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[5px] border border-[#2F3337] bg-[#2F3337] text-[13px] text-white hover:bg-[#242729] transition-colors shadow-sm"
              onClick={() => addToast('GitHub login coming soon', 'info')}
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
              </svg>
              <span>Sign up with GitHub</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="w-full bg-white rounded-[7px] shadow-xl p-6 mb-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="font-bold text-[15px] text-[#0C0D0E]">
                  Display name
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                    errors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                  }`}
                />
                {errors.username && <span className="text-[12px] text-red-500 mt-1">{errors.username}</span>}
              </div>

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
                <label htmlFor="phone" className="font-bold text-[15px] text-[#0C0D0E]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                  }`}
                />
                {errors.phone && <span className="text-[12px] text-red-500 mt-1">{errors.phone}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="font-bold text-[15px] text-[#0C0D0E]">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                  }`}
                />
                <p className="text-[12px] text-gray-500 mt-1 mb-1 leading-snug">
                  Passwords must contain at least six characters.
                </p>
                {errors.password && <span className="text-[12px] text-red-500">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="font-bold text-[15px] text-[#0C0D0E]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                  }`}
                />
                {errors.confirmPassword && <span className="text-[12px] text-red-500 mt-1">{errors.confirmPassword}</span>}
              </div>

              {error && (
                <div className="p-3 bg-[#FDF2F5] border border-[#DE4B59] text-[#C22E32] text-[13px] rounded-[3px]">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded-[3px] font-bold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
              
              <div className="text-[12px] text-gray-500 mt-4 leading-snug">
                By clicking "Sign up", you agree to our <a href="#" className="text-[#0074CC]">terms of service</a> and acknowledge that you have read and understand our <a href="#" className="text-[#0074CC]">privacy policy</a> and <a href="#" className="text-[#0074CC]">code of conduct</a>.
              </div>
            </form>
          </div>

          <div className="text-[13px] text-[#242729] text-center w-full">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0074CC] hover:text-[#0A95FF]">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;

