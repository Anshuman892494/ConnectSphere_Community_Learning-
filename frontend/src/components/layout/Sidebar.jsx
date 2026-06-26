import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen 
} from 'lucide-react';
import { toggleTheme } from '../../store/themeSlice';
import { logout } from '../../store/authSlice';
import API from '../../services/api';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const navLinks = [
    { to: '/', label: 'Feed', icon: Home },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`h-screen flex-shrink-0 bg-white dark:bg-darkcard border-r border-slate-200 dark:border-darkborder flex flex-col justify-between transition-all duration-300 ease-in-out select-none z-30 ${
        isCollapsed ? 'w-20 px-3 py-6' : 'w-64 p-6'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} min-h-[40px]`}>
          {!isCollapsed ? (
            <>
              <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                <img src="/logo.png" alt="ConnectSphere Logo" className="w-8 h-8 rounded-lg object-cover" />
                ConnectSphere
              </NavLink>
              <button 
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                title="Hide sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <img 
                src="/logo.png" 
                alt="ConnectSphere Logo" 
                className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform" 
                title="ConnectSphere" 
                onClick={() => setIsCollapsed(false)} 
              />
              <button 
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                title="Show sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button 
              onClick={() => setIsCollapsed(false)}
              className="p-3 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-l-4 border-emerald-500 rounded-l-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
                title={isCollapsed ? link.label : ''}
              >
                <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col gap-4">
        <hr className="border-slate-100 dark:border-darkborder" />

        {/* Switch Appearance (Theme toggle) */}
        <button
          onClick={handleToggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Switch Appearance"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span>Switch appearance</span>}
        </button>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 hover:text-rose-650 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Log out"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Log out</span>}
        </button>

        {/* Profile Info block */}
        <div className={`flex items-center gap-3 px-2 py-1 ${isCollapsed ? 'justify-center' : ''}`}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-darkborder shadow-sm"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
              {user.username.charAt(0)}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.username}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrator' : 'Free plan'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
