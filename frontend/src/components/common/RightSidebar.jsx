import React from 'react';
import { BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

const RightSidebar = () => {
  return (
    <div className="hidden lg:block w-[300px] flex-shrink-0 text-[13px]">
      
      {/* Blog & Meta Info Box */}
      <div className="border border-[#E6E4C4] bg-[#FDF7E2] rounded-[3px] shadow-sm mb-5 overflow-hidden">
        <ul className="text-gray-800 divide-y divide-[#E6E4C4]">
          {/* Section 1: The Overflow Blog */}
          <div>
            <li className="bg-[#FBF3D5] font-bold py-2.5 px-4 text-gray-700 border-b border-[#E6E4C4] flex items-center gap-1.5">
              <BookOpen size={13} className="text-gray-500" />
              <span>The Overflow Blog</span>
            </li>
            <li className="flex items-start px-4 py-2.5 hover:bg-[#FBF9EE] transition-colors duration-150 group">
              <span className="text-gray-900 mr-2 mt-0.5 text-xs">✏️</span>
              <span className="hover:text-[#0074CC] cursor-pointer group-hover:text-[#0074CC] transition-colors">
                Designing a better interface for our users
              </span>
            </li>
            <li className="flex items-start px-4 py-2.5 hover:bg-[#FBF9EE] transition-colors duration-150 group">
              <span className="text-gray-900 mr-2 mt-0.5 text-xs">✏️</span>
              <span className="hover:text-[#0074CC] cursor-pointer group-hover:text-[#0074CC] transition-colors">
                Why copy-pasting code works (and when it doesn't)
              </span>
            </li>
          </div>

          {/* Section 2: Featured on Meta */}
          <div>
            <li className="bg-[#FBF3D5] font-bold py-2.5 px-4 text-gray-700 border-b border-[#E6E4C4] flex items-center gap-1.5">
              <MessageSquare size={13} className="text-gray-500" />
              <span>Featured on Meta</span>
            </li>
            <li className="flex items-start px-4 py-2.5 hover:bg-[#FBF9EE] transition-colors duration-150 group">
              <span className="text-[#0074CC] mr-2 mt-0.5 text-xs">💬</span>
              <span className="hover:text-[#0074CC] cursor-pointer group-hover:text-[#0074CC] transition-colors">
                Updating our Community Guidelines and Code of Conduct
              </span>
            </li>
            <li className="flex items-start px-4 py-2.5 hover:bg-[#FBF9EE] transition-colors duration-150 group">
              <span className="text-[#0074CC] mr-2 mt-0.5 text-xs">💬</span>
              <span className="hover:text-[#0074CC] cursor-pointer group-hover:text-[#0074CC] transition-colors">
                Feedback loop: How the new question editor is performing
              </span>
            </li>
          </div>
        </ul>
      </div>

      {/* Hot Network Questions */}
      <div className="mb-4 px-1">
        <h4 className="text-[15px] font-normal text-gray-800 mb-3 ml-1 flex items-center gap-1.5">
          <span>Hot Network Questions</span>
        </h4>
        <ul className="space-y-3.5">
          <li className="flex items-start group">
            <div className="w-4 h-4 bg-sky-100 text-sky-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2.5 flex-shrink-0 mt-0.5">
              S
            </div>
            <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight transition-colors">
              How to perfectly align a div using Tailwind CSS?
            </span>
          </li>
          <li className="flex items-start group">
            <div className="w-4 h-4 bg-orange-100 text-orange-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2.5 flex-shrink-0 mt-0.5">
              M
            </div>
            <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight transition-colors">
              Is there a mathematical formula for aesthetic design?
            </span>
          </li>
          <li className="flex items-start group">
            <div className="w-4 h-4 bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2.5 flex-shrink-0 mt-0.5">
              W
            </div>
            <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight transition-colors">
              Best practices for React directory structure in 2026
            </span>
          </li>
          <li className="flex items-start group">
            <div className="w-4 h-4 bg-purple-100 text-purple-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2.5 flex-shrink-0 mt-0.5">
              D
            </div>
            <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight transition-colors">
              Understanding state hydration issues in server side frameworks
            </span>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default RightSidebar;
