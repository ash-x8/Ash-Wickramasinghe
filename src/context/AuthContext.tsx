import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  loginAdmin, 
  logoutAdmin, 
  sendAdminPasswordReset, 
  onAuthStateChanged,
  AUTHORIZED_ADMIN_EMAIL
} from '../lib/firebase';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

  const resetPassword = async (email: string) => {
    await sendAdminPasswordReset(email);
  };

  const logout = async () => {
    await logoutAdmin();
    setUser(null);
  };

  const isAdmin = !!user && (user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword, isAdmin }}>
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
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-neutral-800 border-t-neutral-200 rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-wider uppercase text-neutral-500 font-mono">Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
