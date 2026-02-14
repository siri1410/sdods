/**
 * @sdods/auth - Provider-agnostic authentication
 */

import type { User, Result } from '@sdods/core';

// ============================================================
// TYPES
// ============================================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthProviderConfig {
  adapter: AuthAdapter;
  onAuthStateChange?: (state: AuthState) => void;
  persistSession?: boolean;
}

export type AuthError = {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_EXISTS' | 'WEAK_PASSWORD' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  originalError?: unknown;
};

// ============================================================
// AUTH ADAPTER INTERFACE
// ============================================================

export interface AuthAdapter {
  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;

  /**
   * Sign in with email/password
   */
  signInWithEmail(credentials: AuthCredentials): Promise<Result<User, AuthError>>;

  /**
   * Sign up with email/password
   */
  signUpWithEmail(credentials: AuthCredentials): Promise<Result<User, AuthError>>;

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth(provider: 'google' | 'github' | 'microsoft'): Promise<Result<User, AuthError>>;

  /**
   * Sign out current user
   */
  signOut(): Promise<Result<void, AuthError>>;

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Get current token
   */
  getToken(): Promise<AuthToken | null>;

  /**
   * Refresh token
   */
  refreshToken(): Promise<Result<AuthToken, AuthError>>;

  /**
   * Send password reset email
   */
  sendPasswordReset(email: string): Promise<Result<void, AuthError>>;

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<Pick<User, 'displayName' | 'photoURL'>>): Promise<Result<User, AuthError>>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  /**
   * Dispose adapter resources
   */
  dispose(): void;
}

// ============================================================
// AUTH PROVIDER
// ============================================================

export class AuthProvider {
  private adapter: AuthAdapter;
  private state: AuthState;
  private listeners: Set<(state: AuthState) => void> = new Set();
  private unsubscribe?: () => void;

  constructor(config: AuthProviderConfig) {
    this.adapter = config.adapter;
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    };

    if (config.onAuthStateChange) {
      this.listeners.add(config.onAuthStateChange);
    }
  }

  async initialize(): Promise<void> {
    await this.adapter.initialize();

    this.unsubscribe = this.adapter.onAuthStateChanged(async (user) => {
      const token = user ? await this.adapter.getToken() : null;
      this.updateState({
        user,
        token,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    // Get initial state
    const user = await this.adapter.getCurrentUser();
    const token = user ? await this.adapter.getToken() : null;
    this.updateState({
      user,
      token,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }

  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(callback: (state: AuthState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state); // Emit current state
    return () => this.listeners.delete(callback);
  }

  async signIn(credentials: AuthCredentials): Promise<Result<User, AuthError>> {
    this.updateState({ isLoading: true });
    const result = await this.adapter.signInWithEmail(credentials);
    this.updateState({ isLoading: false });
    return result;
  }

  async signUp(credentials: AuthCredentials): Promise<Result<User, AuthError>> {
    this.updateState({ isLoading: true });
    const result = await this.adapter.signUpWithEmail(credentials);
    this.updateState({ isLoading: false });
    return result;
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'microsoft'): Promise<Result<User, AuthError>> {
    this.updateState({ isLoading: true });
    const result = await this.adapter.signInWithOAuth(provider);
    this.updateState({ isLoading: false });
    return result;
  }

  async signOut(): Promise<Result<void, AuthError>> {
    return this.adapter.signOut();
  }

  async sendPasswordReset(email: string): Promise<Result<void, AuthError>> {
    return this.adapter.sendPasswordReset(email);
  }

  async updateProfile(updates: Partial<Pick<User, 'displayName' | 'photoURL'>>): Promise<Result<User, AuthError>> {
    return this.adapter.updateProfile(updates);
  }

  async getToken(): Promise<AuthToken | null> {
    return this.adapter.getToken();
  }

  dispose(): void {
    this.unsubscribe?.();
    this.adapter.dispose();
    this.listeners.clear();
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createAuthProvider(config: AuthProviderConfig): AuthProvider {
  return new AuthProvider(config);
}

// ============================================================
// RE-EXPORTS
// ============================================================

export type { User } from '@sdods/core';
