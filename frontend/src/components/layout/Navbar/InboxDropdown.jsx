import React, { useState, useEffect } from 'react';
import { Mail, Check, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

const InboxDropdown = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const list = [];
    
    // 1. Verification warning
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      const items = [];
      if (!user.isEmailVerified) items.push('email');
      if (!user.isPhoneVerified) items.push('phone');
      list.push({
        id: 'verify',
        type: 'system',
        title: 'Complete profile verification',
        body: `Please verify your ${items.join(' and ')} in settings to secure your account.`,
        time: 'Just now',
        read: false
      });
    }

    // 2. Subscription status
    const plan = user.subscription?.plan || 'Free';
    if (plan === 'Free') {
      list.push({
        id: 'sub',
        type: 'system',
        title: 'Upgrade your subscription',
        body: 'You are on the Free plan. Upgrade to Bronze, Silver or Gold for higher daily question limits.',
        time: '1 hour ago',
        read: false
      });
    } else {
      list.push({
        id: 'sub',
        type: 'system',
        title: `Active ${plan} Plan`,
        body: `Thank you for supporting ConnectSphere! Your ${plan} plan is fully active.`,
        time: 'Active',
        read: true
      });
    }

    // 3. Reputation milestone
    const rep = user.reputation || 1;
    list.push({
      id: 'rep',
      type: 'badge',
      title: `Reputation Score: ${rep}`,
      body: `You have accumulated ${rep} reputation points. Keep participating to unlock more benefits!`,
      time: 'Live',
      read: true
    });

    setNotifications(list);
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };


  return (
    <div className="absolute right-0 top-[50px] w-[360px] bg-white border border-[#e3e6e8] rounded shadow-xl z-50 text-[13px] text-gray-800 overflow-hidden transform origin-top-right transition-all font-sans">
      
      {/* Header */}
      <div className="bg-[#f8f9f9] px-4 py-2.5 border-b border-[#e3e6e8] flex justify-between items-center">
        <span className="font-bold text-[#232629] flex items-center gap-1.5 text-xs">
          <Bell size={13} className="text-[#525960]" /> Inbox
        </span>
        <button 
          onClick={markAllRead} 
          className="text-[11px] text-[#0074cc] hover:text-[#0a95ff] font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Check size={11} /> Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-[#e3e6e8] max-h-[320px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              onClick={() => toggleRead(item.id)}
              className={`p-3 hover:bg-[#f8f9f9] transition-colors duration-150 cursor-pointer flex gap-3 relative ${
                !item.read ? 'bg-[#f4f8fb]' : ''
              }`}
            >
              {/* Unread indicator */}
              {!item.read && (
                <span className="absolute left-2 top-4 w-1.5 h-1.5 bg-[#0a95ff] rounded-full" />
              )}

              <div className="flex-1 pl-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-[#0c0d0e] text-xs leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-[#6a737c] whitespace-nowrap flex-shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-[#525960] mt-0.5 leading-normal line-clamp-2">
                  {item.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#e3e6e8] bg-[#f8f9f9] text-center p-2">
        <button 
          onClick={onClose}
          className="text-[11px] font-semibold text-[#525960] hover:text-[#232629] transition-colors py-1 cursor-pointer w-full block"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InboxDropdown;
