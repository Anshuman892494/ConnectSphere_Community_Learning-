import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, RefreshCw, LogOut, CheckCircle2, Edit2, ShieldCheck, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { toggleTheme } from '../store/themeSlice';
import { logout, updateUser } from '../store/authSlice';
import API from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Verify = () => {
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Active tab: 'email' or 'phone'
  const [activeTab, setActiveTab] = useState(user?.isEmailVerified ? 'phone' : 'email');

  // Input states for codes
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  // Loading states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isResendingPhone, setIsResendingPhone] = useState(false);
  const [isUpdatingContacts, setIsUpdatingContacts] = useState(false);

  // Timers
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);

  // Edit contacts state
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [editErrors, setEditErrors] = useState({});

  // Developer mock codes (for testing ease)
  const [devEmailCode, setDevEmailCode] = useState(location.state?.emailOtp || '');
  const [devPhoneCode, setDevPhoneCode] = useState(location.state?.phoneOtp || '');

  // Timers countdown
  useEffect(() => {
    let emailInterval;
    if (emailTimer > 0) {
      emailInterval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(emailInterval);
  }, [emailTimer]);

  useEffect(() => {
    let phoneInterval;
    if (phoneTimer > 0) {
      phoneInterval = setInterval(() => {
        setPhoneTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(phoneInterval);
  }, [phoneTimer]);

  // Redirect/tab sync when verification state updates
  useEffect(() => {
    if (user?.isEmailVerified && activeTab === 'email') {
      setActiveTab('phone');
    }
  }, [user, activeTab]);

  // Submit email OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (emailCode.length !== 6) {
      addToast('Please enter the 6-digit code', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await API.post('/auth/verify-email', { code: emailCode });
      dispatch(updateUser(response.data.user));
      addToast('Email verified successfully!', 'success');
      setEmailCode('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit phone OTP
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (phoneCode.length !== 6) {
      addToast('Please enter the 6-digit code', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await API.post('/auth/verify-phone', { code: phoneCode });
      dispatch(updateUser(response.data.user));
      addToast('Phone number verified successfully!', 'success');
      setPhoneCode('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend codes
  const handleResendCode = async (type) => {
    if (type === 'email') {
      setIsResendingEmail(true);
      try {
        const response = await API.post('/auth/resend-email');
        addToast('Verification code resent to email', 'success');
        setEmailTimer(60);
        if (response.data._devEmailOtp) {
          setDevEmailCode(response.data._devEmailOtp);
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to resend code', 'error');
      } finally {
        setIsResendingEmail(false);
      }
    } else {
      setIsResendingPhone(true);
      try {
        const response = await API.post('/auth/resend-phone');
        addToast('SMS code resent to phone number', 'success');
        setPhoneTimer(60);
        if (response.data._devPhoneOtp) {
          setDevPhoneCode(response.data._devPhoneOtp);
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to resend code', 'error');
      } finally {
        setIsResendingPhone(false);
      }
    }
  };

  // Edit contacts
  const handleUpdateContacts = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newEmail) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newEmail)) errors.email = 'Valid email is required';

    if (newPhone && !/^\+?[1-9]\d{1,14}$/.test(newPhone.replace(/\s/g, ''))) {
      errors.phone = 'Valid phone format expected (e.g. +1234567890)';
    }

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsUpdatingContacts(true);
    try {
      const response = await API.post('/auth/update-contacts', {
        email: newEmail,
        phone: newPhone,
      });

      dispatch(updateUser(response.data.user));
      addToast('Details updated & new codes sent!', 'success');

      if (response.data._devEmailOtp) setDevEmailCode(response.data._devEmailOtp);
      if (response.data._devPhoneOtp) setDevPhoneCode(response.data._devPhoneOtp);

      setShowEditPanel(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update contact info.', 'error');
    } finally {
      setIsUpdatingContacts(false);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-500">
      
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
      <div className="w-full max-w-[480px] z-10 animate-fade-in-up duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10 mb-3 hover:rotate-12 transition-transform duration-300">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h2 className="font-sans font-black text-3xl tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 dark:from-indigo-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {t('securityHub')}
          </h2>
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
            ConnectSphere
          </p>
        </div>

        {/* Verification Status Checklist */}
        <div className="glassmorphism mb-6 p-5 rounded-2xl shadow-lg border border-white/20 dark:border-neutral-800/40">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-450 dark:text-neutral-500 mb-3">
            {t('verificationChecklist')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 border flex items-center gap-3 rounded-xl transition-all duration-350 ${
              user?.isEmailVerified 
                ? 'border-emerald-100/60 bg-emerald-500/5 dark:border-emerald-950/20 text-emerald-800 dark:text-emerald-350' 
                : 'border-amber-100/60 bg-amber-500/5 dark:border-amber-950/20 text-amber-800 dark:text-amber-300'
            }`}>
              <CheckCircle2 size={16} className={user?.isEmailVerified ? 'text-emerald-500' : 'text-amber-500'} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-none">{t('email')}</p>
                <p className="text-[10px] opacity-75 mt-1 truncate">{user?.email}</p>
              </div>
            </div>

            <div className={`p-3 border flex items-center gap-3 rounded-xl transition-all duration-350 ${
              user?.isPhoneVerified 
                ? 'border-emerald-100/60 bg-emerald-500/5 dark:border-emerald-950/20 text-emerald-800 dark:text-emerald-350' 
                : 'border-amber-100/60 bg-amber-500/5 dark:border-amber-950/20 text-amber-800 dark:text-amber-300'
            }`}>
              <CheckCircle2 size={16} className={user?.isPhoneVerified ? 'text-emerald-500' : 'text-amber-500'} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-none">{t('phone')}</p>
                <p className="text-[10px] opacity-75 mt-1 truncate">{user?.phone || 'Not entered'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form Card */}
        <div className="glassmorphism p-8 flex flex-col rounded-2xl shadow-xl border border-white/20 dark:border-neutral-800/40">
          
          {/* Tabs */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800/80 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              disabled={user?.isEmailVerified}
              className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'border-indigo-500 text-indigo-650 dark:text-indigo-450'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              } ${user?.isEmailVerified ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Mail size={16} />
              {t('verifyEmail')} {user?.isEmailVerified && '✓'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              disabled={user?.isPhoneVerified && user?.isEmailVerified}
              className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'phone'
                  ? 'border-indigo-500 text-indigo-650 dark:text-indigo-450'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              } ${user?.isPhoneVerified ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Phone size={16} />
              {t('verifyPhone')} {user?.isPhoneVerified && '✓'}
            </button>
          </div>

          {activeTab === 'email' ? (
            /* Email Form */
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed">
                Enter the 6-digit OTP code sent to <strong className="text-neutral-800 dark:text-neutral-250 font-bold">{user?.email}</strong>.
              </p>

              {/* Input for OTP */}
              <div className="relative group w-full">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  id="emailCode"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder=" "
                  required
                  className="w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 focus:ring-indigo-500/20 peer font-mono tracking-widest text-center"
                />
                <label
                  htmlFor="emailCode"
                  className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                    peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                    peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                    ${emailCode ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                >
                  6-Digit OTP Code
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isVerifying || emailCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Email</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-450 px-1">
                  <span>Code valid for 15 mins</span>
                  <button
                    type="button"
                    onClick={() => handleResendCode('email')}
                    disabled={emailTimer > 0 || isResendingEmail}
                    className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} className={isResendingEmail ? 'animate-spin' : ''} />
                    {emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Phone Form */
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              {!user?.phone ? (
                <div className="flex flex-col items-center gap-3 text-center text-xs p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/25">
                  <p>⚠️ No phone number registered. You need to add a phone number to proceed.</p>
                  <button
                    type="button"
                    onClick={() => setShowEditPanel(true)}
                    className="px-4 py-1.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    Add Phone Number
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-xs text-neutral-500 dark:text-neutral-455 leading-relaxed">
                    Enter the 6-digit OTP code sent via SMS to <strong className="text-neutral-800 dark:text-neutral-250 font-bold">{user?.phone}</strong>.
                  </p>

                  <div className="relative group w-full">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      id="phoneCode"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder=" "
                      required
                      className="w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 focus:ring-indigo-500/20 peer font-mono tracking-widest text-center"
                    />
                    <label
                      htmlFor="phoneCode"
                      className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                        peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                        peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                        ${phoneCode ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                    >
                      6-Digit SMS Code
                    </label>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isVerifying || !user?.phone || phoneCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Phone Number</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-450 px-1">
                  <span>Code valid for 15 mins</span>
                  <button
                    type="button"
                    onClick={() => handleResendCode('phone')}
                    disabled={phoneTimer > 0 || isResendingPhone || !user?.phone}
                    className="font-bold text-indigo-650 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} className={isResendingPhone ? 'animate-spin' : ''} />
                    {phoneTimer > 0 ? `Resend in ${phoneTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Dev Test Help Alert */}
          {(devEmailCode || devPhoneCode) && (
            <div className="mt-6 p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/15">
              <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>Developer Mode OTP codes</span>
              </h4>
              <div className="mt-2 grid grid-cols-2 text-xs font-semibold text-neutral-650 dark:text-neutral-400 gap-2">
                <div>
                  Email: <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-white/70 dark:bg-neutral-900/50 px-2 py-0.5 rounded">{devEmailCode || 'Not sent'}</span>
                </div>
                <div>
                  Phone: <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-white/70 dark:bg-neutral-900/50 px-2 py-0.5 rounded">{devPhoneCode || 'Not sent'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions Panel */}
          <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800/80 pt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Edit2 size={12} />
              {showEditPanel ? 'Cancel edit' : 'Wrong details? Update Email/Phone'}
            </button>

            {showEditPanel && (
              <form onSubmit={handleUpdateContacts} className="space-y-4 pt-2">
                {/* Update Email Field with Floating Label */}
                <div className="relative group w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder=" "
                    required
                    className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                      editErrors.email 
                        ? 'border-rose-500 focus:ring-rose-500/20' 
                        : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                    } peer`}
                  />
                  <label
                    htmlFor="newEmail"
                    className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                      peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                      peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                      ${newEmail ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                  >
                    Email Address
                  </label>
                  {editErrors.email && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{editErrors.email}</span>
                  )}
                </div>

                {/* Update Phone Field with Floating Label */}
                <div className="relative group w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    id="newPhone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder=" "
                    className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                      editErrors.phone 
                        ? 'border-rose-500 focus:ring-rose-500/20' 
                        : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                    } peer`}
                  />
                  <label
                    htmlFor="newPhone"
                    className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                      peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                      peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                      ${newPhone ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                  >
                    Phone Number
                  </label>
                  {editErrors.phone && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-1 px-1">{editErrors.phone}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingContacts}
                  className="w-full py-2.5 bg-neutral-150 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-xl font-semibold text-xs transition duration-200 cursor-pointer flex items-center justify-center"
                >
                  {isUpdatingContacts ? 'Updating...' : 'Save and Resend Codes'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center justify-center gap-1.5 mt-2 cursor-pointer bg-transparent border-none"
            >
              <LogOut size={12} />
              Sign Out / Cancel Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
