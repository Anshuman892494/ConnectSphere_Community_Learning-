import React from 'react';

const AppBadge = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none';

  const variants = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default AppBadge;
