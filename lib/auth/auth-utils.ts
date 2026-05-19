import { AuthError } from '@supabase/supabase-js';
import { AuthenticationError } from '../supabase';

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const normalizeUsername = (username: string): string => {
  return username.trim().toLowerCase();
};

export const validateUsername = (username: string): string | null => {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername.length < 3) {
    return 'Username must be at least 3 characters long';
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  return null;
};

export const createPseudoEmail = (username: string): string => {
  return `${normalizeUsername(username)}@wrkout.app`;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const handleAuthError = (error: unknown): never => {
  if (isAuthError(error)) {
    switch (error.message) {
      case 'Invalid login credentials':
        throw new AuthenticationError('Invalid email or password', error);
      case 'Email not confirmed':
        throw new AuthenticationError('Please confirm your email address', error);
      case 'User already registered':
        throw new AuthenticationError('An account with this email already exists', error);
      default:
        throw new AuthenticationError('Authentication failed', error);
    }
  }
  throw error;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}; 
