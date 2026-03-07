/**
 * Google One Tap Pattern
 * Floating login prompt in corner (like Mailchimp)
 */
import { cn } from '../../lib/cn';
import { X } from 'lucide-react';

export interface GoogleOneTapProps {
  clientId: string;
  onSuccess?: (response: { credential: string }) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
  autoPrompt?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

/**
 * Manual One Tap UI (for when you want custom styling)
 */
export function GoogleOneTapPrompt({
  email,
  avatarUrl,
  onContinue,
  onDismiss,
  position = 'top-right',
  className,
}: {
  email: string;
  avatarUrl?: string;
  onContinue: () => void;
  onDismiss: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={cn(
        'fixed z-50 w-80 bg-background border rounded-lg shadow-2xl p-4 animate-in slide-in-from-right-5 fade-in-0',
        positionClasses[position],
        className
      )}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm text-muted-foreground">Sign in with Google</span>
      </div>

      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            {email.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{email}</div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Continue as {email.split('@')[0]}
      </button>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        To create your account, Google will share your name, email address, and profile picture.
      </p>
    </div>
  );
}

export { GoogleOneTapPrompt as GoogleOneTap };
