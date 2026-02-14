/**
 * @sdods/ui - React Component Library
 */

import * as React from 'react';
import { clsx } from 'clsx';

// ============================================================
// THEME
// ============================================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export const themes: Record<string, Theme> = {
  yarlis: {
    name: 'yarlis',
    colors: {
      primary: '#316FA7',
      secondary: '#7C3AED',
      accent: '#06B6D4',
      background: '#0F172A',
      foreground: '#F8FAFC',
      muted: '#64748B',
      border: '#334155',
      error: '#EF4444',
      success: '#22C55E',
      warning: '#F59E0B',
    },
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    radii: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
  },
  light: {
    name: 'light',
    colors: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#06B6D4',
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#64748B',
      border: '#E2E8F0',
      error: '#EF4444',
      success: '#22C55E',
      warning: '#F59E0B',
    },
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    radii: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
  },
};

// ============================================================
// THEME CONTEXT
// ============================================================

const ThemeContext = React.createContext<Theme>(themes.yarlis);

export interface ThemeProviderProps {
  theme?: Theme | keyof typeof themes;
  children: React.ReactNode;
}

export function ThemeProvider({ theme = 'yarlis', children }: ThemeProviderProps) {
  const resolvedTheme = typeof theme === 'string' ? themes[theme] : theme;

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      <div
        style={{
          '--color-primary': resolvedTheme.colors.primary,
          '--color-secondary': resolvedTheme.colors.secondary,
          '--color-accent': resolvedTheme.colors.accent,
          '--color-background': resolvedTheme.colors.background,
          '--color-foreground': resolvedTheme.colors.foreground,
          '--color-muted': resolvedTheme.colors.muted,
          '--color-border': resolvedTheme.colors.border,
          '--color-error': resolvedTheme.colors.error,
          '--color-success': resolvedTheme.colors.success,
          '--color-warning': resolvedTheme.colors.warning,
          '--font-sans': resolvedTheme.fonts.sans,
          '--font-mono': resolvedTheme.fonts.mono,
          '--radius-sm': resolvedTheme.radii.sm,
          '--radius-md': resolvedTheme.radii.md,
          '--radius-lg': resolvedTheme.radii.lg,
          '--radius-full': resolvedTheme.radii.full,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return React.useContext(ThemeContext);
}

// ============================================================
// BUTTON
// ============================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[var(--color-primary)] text-white hover:opacity-90 focus:ring-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)] text-white hover:opacity-90 focus:ring-[var(--color-secondary)]',
      outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-muted)]/10',
      ghost: 'bg-transparent hover:bg-[var(--color-muted)]/10',
      destructive: 'bg-[var(--color-error)] text-white hover:opacity-90 focus:ring-[var(--color-error)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
      md: 'h-10 px-4 text-base rounded-[var(--radius-md)]',
      lg: 'h-12 px-6 text-lg rounded-[var(--radius-md)]',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================================
// CARD
// ============================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-background)] border border-[var(--color-border)]',
      elevated: 'bg-[var(--color-background)] shadow-lg',
      outlined: 'bg-transparent border-2 border-[var(--color-border)]',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-[var(--radius-lg)] p-6',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// ============================================================
// INPUT
// ============================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-10 px-3 rounded-[var(--radius-md)] border bg-[var(--color-background)] text-[var(--color-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
            error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-[var(--color-error)]">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// BADGE
// ============================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-muted)]/20 text-[var(--color-foreground)]',
      primary: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
      success: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
      error: 'bg-[var(--color-error)]/20 text-[var(--color-error)]',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center px-2 py-1 text-xs font-medium rounded-[var(--radius-full)]',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

// ============================================================
// SPINNER
// ============================================================

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      className={clsx('animate-spin text-[var(--color-primary)]', sizes[size], className)}
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ============================================================
// AVATAR
// ============================================================

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export function Avatar({ size = 'md', fallback, src, alt, className, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  if (error || !src) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white font-medium',
          sizes[size],
          className
        )}
      >
        {fallback || alt?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={clsx('rounded-[var(--radius-full)] object-cover', sizes[size], className)}
      {...props}
    />
  );
}
