import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex justify-center items-center gap-2">
          <span>🌐</span> ConnectSphere
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Reset your password to get back to sharing knowledge
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="p-8 shadow bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Forgot Password
          </h3>

          {!successMsg ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email / Phone Field */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Registered Email Address or Phone Number
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. user@example.com or +919876543210"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    errorMsg
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                  }`}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 rounded-xl text-xs font-semibold border border-rose-100 dark:border-rose-950/30">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Resetting Password...' : 'Generate New Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-100 dark:border-emerald-950/30">
                ✓ {successMsg}
              </div>

              {/* Dev Mode Output */}
              {tempPassword && (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/30 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    🛠️ Developer Mode Assistant
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Since you are in developer mode, here is your generated letters-only password:
                  </div>
                  <div className="flex items-center justify-between bg-white dark:bg-darkbg px-4 py-2.5 rounded-lg border border-slate-200 dark:border-darkborder">
                    <span className="font-mono font-bold text-lg tracking-wider text-slate-800 dark:text-slate-100">
                      {tempPassword}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 transition duration-200"
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remembered your password?{' '}
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

export default ForgotPassword;
