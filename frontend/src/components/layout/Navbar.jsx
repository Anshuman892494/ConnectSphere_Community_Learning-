import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, ShieldAlert, Award, Database } from 'lucide-react';
import { toggleTheme } from '../../store/themeSlice';
import { logout } from '../../store/authSlice';
import AppAvatar from '../common/AppAvatar';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 dark:bg-darkcard dark:border-darkborder transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight">
              <span className="text-2xl">🌐</span>
              ConnectSphere
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* User points & reputation badges */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-bold border border-amber-200/50 dark:border-amber-950/40">
                  <Award size={14} />
                  <span>{user.points} XP</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-200/50 dark:border-emerald-950/40">
                  <Database size={14} />
                  <span>{user.reputation} REP</span>
                </div>
              </div>
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={`/profile/${user._id}`} className="flex items-center gap-2">
                  <AppAvatar
                    name={user.username}
                    src={user.avatar}
                    size="sm"
                    isPremium={user.subscription?.status === 'premium'}
                  />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
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
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-primary-600 px-4 py-2 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/10"
                >
                  Sign Up
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
