import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from '../../contexts/LanguageContext';
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
  PlusSquare, 
  Menu,
  PanelLeftClose, 
  PanelLeftOpen,
  Globe
} from 'lucide-react';
import { toggleTheme } from '../../store/themeSlice';
import { logout } from '../../store/authSlice';
import API from '../../services/api';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const moreMenuRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleCreatePost = () => {
    window.dispatchEvent(new Event('open-create-post-modal'));
  };

  const navLinks = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/messages', label: t('messages'), icon: MessageSquare },
    { to: '/team', label: t('team'), icon: Users },
    { to: '/reports', label: t('reports'), icon: FileText },
  ];

  return (
    <aside 
      className={`h-screen flex-shrink-0 bg-white/75 dark:bg-neutral-900/60 border-r border-neutral-200 dark:border-neutral-800/40 flex flex-col justify-between transition-all duration-300 ease-in-out select-none z-30 backdrop-blur-xl ${
        isCollapsed ? 'w-[72px] px-2 py-6' : 'w-64 p-6'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} min-h-[50px] mb-4`}>
          {!isCollapsed ? (
            <>
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-sm shadow-indigo-500/20 dark:shadow-indigo-500/10 hover:rotate-12 transition-transform duration-350">
                  <Globe className="text-white w-4 h-4" />
                </div>
                <span className="font-sans font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                  ConnectSphere
                </span>
              </NavLink>
              <button 
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all active:scale-95"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-sm shadow-indigo-500/20 dark:shadow-indigo-500/10 hover:rotate-12 transition-transform duration-350 cursor-pointer"
                title="Expand"
              >
                <Globe className="text-white w-4 h-4" />
              </div>
              <button 
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all active:scale-95"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl text-base font-medium transition-all duration-205 cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'text-neutral-900 dark:text-neutral-100 font-bold bg-neutral-50 dark:bg-neutral-900'
                      : 'text-neutral-650 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`
                }
                title={isCollapsed ? link.label : ''}
              >
                <Icon size={24} className="transition-transform duration-200" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}

          {/* Custom Create Post Link (Instagram Style) */}
          <button
            onClick={handleCreatePost}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl text-base font-medium transition-all duration-205 cursor-pointer text-neutral-650 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-200 ${
              isCollapsed ? 'justify-center' : 'w-full text-left'
            }`}
            title={isCollapsed ? t('createPost') : ''}
          >
            <PlusSquare size={24} />
            {!isCollapsed && <span>{t('create')}</span>}
          </button>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="relative flex flex-col gap-4">
        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <div 
            ref={moreMenuRef}
            className={`absolute bottom-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50 w-56 flex flex-col gap-1 transition-all duration-200 ${
              isCollapsed ? 'left-2' : 'left-0'
            }`}
          >
            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={() => setShowMoreMenu(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              <Settings size={18} />
              <span>{t('settings')}</span>
            </NavLink>

            {/* Switch Appearance */}
            <button
              onClick={() => {
                handleToggleTheme();
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{t('switchAppearance')}</span>
            </button>

            <hr className="border-neutral-100 dark:border-neutral-800 my-1" />

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}

        {/* More Button */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex items-center gap-4 px-3 py-3 rounded-xl text-base font-medium text-neutral-655 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-200 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={t('more')}
        >
          <Menu size={24} />
          {!isCollapsed && <span>{t('more')}</span>}
        </button>

        {/* Profile Info block */}
        <NavLink 
          to={`/profile/${user.username}`}
          className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black flex items-center justify-center font-bold text-sm uppercase shadow-sm">
              {user.username.charAt(0)}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-indigo-500 transition-colors">
                {user.username}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrator' : 'Free plan'}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
