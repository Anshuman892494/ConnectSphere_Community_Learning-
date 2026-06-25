import React from 'react';

const AppAvatar = ({
  src,
  name = '',
  size = 'md',
  isPremium = false,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const getInitials = (str) => {
    if (!str) return '?';
    return str.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 select-none ${
        isPremium ? 'ring-2 ring-amber-400 dark:ring-amber-500' : 'ring-1 ring-slate-200 dark:ring-darkborder'
      } ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ''; // Force fallback back to initials on error
          }}
        />
      ) : (
        <div className="h-full w-full rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold flex items-center justify-center">
          {getInitials(name)}
        </div>
      )}
      {isPremium && (
        <span className="absolute -top-1 -right-1 bg-amber-400 text-[10px] text-amber-950 font-extrabold rounded-full px-1 shadow-sm">
          👑
        </span>
      )}
    </div>
  );
};

export default AppAvatar;
