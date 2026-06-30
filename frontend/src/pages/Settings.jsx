import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Lock, ShieldCheck, Mail, Phone, X, Sparkles, RefreshCw } from 'lucide-react';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const { t, currentLanguage, requestLanguageChange, verifyLanguageChange } = useLanguage();

  // Tab State
  const [activeSettingsTab, setActiveSettingsTab] = useState('password');

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isSwappingLanguage, setIsSwappingLanguage] = useState(false);
  
  // Verification Modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [swapTarget, setSwapTarget] = useState('');

  // Synchronize selection with language preference changes
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (isVerifyModalOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyModalOpen, countdown]);

  const validatePassword = () => {
    const tempErrors = {};
    if (!currentPassword) {
      tempErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      tempErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      tempErrors.newPassword = 'New password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await API.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      addToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Please check your inputs.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLanguage = async (e) => {
    e.preventDefault();
    if (selectedLanguage === currentLanguage) {
      addToast('Please choose a different language', 'warning');
      return;
    }

    if (selectedLanguage !== 'fr' && !user.phone) {
      addToast(t('mobileNotRegistered'), 'error');
      return;
    }

    setIsSwappingLanguage(true);
    try {
      const data = await requestLanguageChange(selectedLanguage);
      setSwapTarget(selectedLanguage);
      setDevOtp(data._devOtp || '');
      setCountdown(60);
      setIsVerifyModalOpen(true);
      addToast('Verification code sent successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request language change.';
      addToast(msg, 'error');
    } finally {
      setIsSwappingLanguage(false);
    }
  };

  const handleVerifyLanguage = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      addToast('Please enter a 6-digit code', 'warning');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyLanguageChange(otpCode);
      addToast('Language switched successfully!', 'success');
      setIsVerifyModalOpen(false);
      setOtpCode('');
      setDevOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code.';
      addToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      const data = await requestLanguageChange(swapTarget);
      setDevOtp(data._devOtp || '');
      setCountdown(60);
      addToast('Verification code resent successfully', 'success');
    } catch (err) {
      addToast('Failed to resend code', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 px-4">
      {/* Outer Wrapper */}
      <div className="glassmorphism rounded-2xl flex min-h-[600px] overflow-hidden border border-white/20 dark:border-neutral-800/40 shadow-xl">
        
        {/* Left Sidebar Menu */}
        <div className="hidden md:flex md:w-[220px] flex-shrink-0 border-r border-neutral-200 dark:border-neutral-850 flex-col">
          <ul className="flex flex-col text-sm text-neutral-700 dark:text-neutral-400">
            <li 
              onClick={() => setActiveSettingsTab('password')}
              className={`px-6 py-4 cursor-pointer font-bold transition-all ${
                activeSettingsTab === 'password'
                  ? 'border-l-2 border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/30'
                  : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('changePassword')}
            </li>
            <li 
              onClick={() => setActiveSettingsTab('language')}
              className={`px-6 py-4 cursor-pointer font-bold transition-all ${
                activeSettingsTab === 'language'
                  ? 'border-l-2 border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/30'
                  : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('languageSettings')}
            </li>
            <li 
              onClick={() => addToast('Edit Profile mock option', 'info')}
              className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('editProfile')}
            </li>
            <li 
              onClick={() => addToast('Apps and Websites mock option', 'info')}
              className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('appsAndWebsites')}
            </li>
            <li 
              onClick={() => addToast('Email Notifications mock option', 'info')}
              className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('emailNotifications')}
            </li>
            <li 
              onClick={() => addToast('Push Notifications mock option', 'info')}
              className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('pushNotifications')}
            </li>
            <li 
              onClick={() => addToast('Privacy and Security mock option', 'info')}
              className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-900/45 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('privacySecurity')}
            </li>
          </ul>
        </div>

        {/* Right Active Settings Panel */}
        <div className="flex-1 p-10 md:px-14 flex flex-col space-y-8">
          
          {/* User Profile Info Row */}
          <div className="flex items-center gap-6 max-w-xl md:pl-28">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-[38px] w-[38px] rounded-full object-cover border border-neutral-200 dark:border-neutral-850"
              />
            ) : (
              <div className="h-[38px] w-[38px] rounded-full bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black flex items-center justify-center font-bold text-sm uppercase">
                {user.username.charAt(0)}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xl text-neutral-900 dark:text-neutral-100 font-normal leading-tight truncate">
                {user.username}
              </span>
              <span className="text-xs font-semibold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrator' : 'Free account'}
              </span>
            </div>
          </div>

          {activeSettingsTab === 'password' ? (
            /* Change Password Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
              {/* Current Password */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="md:w-[150px] md:text-right font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  {t('oldPassword')}
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    required
                    className={`w-full max-w-[340px] px-3.5 py-2 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                      errors.currentPassword ? 'border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  {errors.currentPassword && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-0.5">{errors.currentPassword}</span>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="md:w-[150px] md:text-right font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  {t('newPasswordLabel')}
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className={`w-full max-w-[340px] px-3.5 py-2 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                      errors.newPassword ? 'border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  {errors.newPassword && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-0.5">{errors.newPassword}</span>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="md:w-[150px] md:text-right font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  {t('confirmNewPassword')}
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className={`w-full max-w-[340px] px-3.5 py-2 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                      errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-0.5">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              {/* Save Button Row */}
              <div className="flex flex-col md:flex-row gap-4 md:pl-[166px]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-fit px-5 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  {isLoading ? 'Changing Password...' : t('changePassword')}
                </button>
              </div>
            </form>
          ) : (
            /* Language Settings View */
            <form onSubmit={handleRequestLanguage} className="space-y-6 max-w-xl">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="md:w-[150px] md:text-right font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  {t('preferredLanguage')}
                </label>
                <div className="flex-1">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full max-w-[340px] px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-850 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="hi">हिन्दी (IN)</option>
                    <option value="pt">Português (PT)</option>
                    <option value="zh">中文 (CN)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>
              </div>

              {/* Help tip text depending on selection */}
              <div className="md:pl-[166px] max-w-[340px]">
                <p className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-normal">
                  {selectedLanguage === 'fr' 
                    ? "Security notice: Switching your language to French (FR) will require verifying a 6-digit OTP code sent to your registered Email address."
                    : `Security notice: Switching your language to ${selectedLanguage.toUpperCase()} will require verifying a 6-digit OTP code sent via SMS to your registered Mobile number.`}
                </p>
              </div>

              {/* Save Changes Button Row */}
              <div className="flex flex-col md:flex-row gap-4 md:pl-[166px]">
                <button
                  type="submit"
                  disabled={isSwappingLanguage}
                  className="w-fit px-5 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  {isSwappingLanguage ? 'Requesting...' : t('saveChanges')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* OTP VERIFICATION MODAL OVERLAY */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism bg-white/95 dark:bg-neutral-900/95 w-full max-w-[420px] rounded-2xl border border-white/20 dark:border-neutral-800/40 shadow-2xl backdrop-blur-2xl p-6 md:p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center">
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setOtpCode('');
                  setDevOtp('');
                }}
                className="absolute top-4 right-4 text-neutral-450 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10 mb-4">
                <ShieldCheck className="text-white w-6 h-6 animate-pulse" />
              </div>

              {/* Title & Description */}
              <h3 className="font-sans font-black text-xl tracking-tight text-neutral-900 dark:text-white mb-2 text-center">
                {t('verifyToChangeLanguage')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed mb-6 px-1">
                {t('verifyToChangeLanguageDesc')} (<strong>{swapTarget === 'fr' ? 'Email' : 'Mobile'}</strong>)
              </p>

              {/* Form */}
              <form onSubmit={handleVerifyLanguage} className="w-full space-y-4">
                <div className="relative group w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                    <Lock size={16} />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder=" "
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 focus:ring-indigo-500/20 peer"
                  />
                  <label
                    className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                      peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                      peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                      ${otpCode ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                  >
                    {t('enterOtpCode')}
                  </label>
                </div>

                {/* Resend Option */}
                <div className="flex justify-between items-center text-[11px] px-1">
                  <span className="text-neutral-450 dark:text-neutral-500">
                    {t('codeValidFor')}
                  </span>
                  {countdown > 0 ? (
                    <span className="text-neutral-500 font-semibold">
                      {t('resendIn')} {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={10} />
                      {t('resendCode')}
                    </button>
                  )}
                </div>

                {/* Dev Assistant Banner */}
                {devOtp && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/30 rounded-xl space-y-1">
                    <div className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>Developer Mode Assistant</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Auto-received OTP: <strong className="font-mono text-xs select-all text-neutral-850 dark:text-neutral-100">{devOtp}</strong>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyModalOpen(false);
                      setOtpCode('');
                      setDevOtp('');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.length !== 6}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isVerifyingOtp ? 'Verifying...' : t('verifyCode')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
