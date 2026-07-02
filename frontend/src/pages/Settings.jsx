import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';

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
    <div className="max-w-[1100px] mx-auto pt-6 px-4 font-sans text-[#242729]">
      
      <h1 className="text-[27px] font-normal mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar Menu */}
        <div className="md:w-[200px] flex-shrink-0 mb-6 md:mb-0 md:mr-8">
          <ul className="flex flex-col text-[13px] text-[#525960]">
            <li className="font-bold text-[#242729] mb-2 uppercase text-[11px] tracking-wider">
              Personal Information
            </li>
            <li 
              onClick={() => setActiveSettingsTab('password')}
              className={`px-3 py-1.5 cursor-pointer rounded-[100px] transition-colors mb-1 ${
                activeSettingsTab === 'password'
                  ? 'bg-[#F1F2F3] font-bold text-[#0C0D0E]'
                  : 'hover:bg-[#E3E6E8]'
              }`}
            >
              Change password
            </li>
            <li 
              onClick={() => setActiveSettingsTab('language')}
              className={`px-3 py-1.5 cursor-pointer rounded-[100px] transition-colors mb-4 ${
                activeSettingsTab === 'language'
                  ? 'bg-[#F1F2F3] font-bold text-[#0C0D0E]'
                  : 'hover:bg-[#E3E6E8]'
              }`}
            >
              Language
            </li>
            <li className="font-bold text-[#242729] mb-2 uppercase text-[11px] tracking-wider">
              Preferences
            </li>
            <li 
              onClick={() => addToast('Edit Profile mock option', 'info')}
              className="px-3 py-1.5 cursor-pointer hover:bg-[#E3E6E8] rounded-[100px] transition-colors mb-1"
            >
              Edit profile
            </li>
            <li 
              onClick={() => addToast('Apps and Websites mock option', 'info')}
              className="px-3 py-1.5 cursor-pointer hover:bg-[#E3E6E8] rounded-[100px] transition-colors mb-1"
            >
              Apps and Websites
            </li>
            <li 
              onClick={() => addToast('Email Notifications mock option', 'info')}
              className="px-3 py-1.5 cursor-pointer hover:bg-[#E3E6E8] rounded-[100px] transition-colors mb-1"
            >
              Email settings
            </li>
          </ul>
        </div>

        {/* Right Active Settings Panel */}
        <div className="flex-1">
          
          {activeSettingsTab === 'password' ? (
            <div>
              <h2 className="text-[21px] font-normal mb-4 border-b pb-2">Change Password</h2>
              
              <div className="max-w-[400px] border rounded-[5px] p-6 bg-white shadow-sm">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[15px] text-[#0C0D0E]">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                      }`}
                    />
                    {errors.currentPassword && (
                      <span className="text-[12px] text-red-500 mt-1">{errors.currentPassword}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[15px] text-[#0C0D0E]">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                      }`}
                    />
                    <p className="text-[12px] text-gray-500">Must be at least 6 characters.</p>
                    {errors.newPassword && (
                      <span className="text-[12px] text-red-500 mt-1">{errors.newPassword}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[15px] text-[#0C0D0E]">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full p-2 text-sm border rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#0074CC]'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <span className="text-[12px] text-red-500 mt-1">{errors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-3 py-2 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded-[3px] font-bold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Change password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Language Settings View */
            <div>
              <h2 className="text-[21px] font-normal mb-4 border-b pb-2">Language Settings</h2>
              
              <div className="max-w-[400px] border rounded-[5px] p-6 bg-white shadow-sm">
                <form onSubmit={handleRequestLanguage} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[15px] text-[#0C0D0E]">
                      Interface language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 focus:border-[#0074CC]"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                      <option value="hi">हिन्दी (IN)</option>
                      <option value="pt">Português (PT)</option>
                      <option value="zh">中文 (CN)</option>
                      <option value="fr">Français (FR)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#FDF2F5] border border-[#DE4B59] rounded-[3px]">
                    <p className="text-[13px] text-[#C22E32]">
                      {selectedLanguage === 'fr' 
                        ? "Security notice: Switching to French (FR) requires verifying a 6-digit OTP code sent to your email."
                        : `Security notice: Switching to ${selectedLanguage.toUpperCase()} requires verifying a 6-digit OTP code sent via SMS.`}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSwappingLanguage}
                      className="px-3 py-2 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded-[3px] font-bold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 transition-colors"
                    >
                      {isSwappingLanguage ? 'Requesting...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OTP VERIFICATION MODAL OVERLAY */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-[5px] shadow-2xl p-6 relative">
            
            <button 
              onClick={() => {
                setIsVerifyModalOpen(false);
                setOtpCode('');
                setDevOtp('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#E1ECF4] flex items-center justify-center mb-4">
                <ShieldCheck className="text-[#0A95FF] w-6 h-6" />
              </div>

              <h3 className="text-[21px] font-normal mb-2 text-center">
                Verify Identity
              </h3>
              <p className="text-[13px] text-gray-600 text-center mb-6">
                Please enter the 6-digit code sent to your {swapTarget === 'fr' ? 'Email' : 'Mobile'}.
              </p>

              <form onSubmit={handleVerifyLanguage} className="w-full space-y-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full p-2 text-center text-lg tracking-widest border border-gray-300 rounded-[3px] focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 focus:border-[#0074CC]"
                  />
                </div>

                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">
                    Code valid for a few minutes
                  </span>
                  {countdown > 0 ? (
                    <span className="text-gray-600 font-bold">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#0074CC] hover:text-[#0A95FF] flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Dev Assistant Banner */}
                {devOtp && (
                  <div className="p-3 bg-[#E1ECF4] border border-[#7AA7C7] rounded-[3px]">
                    <div className="text-[11px] font-bold text-[#0074CC] uppercase tracking-wider mb-1">
                      Developer Mode
                    </div>
                    <div className="text-[13px] text-gray-800">
                      Auto-received OTP: <strong className="font-mono text-[14px] select-all">{devOtp}</strong>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.length !== 6}
                    className="flex-1 py-2 bg-[#0A95FF] hover:bg-[#0074CC] text-white rounded-[3px] font-bold text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 transition-colors"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyModalOpen(false);
                      setOtpCode('');
                      setDevOtp('');
                    }}
                    className="flex-1 py-2 text-[#0074CC] hover:bg-[#E1ECF4] rounded-[3px] text-[13px] transition-colors"
                  >
                    Cancel
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
