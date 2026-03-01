import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

export async function signOut() {
    await fbSignOut(auth);
}
