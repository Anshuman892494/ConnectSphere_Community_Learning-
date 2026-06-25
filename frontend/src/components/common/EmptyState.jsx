import React from 'react';
import AppButton from './AppButton';

const EmptyState = ({
  title = 'No records found',
  message = 'There is no data to show at this moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-darkborder bg-slate-50/50 dark:bg-darkcard/30 ${className}`}>
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        {message}
      </p>
      {actionLabel && onAction && (
        <AppButton
          onClick={onAction}
          variant="primary"
          className="mt-4"
        >
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
};

export default EmptyState;
