import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Crown, Check, ShieldCheck, Zap } from 'lucide-react';
import API from '../services/api';
import { updateUser } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppCard from '../components/layout/AppCard';
import AppModal from '../components/layout/AppModal';

// Load Razorpay Script Helper
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SubscriptionPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Mock Modal States
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockOrderId, setMockOrderId] = useState('');

  const plans = [
    {
      name: 'Silver',
      price: '₹199',
      billing: '/ month',
      bonus: '+80 Points Reward',
      features: [
        'Premium username ring indicator',
        'Standard learning dashboard support',
        'Access to basic Q&A forums',
      ],
      badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    },
    {
      name: 'Gold',
      price: '₹499',
      billing: '/ month',
      bonus: '+200 Points Reward',
      features: [
        'Gold VIP username indicator',
        'Unlimited Q&A board posting privileges',
        'High-priority answer moderation visibility',
        'Double daily points bonuses',
      ],
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      popular: true,
    },
    {
      name: 'Platinum',
      price: '₹999',
      billing: '/ month',
      bonus: '+500 Points Reward',
      features: [
        'Platinum Elite icon indicator',
        'Direct email assistance for coding',
        'First access to new developer tools',
        'Unrestricted premium content vault access',
      ],
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    },
  ];

  const handleCheckout = async (planName) => {
    setIsLoading(true);
    try {
      // Create Razorpay Order
      const response = await API.post('/subscriptions/order', { planName });
      const { orderId, amount, currency, key, isMock } = response.data;

      setSelectedPlan(planName);

      if (isMock) {
        // Trigger Development Mock Modal Gateway
        setMockOrderId(orderId);
        setIsMockModalOpen(true);
      } else {
        // Load official SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          addToast('Razorpay Checkout failed to initialize. Try again later.', 'error');
          return;
        }

        const options = {
          key,
          amount,
          currency,
          name: 'ConnectSphere Premium',
          description: `Subscribe to ${planName} Plan`,
          order_id: orderId,
          handler: async (paymentRes) => {
            await verifyPayment({
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentRes.razorpay_payment_id,
              razorpaySignature: paymentRes.razorpay_signature,
              planName,
            });
          },
          prefill: {
            name: user.username,
            email: user.email,
          },
          theme: {
            color: '#8b5cf6',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating checkout order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (verifyData) => {
    try {
      const response = await API.post('/subscriptions/verify', verifyData);
      
      // Update store user state
      dispatch(updateUser({
        subscription: response.data.subscription,
        points: response.data.points,
      }));

      addToast(response.data.message, 'success');
    } catch (err) {
      addToast('Payment confirmation verification failed.', 'error');
    } finally {
      setIsMockModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleMockSuccess = () => {
    verifyPayment({
      razorpayOrderId: mockOrderId,
      razorpayPaymentId: `pay_mock_${Date.now()}`,
      razorpaySignature: `sig_mock_${Date.now()}`,
      planName: selectedPlan,
    });
  };

  return (
    <div className="space-y-6">
      {/* Current User Subscription Panel */}
      <AppCard className="p-6 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard glassmorphism flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            Membership Status
          </span>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Current Tier: {user?.subscription?.status === 'premium' ? (
              <span className="text-amber-500 font-black flex items-center gap-1">
                👑 {user.subscription.plan.toUpperCase()} PREMIUM
              </span>
            ) : (
              'Free Plan'
            )}
          </h2>
          {user?.subscription?.status === 'premium' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valid until: {new Date(user.subscription.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </AppCard>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <AppCard
            key={p.name}
            className={`p-6 border flex flex-col justify-between relative bg-white dark:bg-darkcard ${
              p.popular
                ? 'border-primary-500 dark:border-primary-500/80 shadow-md ring-2 ring-primary-500/10'
                : 'border-slate-100 dark:border-darkborder'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Highly Recommended
              </span>
            )}

            <div className="space-y-4">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${p.badgeColor}`}>
                  {p.name}
                </span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {p.price}
                  </span>
                  <span className="text-xs text-slate-400">{p.billing}</span>
                </div>
                <p className="text-xs font-bold text-amber-500 mt-2">{p.bonus}</p>
              </div>

              <div className="h-px bg-slate-100 dark:bg-darkborder/50" />

              <ul className="space-y-2.5">
                {p.features.map((feat, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-slate-600 dark:text-slate-400">
                    <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <AppButton
                onClick={() => handleCheckout(p.name)}
                variant={p.popular ? 'primary' : 'secondary'}
                className="w-full"
                isLoading={isLoading && selectedPlan === p.name}
              >
                {user?.subscription?.plan === p.name.toLowerCase() ? 'Renew Subscription' : 'Purchase Plan'}
              </AppButton>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Mock Payment Verification Modal Overlay */}
      <AppModal
        isOpen={isMockModalOpen}
        onClose={() => {
          setIsMockModalOpen(false);
          setSelectedPlan(null);
        }}
        title="ConnectSphere Mock Payment Gateway"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center text-xl">
            💳
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Local Testing Payment Simulator</h3>
          
          <div className="bg-slate-50 dark:bg-darkbg/40 p-4 rounded-xl border border-slate-200/50 dark:border-darkborder text-left space-y-2">
            <p className="text-xs text-slate-500">Order Reference:</p>
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 select-all block bg-slate-100 dark:bg-slate-900 p-2 rounded truncate">
              {mockOrderId}
            </code>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-500">Plan Selected:</span>
              <strong className="text-slate-700 dark:text-slate-200 uppercase">{selectedPlan}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You are running in developer mock mode. Click the button below to simulate a successful payment notification from Razorpay.
          </p>

          <div className="flex gap-2 pt-2">
            <AppButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsMockModalOpen(false);
                setSelectedPlan(null);
              }}
            >
              Cancel Payment
            </AppButton>
            <AppButton
              variant="success"
              className="flex-1"
              onClick={handleMockSuccess}
            >
              Confirm Mock Success
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default SubscriptionPage;
