import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUser, createUser, isTeacherWhitelisted, isAdmin } from '../firebase/firestore';
import { signInWithGoogle, signOut } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsRoleSelect, setNeedsRoleSelect] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                const data = await getUser(user.uid);
                if (data) {
                    setUserData(data);
                    setNeedsRoleSelect(false);
                } else {
                    setNeedsRoleSelect(true);
                    setUserData(null);
                }
            } else {
                setUserData(null);
                setNeedsRoleSelect(false);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    async function login() {
        await signInWithGoogle();
    }

    async function logout() {
        await signOut();
        setUserData(null);
        setNeedsRoleSelect(false);
    }

    async function selectRole(role) {
        if (!firebaseUser) return;
        const displayName = firebaseUser.displayName || 'Duckling';
        await createUser(firebaseUser.uid, role, displayName);
        const data = await getUser(firebaseUser.uid);
        setUserData(data);
        setNeedsRoleSelect(false);
    }

    const refreshUser = useCallback(async () => {
        if (!firebaseUser) return;
        const data = await getUser(firebaseUser.uid);
        setUserData(data);
    }, [firebaseUser]);

    const checkTeacherWhitelist = useCallback(async () => {
        if (!firebaseUser) return false;
        return isTeacherWhitelisted(firebaseUser.uid);
    }, [firebaseUser]);

    const checkAdmin = useCallback(async () => {
        if (!firebaseUser) return false;
        return isAdmin(firebaseUser.uid);
    }, [firebaseUser]);

    const value = {
        firebaseUser,
        userData,
        loading,
        needsRoleSelect,
        login,
        logout,
        selectRole,
        refreshUser,
        checkTeacherWhitelist,
        checkAdmin,
        uid: firebaseUser?.uid || null,
        role: userData?.role || null,
        displayName: userData?.profile?.displayName || firebaseUser?.displayName || '',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
