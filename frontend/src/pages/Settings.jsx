import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const validate = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Account Settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-650 dark:text-slate-400">
            Manage your account settings and credentials.
          </p>
        </div>

        <hr className="border-slate-200 dark:border-darkborder" />

        <div className="bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Change Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider font-semibold">
            Update your login password
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
            {/* Current Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Password (or Temporary Password)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-450 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.currentPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.currentPassword && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.currentPassword}</span>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-450 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.newPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.newPassword && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.newPassword}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkbg dark:text-slate-100 placeholder-slate-450 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
                }`}
              />
              {errors.confirmPassword && (
                <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.confirmPassword}</span>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-205 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
