import React from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

const AchievementsDropdown = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);

  const achievements = [
    {
      id: 1,
      type: 'reputation',
      change: '+10',
      reason: 'Upvote on your question "How to perfectly align a div using Tailwind CSS?"',
      time: '3 hours ago',
      positive: true
    },
    {
      id: 2,
      type: 'badge',
      badgeClass: 'bronze',
      badgeName: 'Scholar',
      reason: 'Earned Scholar badge: Asked a question and accepted an answer',
      time: '2 days ago',
      positive: true
    },
    {
      id: 3,
      type: 'reputation',
      change: '+15',
      reason: 'Your answer on "Best practices for React directory structure in 2026" was accepted',
      time: '4 days ago',
      positive: true
    },
    {
      id: 4,
      type: 'reputation',
      change: '-2',
      reason: 'Your question received a downvote',
      time: '1 week ago',
      positive: false
    }
  ];

  return (
    <div className="absolute right-0 top-[50px] w-[360px] bg-white border border-[#e3e6e8] rounded shadow-xl z-50 text-[13px] text-gray-800 overflow-hidden transform origin-top-right transition-all font-sans">
      
      {/* Header */}
      <div className="bg-[#f8f9f9] px-4 py-2.5 border-b border-[#e3e6e8] flex justify-between items-center">
        <span className="font-bold text-[#232629] flex items-center gap-1.5 text-xs">
          <Trophy size={13} className="text-[#F48024]" /> Achievements
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6a737c] bg-[#e3e6e8]/40 px-2 py-0.5 rounded">
          <TrendingUp size={11} className="text-emerald-600" />
          <span>Rep: {user?.reputation !== undefined ? user.reputation.toLocaleString() : 1}</span>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[#e3e6e8] max-h-[320px] overflow-y-auto">
        {achievements.map((item) => (
          <div 
            key={item.id} 
            className="p-3 hover:bg-[#f8f9f9] transition-colors duration-150 flex items-start gap-3"
          >
            {/* Type Indicator */}
            {item.type === 'reputation' ? (
              <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded flex-shrink-0 w-[36px] text-center ${
                item.positive 
                  ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border border-emerald-150' 
                  : 'bg-rose-50 text-rose-700 border border-rose-150'
              }`}>
                {item.change}
              </span>
            ) : (
              <span className={`p-1.5 rounded flex-shrink-0 border ${
                item.badgeClass === 'gold' 
                  ? 'bg-yellow-50 text-yellow-600 border-yellow-250' 
                  : item.badgeClass === 'silver' 
                  ? 'bg-slate-50 text-slate-500 border-slate-250' 
                  : 'bg-amber-50 text-amber-800 border-amber-250'
              }`}>
                <Award size={13} />
              </span>
            )}

            <div className="flex-1">
              <p className="text-[12px] text-[#232629] font-normal leading-normal">
                {item.reason}
              </p>
              <span className="text-[10px] text-[#6a737c] block mt-0.5">
                {item.time}
              </span>
            </div>
          </div>
        ))}
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

export default AchievementsDropdown;
