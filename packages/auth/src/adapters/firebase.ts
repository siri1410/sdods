/**
 * Firebase Auth Adapter
 */

import type { User, Result } from '@sdods/core';
import { Ok, Err } from '@sdods/core';
import type { AuthAdapter, AuthCredentials, AuthToken, AuthError } from '../index';

// Lazy import Firebase to keep it optional
let firebaseAuth: typeof import('firebase/auth') | null = null;

export interface FirebaseAdapterConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
}

export class FirebaseAdapter implements AuthAdapter {
  private config: FirebaseAdapterConfig;
  private auth: import('firebase/auth').Auth | null = null;

  constructor(config: FirebaseAdapterConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    const { initializeApp, getApps } = await import('firebase/app');
    firebaseAuth = await import('firebase/auth');

    const apps = getApps();
    const app = apps.length > 0
      ? apps[0]
      : initializeApp({
          apiKey: this.config.apiKey,
          authDomain: this.config.authDomain || `${this.config.projectId}.firebaseapp.com`,
          projectId: this.config.projectId,
        });

    this.auth = firebaseAuth.getAuth(app);
  }

  private mapFirebaseUser(fbUser: import('firebase/auth').User): User {
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || undefined,
      photoURL: fbUser.photoURL || undefined,
      emailVerified: fbUser.emailVerified,
      metadata: {
        createdAt: new Date(fbUser.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(fbUser.metadata.lastSignInTime || Date.now()),
      },
    };
  }

  private mapFirebaseError(error: unknown): AuthError {
    const fbError = error as { code?: string; message?: string };
    const code = fbError.code || '';

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', originalError: error };
      case 'auth/user-not-found':
        return { code: 'USER_NOT_FOUND', message: 'No account found with this email', originalError: error };
      case 'auth/email-already-in-use':
        return { code: 'EMAIL_EXISTS', message: 'An account already exists with this email', originalError: error };
      case 'auth/weak-password':
        return { code: 'WEAK_PASSWORD', message: 'Password is too weak', originalError: error };
      case 'auth/network-request-failed':
        return { code: 'NETWORK_ERROR', message: 'Network error. Check your connection.', originalError: error };
      default:
        return { code: 'UNKNOWN', message: fbError.message || 'An unknown error occurred', originalError: error };
    }
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<Result<User, AuthError>> {
    if (!this.auth || !firebaseAuth) throw new Error('Firebase not initialized');

    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      return Ok(this.mapFirebaseUser(result.user));
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async signUpWithEmail(credentials: AuthCredentials): Promise<Result<User, AuthError>> {
    if (!this.auth || !firebaseAuth) throw new Error('Firebase not initialized');

    try {
      const result = await firebaseAuth.createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      return Ok(this.mapFirebaseUser(result.user));
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'microsoft'): Promise<Result<User, AuthError>> {
    if (!this.auth || !firebaseAuth) throw new Error('Firebase not initialized');

    try {
      let authProvider: import('firebase/auth').AuthProvider;

      switch (provider) {
        case 'google':
          authProvider = new firebaseAuth.GoogleAuthProvider();
          break;
        case 'github':
          authProvider = new firebaseAuth.GithubAuthProvider();
          break;
        case 'microsoft':
          authProvider = new firebaseAuth.OAuthProvider('microsoft.com');
          break;
      }

      const result = await firebaseAuth.signInWithPopup(this.auth, authProvider);
      return Ok(this.mapFirebaseUser(result.user));
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async signOut(): Promise<Result<void, AuthError>> {
    if (!this.auth || !firebaseAuth) throw new Error('Firebase not initialized');

    try {
      await firebaseAuth.signOut(this.auth);
      return Ok(undefined);
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.auth) return null;
    const user = this.auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  async getToken(): Promise<AuthToken | null> {
    if (!this.auth?.currentUser) return null;

    const token = await this.auth.currentUser.getIdToken();
    const result = await this.auth.currentUser.getIdTokenResult();

    return {
      accessToken: token,
      expiresAt: new Date(result.expirationTime),
    };
  }

  async refreshToken(): Promise<Result<AuthToken, AuthError>> {
    if (!this.auth?.currentUser) {
      return Err({ code: 'USER_NOT_FOUND', message: 'No user signed in' });
    }

    try {
      const token = await this.auth.currentUser.getIdToken(true);
      const result = await this.auth.currentUser.getIdTokenResult();

      return Ok({
        accessToken: token,
        expiresAt: new Date(result.expirationTime),
      });
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async sendPasswordReset(email: string): Promise<Result<void, AuthError>> {
    if (!this.auth || !firebaseAuth) throw new Error('Firebase not initialized');

    try {
      await firebaseAuth.sendPasswordResetEmail(this.auth, email);
      return Ok(undefined);
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  async updateProfile(updates: Partial<Pick<User, 'displayName' | 'photoURL'>>): Promise<Result<User, AuthError>> {
    if (!this.auth?.currentUser || !firebaseAuth) {
      return Err({ code: 'USER_NOT_FOUND', message: 'No user signed in' });
    }

    try {
      await firebaseAuth.updateProfile(this.auth.currentUser, updates);
      return Ok(this.mapFirebaseUser(this.auth.currentUser));
    } catch (error) {
      return Err(this.mapFirebaseError(error));
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!this.auth || !firebaseAuth) {
      console.warn('Firebase not initialized, skipping auth state subscription');
      return () => {};
    }

    return firebaseAuth.onAuthStateChanged(this.auth, (fbUser) => {
      callback(fbUser ? this.mapFirebaseUser(fbUser) : null);
    });
  }

  dispose(): void {
    // Firebase handles cleanup internally
  }
}
