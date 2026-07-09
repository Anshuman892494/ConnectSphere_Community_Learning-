import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductsDropdown from './ProductsDropdown';
import ForTeamsPopover from './ForTeamsPopover';
import AboutPopover from './AboutPopover';

const BrandLogo = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const containerRef = useRef(null);

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="flex items-center h-full relative">
      
      {/* Brand Icon and Title */}
      <Link to="/" className="flex items-center gap-1.5 hover:bg-[#e3e6e8] h-full px-3 transition-all duration-150 mr-1.5">
        <div className="w-7 h-7 flex items-center justify-center">
          <svg aria-hidden="true" className="w-8 h-8 text-[#F48024]" viewBox="0 0 32 37">
            <path d="M26 33v-9h4v13H0V24h4v9h22Z" fill="#BCBBBB"></path>
            <path d="m21.5 0-2.7 2 9.9 13.3 2.7-2L21.5 0ZM26 18.4 13.3 7.8l2.1-2.5 12.7 10.6-2.1 2.5ZM9.1 15.2l15 7 1.4-3-15-7-1.4 3Zm14 10.79.68-2.95-16.1-3.35L7 23l16.1 2.99ZM23 30H7v-3h16v3Z" fill="#F48024"></path>
          </svg>
        </div>
        <span className="font-sans text-[18px] text-[#232629] tracking-tight leading-none mt-0.5 font-normal">
          connect<span className="font-bold">sphere</span>
        </span>
      </Link>

      {/* Interactive Links styled exactly like Stack Overflow navigation item classes */}
      <div className="hidden md:flex items-center text-[13px] h-full font-sans">
        
        {/* About Trigger */}
        <button
          type="button"
          onClick={() => toggleMenu('about')}
          className={`hover:bg-[#e3e6e8] text-[#525960] hover:text-[#232629] px-3.5 py-1.5 rounded-full mx-0.5 transition-all duration-150 cursor-pointer font-normal text-xs ${
            activeMenu === 'about' ? 'bg-[#e3e6e8] text-[#232629] font-medium' : ''
          }`}
        >
          About
        </button>

        {/* Products Trigger */}
        <button
          type="button"
          onClick={() => toggleMenu('products')}
          className={`hover:bg-[#e3e6e8] text-[#525960] hover:text-[#232629] px-3.5 py-1.5 rounded-full mx-0.5 transition-all duration-150 cursor-pointer font-normal text-xs ${
            activeMenu === 'products' ? 'bg-[#e3e6e8] text-[#232629] font-medium' : ''
          }`}
        >
          Products
        </button>

        {/* For Teams Trigger */}
        <button
          type="button"
          onClick={() => toggleMenu('teams')}
          className={`hover:bg-[#e3e6e8] text-[#525960] hover:text-[#232629] px-3.5 py-1.5 rounded-full mx-0.5 transition-all duration-150 cursor-pointer font-normal text-xs ${
            activeMenu === 'teams' ? 'bg-[#e3e6e8] text-[#232629] font-medium' : ''
          }`}
        >
          For Teams
        </button>
      </div>

      {/* Render Dropdowns */}
      {activeMenu === 'about' && (
        <AboutPopover onClose={() => setActiveMenu(null)} />
      )}
      {activeMenu === 'products' && (
        <ProductsDropdown onClose={() => setActiveMenu(null)} />
      )}
      {activeMenu === 'teams' && (
        <ForTeamsPopover onClose={() => setActiveMenu(null)} />
      )}
    </div>
  );
};

export default BrandLogo;
