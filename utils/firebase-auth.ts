import {
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function handleAuthError(error: AuthError): string {
  const errorMessages: { [key: string]: string } = {
    'auth/operation-not-allowed': 'Email/password login is currently disabled. Please try Google login or contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/too-many-requests': 'Too many login attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
  };

  return errorMessages[error.code] || `Authentication error: ${error.message}`;
}
