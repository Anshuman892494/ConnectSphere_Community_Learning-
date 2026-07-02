import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Inbox, Trophy, HelpCircle, LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';
import API from '../../services/api';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-t-[3px] border-t-[#F48024] border-b border-gray-300 shadow-sm h-[50px] flex items-center">
      <div className="max-w-[1264px] mx-auto px-4 w-full h-full flex items-center justify-between">
        
        {/* Left: Logo & Links */}
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center gap-1 hover:bg-gray-100 h-full px-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg aria-hidden="true" className="w-8 h-8 text-[#F48024]" viewBox="0 0 32 37"><path d="M26 33v-9h4v13H0V24h4v9h22Z" fill="#BCBBBB"></path><path d="m21.5 0-2.7 2 9.9 13.3 2.7-2L21.5 0ZM26 18.4 13.3 7.8l2.1-2.5 12.7 10.6-2.1 2.5ZM9.1 15.2l15 7 1.4-3-15-7-1.4 3Zm14 10.79.68-2.95-16.1-3.35L7 23l16.1 2.99ZM23 30H7v-3h16v3Z" fill="#F48024"></path></svg>
            </div>
            <span className="font-sans text-[18px] text-gray-800 tracking-tight leading-none mt-1">
              connect<span className="font-bold">sphere</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center text-[13px] text-gray-600 h-full">
            <Link to="/" className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1 rounded-full mx-1">About</Link>
            <Link to="/" className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1 rounded-full mx-1">Products</Link>
            <Link to="/" className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1 rounded-full mx-1">For Teams</Link>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-3xl px-4 flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#0074CC]/20 focus:border-[#0074CC] sm:text-[13px]"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right: User Icons */}
        <div className="flex items-center h-full">
          {user ? (
            <div className="flex items-center">
              <Link to={`/profile/${user.username}`} className="flex items-center hover:bg-gray-100 px-3 h-[50px]">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="h-6 w-6 rounded-md object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-xs ml-2 text-gray-700 font-mono">1</span>
                <div className="flex items-center ml-2 space-x-1 text-[10px]">
                  <span className="text-yellow-600 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>0</span>
                  <span className="text-gray-400 flex items-center"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>0</span>
                  <span className="text-yellow-800 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-800 rounded-full mr-1"></span>0</span>
                </div>
              </Link>
              <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors h-[50px] px-3">
                <Inbox size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors h-[50px] px-3">
                <Trophy size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors h-[50px] px-3">
                <HelpCircle size={20} />
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors h-[50px] px-3" title="Log out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex gap-1 ml-2">
              <Link to="/login" className="text-[13px] text-[#0074CC] bg-[#E1ECF4] border border-[#7AA7C7] hover:bg-[#B3D3EA] px-3 py-1.5 rounded-[3px] font-medium transition-colors">
                Log in
              </Link>
              <Link to="/register" className="text-[13px] text-white bg-[#0A95FF] border border-[#0A95FF] hover:bg-[#0074CC] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] px-3 py-1.5 rounded-[3px] font-medium transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
