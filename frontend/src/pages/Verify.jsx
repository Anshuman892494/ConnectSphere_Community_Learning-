import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, RefreshCw, LogOut, CheckCircle2, Edit2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { logout, updateUser } from '../store/authSlice';
import API from '../services/api';

const Verify = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

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
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex justify-center items-center gap-2">
          <span>🛡️</span> Security Hub
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Verify your credentials to complete ConnectSphere signup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Verification Status Checklist */}
        <div className="mb-6 p-4 bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Verification Checklist</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 border flex items-center gap-3 rounded-xl ${
              user?.isEmailVerified ? 'border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20' : 'border-amber-100 bg-amber-50/50 text-amber-800 dark:border-amber-950/20'
            }`}>
              <CheckCircle2 size={16} className={user?.isEmailVerified ? 'text-emerald-500' : 'text-amber-500'} />
              <div>
                <p className="text-xs font-bold leading-none">Email Address</p>
                <p className="text-[10px] opacity-75 mt-1 truncate">{user?.email}</p>
              </div>
            </div>

            <div className={`p-3 border flex items-center gap-3 rounded-xl ${
              user?.isPhoneVerified ? 'border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20' : 'border-amber-100 bg-amber-50/50 text-amber-800 dark:border-amber-950/20'
            }`}>
              <CheckCircle2 size={16} className={user?.isPhoneVerified ? 'text-emerald-500' : 'text-amber-500'} />
              <div>
                <p className="text-xs font-bold leading-none">Phone SMS</p>
                <p className="text-[10px] opacity-75 mt-1 truncate">{user?.phone || 'Not entered'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form Card */}
        <div className="p-8 shadow bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl">
          <div className="flex border-b border-slate-150 dark:border-darkborder mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              disabled={user?.isEmailVerified}
              className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              } ${user?.isEmailVerified ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Mail size={16} />
              Verify Email {user?.isEmailVerified && '✓'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              disabled={user?.isPhoneVerified && user?.isEmailVerified}
              className={`flex-1 pb-3 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'phone'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              } ${user?.isPhoneVerified ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Phone size={16} />
              Verify Phone {user?.isPhoneVerified && '✓'}
            </button>
          </div>

          {activeTab === 'email' ? (
            /* Email Form */
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Enter the 6-digit OTP code sent to <strong className="text-slate-800 dark:text-slate-200">{user?.email}</strong>.
              </p>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkborder bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Code valid for 15 mins</span>
                  <button
                    type="button"
                    onClick={() => handleResendCode('email')}
                    disabled={emailTimer > 0 || isResendingEmail}
                    className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isResendingEmail ? 'animate-spin' : ''} />
                    {emailTimer > 0 ? `Resend OTP in ${emailTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Phone Form */
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              {!user?.phone ? (
                <div className="text-center text-xs p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-950/30">
                  ⚠️ No phone number registered. Use the update form below to add a phone number.
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Enter the 6-digit OTP code sent via SMS to <strong className="text-slate-800 dark:text-slate-200">{user?.phone}</strong>.
                  </p>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="654321"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkborder bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isVerifying || !user?.phone}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify Phone Number'
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Code valid for 15 mins</span>
                  <button
                    type="button"
                    onClick={() => handleResendCode('phone')}
                    disabled={phoneTimer > 0 || isResendingPhone || !user?.phone}
                    className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isResendingPhone ? 'animate-spin' : ''} />
                    {phoneTimer > 0 ? `Resend OTP in ${phoneTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Dev Test Help Alert */}
          {(devEmailCode || devPhoneCode) && (
            <div className="mt-6 p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/10">
              <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <span>🛠️</span> Dev Testing OTP codes:
              </h4>
              <div className="mt-2 grid grid-cols-2 text-xs font-semibold text-slate-650 dark:text-slate-400 gap-2">
                <div>
                  Email OTP: <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">{devEmailCode || 'Not sent'}</span>
                </div>
                <div>
                  Phone OTP: <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">{devPhoneCode || 'Not sent'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 dark:border-darkborder pt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Edit2 size={12} />
              {showEditPanel ? 'Cancel edit' : 'Wrong details? Update Email/Phone'}
            </button>

            {showEditPanel && (
              <form onSubmit={handleUpdateContacts} className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-2 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  {editErrors.email && <span className="text-xs text-rose-500 mt-0.5">{editErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  {editErrors.phone && <span className="text-xs text-rose-500 mt-0.5">{editErrors.phone}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingContacts}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-250 dark:bg-darkborder dark:hover:bg-slate-800 text-slate-800 dark:text-slate-250 rounded-xl font-medium transition cursor-pointer flex items-center justify-center"
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
