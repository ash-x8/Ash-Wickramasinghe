import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  auth,
  onAuthStateChanged,
  loginWithGooglePopup,
  logoutAdmin,
  ensureInitialContentSeeded,
  User,
} from '../lib/firebase';
import { apiFetch, setSessionToken } from '../lib/apiClient';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUserProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isPrimaryOwner: boolean;
  hasPassword: boolean;
  totpEnabled: boolean;
  recoveryCodesRemaining: number;
  status: 'active' | 'revoked';
  lastPasswordChangeAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSessionMeta {
  id: string;
  browser: string;
  os: string;
  deviceType: string;
  maskedIp: string;
  createdAt: string;
  lastActiveAt?: string;
  expiresAt: string;
}

interface AuthContextType {
  user: AdminUserProfile | null;
  session: AdminSessionMeta | null;
  firebaseUser: User | null;
  loading: boolean;
  authReady: boolean;
  isAdmin: boolean;
  role: AdminRole | null;
  completeSession: (sessionToken: string, admin: AdminUserProfile, session: AdminSessionMeta) => void;
  refreshSession: () => Promise<void>;
  linkGoogleCloudSync: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [session, setSession] = useState<AdminSessionMeta | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await apiFetch<{
        authenticated: boolean;
        admin?: AdminUserProfile;
        session?: AdminSessionMeta;
      }>('/api/auth/session');

      if (res?.authenticated && res.admin && res.session) {
        setUser(res.admin);
        setSession(res.session);
      } else {
        setUser(null);
        setSession(null);
        setSessionToken(null);
      }
    } catch {
      setUser(null);
      setSession(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.emailVerified) {
        ensureInitialContentSeeded().catch(() => {});
      }
    });
    return () => unsub();
  }, [refreshSession]);

  const completeSession = useCallback(
    (sessionToken: string, adminProfile: AdminUserProfile, sessionMeta: AdminSessionMeta) => {
      setSessionToken(sessionToken);
      setUser(adminProfile);
      setSession(sessionMeta);
      setAuthReady(true);
      setLoading(false);
    },
    []
  );

  const linkGoogleCloudSync = useCallback(async () => {
    const { user: fbUser } = await loginWithGooglePopup();
    setFirebaseUser(fbUser);
    return fbUser;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network failure during signout
    }
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    setSessionToken(null);
    setUser(null);
    setSession(null);
    setFirebaseUser(null);
    setLoading(false);
  }, []);

  const isAdmin = Boolean(user && user.status === 'active' && user.totpEnabled);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        firebaseUser,
        loading,
        authReady,
        isAdmin,
        role: user?.role || null,
        completeSession,
        refreshSession,
        linkGoogleCloudSync,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C59B63]/20 border-t-[#C59B63] animate-spin" />
          <span className="text-xs font-mono tracking-wider text-slate-400">
            Verifying administrator session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
