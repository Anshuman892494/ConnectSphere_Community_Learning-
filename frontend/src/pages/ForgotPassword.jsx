import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';
import { Mail, KeyRound, Sun, Moon, ArrowRight, ArrowLeft, Globe, Copy, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.theme);
  const { addToast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setTempPassword('');
    setIsCopied(false);

    try {
      const response = await API.post('/auth/forgot-password', { emailOrPhone: emailOrPhone.trim() });
      setSuccessMsg(response.data.message);
      if (response.data.tempPassword) {
        setTempPassword(response.data.tempPassword);
      }
      addToast('Password reset successful!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your inputs.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setIsCopied(true);
    addToast('Password copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-500">
      
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
      <div className="w-full max-w-[380px] z-10 animate-fade-in-up duration-500">
        <div className="glassmorphism p-8 md:p-10 flex flex-col rounded-2xl shadow-xl border border-white/20 dark:border-neutral-800/40">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10 mb-3 hover:rotate-12 transition-transform duration-300">
              <KeyRound className="text-white w-6 h-6" />
            </div>
            <h2 className="font-sans font-black text-3xl tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 dark:from-indigo-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ConnectSphere
            </h2>
            <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
              {t('resetPassword')}
            </p>
          </div>

          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm text-center mb-1">
            {t('troubleLogin')}
          </h3>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mb-6 px-1 leading-relaxed">
            {t('enterEmailOrPhone')}
          </p>

          {!successMsg ? (
            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              {/* Email / Phone Field with Floating Label */}
              <div className="relative group w-full">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder=" "
                  required
                  className={`w-full pl-10 pr-4 pt-5 pb-1.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-2 ${
                    errorMsg 
                      ? 'border-rose-500 focus:ring-rose-500/20' 
                      : 'border-neutral-200 dark:border-neutral-800/80 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } peer`}
                />
                <label
                  htmlFor="emailOrPhone"
                  className={`absolute left-10 text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                    peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                    peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-500 
                    ${emailOrPhone ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                >
                  {t('email')} / {t('phone')}
                </label>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 text-[11px] font-semibold border border-rose-100 dark:border-rose-950/30 text-center rounded-xl animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !emailOrPhone.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-6 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('generatePassword')}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="w-full space-y-5 text-center">
              {/* Success Message */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-100 dark:border-emerald-950/30">
                {successMsg}
              </div>

              {/* Developer Assistant Mode */}
              {tempPassword && (
                <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100/60 dark:border-indigo-950/40 rounded-xl text-left space-y-2">
                  <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={12} />
                    <span>Developer Mode Assistant</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Your generated temporary password:
                  </div>
                  <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <span className="font-mono font-bold text-sm tracking-wider text-neutral-900 dark:text-neutral-100">
                      {tempPassword}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1 text-indigo-600 dark:text-indigo-450 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                {t('backToLogin')}
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center w-full my-6">
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800/80" />
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              OR
            </span>
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800/80" />
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col gap-2.5 items-center text-xs">
            <Link
              to="/register"
              className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              {t('signup')}
            </Link>
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-350 hover:underline flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} />
              <span>{t('backToLogin')}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

