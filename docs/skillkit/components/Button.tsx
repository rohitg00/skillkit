import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const BASE_STYLES = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 font-mono tracking-tight";

const VARIANT_STYLES = {
  primary: "bg-white text-black hover:bg-zinc-200 border border-white",
  secondary: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800",
  outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white",
  ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
} as const;

export function Button({
  children,
  variant = 'primary',
  className = '',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps): React.ReactElement {
  const widthClass = fullWidth ? 'w-full' : '';

  const classes = [
    BASE_STYLES,
    VARIANT_STYLES[variant],
    widthClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESSING
        </>
      ) : children}
    </button>
  );
}