import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#232629] text-[#babfc4] text-[11px] py-8 md:py-12 border-t border-gray-800 font-sans mt-auto">
      <div className="max-w-[1264px] mx-auto px-4 flex flex-col md:flex-row gap-8 justify-between">
        
        {/* Left: Brand Logo & Icon */}
        <div className="flex-shrink-0 flex items-start gap-2">
          <svg className="w-8 h-9 text-[#F48024]" viewBox="0 0 26 31" fill="currentColor">
            <path d="m22.18 16.32.05.02-.02.01za19 19 0 0 0-2.45 4.14l-.03.07q-.94 2.19-1.29 4.6v.03a18 18 0 0 0-.05 4.85H.01v-4.88h15.94l.1-.6L.69 20.48l1.28-4.7 15.55 4.1.22-.46-13.96-7.96 2.47-4.22 14.16 8.07.34-.4L9.15 3.47 12.65 0l11.78 11.64 1.25 1.23q-1.97 1.5-3.5 3.44" />
          </svg>
        </div>

        {/* Center: Footnote columns */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6">
          
          {/* Column 1: Stack Overflow */}
          <div>
            <h5 className="font-bold uppercase text-[12px] text-white mb-3 tracking-wide">ConnectSphere</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Questions</Link></li>
              <li><Link to="/tags" className="hover:text-white transition-colors">Tags</Link></li>
              <li><Link to="/users" className="hover:text-white transition-colors">Users</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Column 2: Products */}
          <div>
            <h5 className="font-bold uppercase text-[12px] text-white mb-3 tracking-wide">Products</h5>
            <ul className="space-y-2">
              <li className="hover:text-white transition-colors cursor-pointer">Teams</li>
              <li className="hover:text-white transition-colors cursor-pointer">Advertising</li>
              <li className="hover:text-white transition-colors cursor-pointer">Collectives</li>
              <li className="hover:text-white transition-colors cursor-pointer">Talent</li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h5 className="font-bold uppercase text-[12px] text-white mb-3 tracking-wide">Company</h5>
            <ul className="space-y-2">
              <li className="hover:text-white transition-colors cursor-pointer">About</li>
              <li className="hover:text-white transition-colors cursor-pointer">Press</li>
              <li className="hover:text-white transition-colors cursor-pointer">Work Here</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* Column 4: Networks */}
          <div>
            <h5 className="font-bold uppercase text-[12px] text-white mb-3 tracking-wide">Stack Exchange Network</h5>
            <ul className="space-y-2">
              <li className="hover:text-white transition-colors cursor-pointer">Technology</li>
              <li className="hover:text-white transition-colors cursor-pointer">Culture & recreation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Life & arts</li>
              <li className="hover:text-white transition-colors cursor-pointer">API</li>
            </ul>
          </div>

        </div>

        {/* Right: Copyright info */}
        <div className="flex flex-col justify-between items-start md:items-end text-[#9199a1]">
          <div className="flex gap-3 text-xs mb-4 md:mb-0">
            <span className="hover:text-white cursor-pointer transition-colors">Blog</span>
            <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
          </div>
          <p className="mt-auto md:text-right max-w-xs text-[#9199a1] leading-relaxed">
            Site design / logo © 2026 ConnectSphere Community Learning. All rights reserved. Stack Overflow content licensed under CC BY-SA.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
