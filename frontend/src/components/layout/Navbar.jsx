import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toggleTheme } from '../../store/themeSlice';
import { logout } from '../../store/authSlice';
import API from '../../services/api';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  // Dark mode toggle with view transition animation
  const handleToggleTheme = (event) => {
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dispatch(toggleTheme());
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      dispatch(toggleTheme());
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 450,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 dark:bg-darkcard dark:border-darkborder transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-sm shadow-indigo-500/20 dark:shadow-indigo-500/10 hover:rotate-12 transition-transform duration-350">
                <Globe className="text-white w-4 h-4" />
              </div>
              <span className="font-sans font-black text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                ConnectSphere
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                      {user.username.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-primary-600 px-4 py-2 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/10"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
