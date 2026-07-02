import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, X, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { updateUser } from '../../store/authSlice';
import API from '../../services/api';

const PhoneVerificationModal = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Show modal if logged in, email is verified, but phone is NOT verified
  useEffect(() => {
    if (user && user.isEmailVerified && !user.isPhoneVerified) {
      // Small delay to let the dashboard render first
      const timeout = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timeout);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      addToast('Please enter a valid phone number (e.g., +1234567890)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/update-contacts', { phone });
      dispatch(updateUser(response.data.user));
      addToast('OTP sent to your phone!', 'success');
      setTimer(60);
      setStep(2);
      
      // For dev testing, show OTP in console or toast if returned
      if (response.data._devPhoneOtp) {
        console.log("DEV OTP:", response.data._devPhoneOtp);
        addToast(`[Dev Mode] OTP: ${response.data._devPhoneOtp}`, 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update phone number.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      addToast('Please enter the 6-digit code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/verify-phone', { code: otp });
      dispatch(updateUser(response.data.user));
      addToast('Phone verified successfully!', 'success');
      setIsOpen(false); // Close modal on success
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await API.post('/auth/resend-phone');
      addToast('SMS code resent!', 'success');
      setTimer(60);
      if (response.data._devPhoneOtp) {
        addToast(`[Dev Mode] OTP: ${response.data._devPhoneOtp}`, 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative">
        
        {/* Close Button - Dismissible */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 mx-auto shadow-sm">
            <AlertCircle size={24} />
          </div>
          
          <h3 className="text-xl font-black text-center text-neutral-900 dark:text-white mb-2">
            Secure Your Account
          </h3>
          <p className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-6 px-4 leading-relaxed">
            Please add and verify your phone number to keep your account safe and access all features.
          </p>

          {step === 1 ? (
            <form onSubmit={handleUpdatePhone} className="space-y-4">
              <div className="relative group w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  id="phoneInput"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  className="w-full pl-11 pr-4 pt-5 pb-2 text-sm font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 peer"
                />
                <label
                  htmlFor="phoneInput"
                  className={`absolute left-11 text-neutral-500 dark:text-neutral-400 pointer-events-none transition-all duration-300 origin-left 
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                    peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400
                    ${phone ? 'text-[10px] top-1.5 translate-y-0' : ''}`}
                >
                  Phone Number (e.g. +91...)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phone}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send OTP <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center text-xs text-neutral-600 dark:text-neutral-300 mb-2">
                Sent to: <span className="font-bold">{phone}</span>
                <button type="button" onClick={() => setStep(1)} className="ml-2 text-indigo-500 hover:underline">Change</button>
              </div>

              <div className="relative group w-full">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6-digit OTP"
                  className="w-full text-center py-3 text-lg tracking-[0.5em] font-mono rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify Phone Number'
                )}
              </button>

              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isLoading}
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 disabled:opacity-40 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;
