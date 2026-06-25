import React from 'react';

const AppLoader = ({
  type = 'spinner',
  rows = 3,
  className = '',
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <svg
          className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // Skeleton Card Loaders
  return (
    <div className={`flex flex-col gap-4 w-full py-4 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full animate-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/4 rounded animate-shimmer" />
              <div className="h-3 w-1/6 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-4 w-5/6 rounded animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export default AppLoader;
