import React from 'react';

const PageContainer = ({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${maxWidth} ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
