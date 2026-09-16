import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(result => result.user);
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider()).then(result => result.user);
export const logout = () => signOut(auth);
export { onAuthStateChanged };
export type { User };
