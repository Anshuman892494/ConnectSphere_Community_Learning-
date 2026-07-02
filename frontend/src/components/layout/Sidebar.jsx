import React from 'react';
import { NavLink } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="hidden md:block w-[164px] flex-shrink-0 border-r border-gray-200 bg-white h-screen sticky top-[50px] pt-6 overflow-y-auto z-30">
      <nav className="flex flex-col text-[13px] text-gray-600">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `py-2 pl-2 pr-1 transition-colors ${
              isActive
                ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
                : 'hover:text-gray-900'
            }`
          }
        >
          Home
        </NavLink>

        <div className="mt-4 mb-1 pl-2 text-[11px] text-gray-500 font-semibold tracking-wider">
          PUBLIC
        </div>
        
        <NavLink
          to="/questions"
          className={({ isActive }) =>
            `flex items-center gap-1 py-2 pl-2 pr-1 transition-colors ${
              isActive
                ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
                : 'hover:text-gray-900 hover:bg-gray-100'
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
          to="/tags"
          className={({ isActive }) =>
            `py-2 pl-8 pr-1 transition-colors ${
              isActive
                ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
                : 'hover:text-gray-900 hover:bg-gray-100'
            }`
          }
        >
          Tags
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `py-2 pl-8 pr-1 transition-colors ${
              isActive
                ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
                : 'hover:text-gray-900 hover:bg-gray-100'
            }`
          }
        >
          Users
        </NavLink>
        
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            `py-2 pl-8 pr-1 transition-colors ${
              isActive
                ? 'font-bold text-gray-900 bg-[#F1F2F3] border-r-[3px] border-[#F48024]'
                : 'hover:text-gray-900 hover:bg-gray-100'
            }`
          }
        >
          Companies
        </NavLink>

        <div className="mt-4 flex flex-col pl-2 pr-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold tracking-wider mb-2">
            <span>COLLECTIVES</span>
            <span className="text-gray-400 hover:text-blue-500 cursor-pointer">Explore</span>
          </div>
          <div className="text-xs text-gray-600 px-2 py-1 flex items-center gap-2 hover:bg-gray-100 cursor-pointer rounded-sm">
            <span className="text-yellow-600 font-bold text-sm">★</span>
            Explore Collectives
          </div>
        </div>

        <div className="mt-4 flex flex-col pl-2 pr-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold tracking-wider mb-2">
            <span>TEAMS</span>
            <span className="text-gray-400 hover:text-blue-500 cursor-pointer">What's this?</span>
          </div>
          <div className="px-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer py-1.5 rounded-sm flex items-center gap-2">
            <span className="text-orange-500 bg-orange-100 px-1 py-0.5 rounded text-[10px] font-bold">Free 30 Day Trial</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
