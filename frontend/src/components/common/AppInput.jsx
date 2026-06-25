import React from 'react';

const AppInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 dark:bg-darkcard dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-200 dark:border-darkborder focus:border-primary-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : ''}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default AppInput;
