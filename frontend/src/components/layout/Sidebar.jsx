import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Rss } from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const links = [
    { to: '/', label: 'Social Feed', icon: Rss },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-darkcard border-r border-slate-250 dark:border-darkborder min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors duration-200">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
          Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-darkborder mt-4">
        <div className="bg-slate-50 dark:bg-darkbg/40 p-3 rounded-xl flex flex-col gap-1 border border-slate-100 dark:border-darkborder/50">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Connected Profile
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-1">
            {user.username}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">
            Role: {user.role === 'admin' ? '🛡️ Administrator' : '🎓 Member'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
