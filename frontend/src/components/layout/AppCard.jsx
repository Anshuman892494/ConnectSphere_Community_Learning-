import React from 'react';

const AppCard = ({
  children,
  className = '',
  hover = true,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        glass
          ? 'glassmorphism'
          : 'bg-white border-slate-100 dark:bg-darkcard dark:border-darkborder text-slate-800 dark:text-slate-100'
      } ${
        hover
          ? 'hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700/80'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default AppCard;
