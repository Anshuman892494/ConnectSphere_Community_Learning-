import React from 'react';
import AppButton from './AppButton';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error processing your request.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/20 dark:bg-rose-950/5 ${className}`}>
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <AppButton
          onClick={onRetry}
          variant="danger"
          className="mt-4"
        >
          Try Again
        </AppButton>
      )}
    </div>
  );
};

export default ErrorState;
