import React from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, X, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { closeMobileSidebar } from '../../store/themeSlice';

const Sidebar = () => {
  const { mobileSidebarOpen } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleLinkClick = () => {
    dispatch(closeMobileSidebar());
  };

  const navLinks = (
    <>
      <NavLink
        to="/"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `py-2 pl-2 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        Home
      </NavLink>

      <div className="mt-4 mb-1 pl-2 text-[11px] text-gray-500 font-semibold tracking-wider uppercase">
        Public
      </div>
      
      <NavLink
        to="/questions"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-1 py-2 pl-2 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Globe size={16} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
            <span className="ml-1">Questions</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/social"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-1 py-2 pl-2 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Camera size={16} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
            <span className="ml-1">Social Space</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/tags"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `py-2 pl-8 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        Tags
      </NavLink>

      <NavLink
        to="/users"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `py-2 pl-8 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        Users
      </NavLink>
      
      <NavLink
        to="/companies"
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `py-2 pl-8 pr-1 transition-colors ${
            isActive
              ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
              : 'hover:text-gray-900 hover:bg-gray-100/50'
          }`
        }
      >
        Companies
      </NavLink>

      <div className="mt-4 flex flex-col pl-2 pr-1">
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold tracking-wider mb-2 uppercase">
          <span>Collectives</span>
          <span className="text-gray-400 hover:text-blue-500 cursor-pointer">Explore</span>
        </div>
        <div className="text-xs text-gray-600 px-2 py-1 flex items-center gap-2 hover:bg-gray-100 cursor-pointer rounded-sm">
          <span className="text-yellow-600 font-bold text-sm">★</span>
          Explore Collectives
        </div>
      </div>

      <div className="mt-4 flex flex-col pl-2 pr-1">
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold tracking-wider mb-2 uppercase">
          <span>Teams</span>
          <span className="text-gray-400 hover:text-blue-500 cursor-pointer">What's this?</span>
        </div>
        <div className="px-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer py-1.5 rounded-sm flex items-center gap-2">
          <span className="text-orange-500 bg-orange-100 px-1 py-0.5 rounded text-[10px] font-bold">Free 30 Day Trial</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on larger viewports) */}
      <aside className="hidden md:block w-[164px] flex-shrink-0 border-r border-gray-200 bg-white h-screen sticky top-[50px] pt-6 overflow-y-auto z-30">
        <nav className="flex flex-col text-[13px] text-gray-600">
          {navLinks}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex font-sans">
          
          {/* Transparent Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => dispatch(closeMobileSidebar())}
          />
          
          {/* Drawer content panel */}
          <aside className="relative flex flex-col w-[240px] max-w-[80%] bg-white h-full shadow-2xl p-5 overflow-y-auto border-r border-gray-200 z-50 animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <span className="font-bold text-[15px] text-gray-900">Navigation</span>
              <button 
                type="button"
                onClick={() => dispatch(closeMobileSidebar())}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                title="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col text-[14px] text-gray-600 gap-1.5">
              {navLinks}
            </nav>
          </aside>
          
        </div>
      )}
    </>
  );
};

export default Sidebar;
