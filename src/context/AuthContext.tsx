import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, loginAdmin, loginWithGoogle, logoutAdmin, onAuthStateChanged } from '../lib/firebase';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  loginGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await loginAdmin(email, pass);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setUser(null);
  };

  const isAdmin = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, loginGoogle, logout, isAdmin }}>
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
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-[#00f0ff] font-mono">
        <div className="relative w-16 h-16 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] animate-pulse">Authenticating Cyber Security Clearance...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
