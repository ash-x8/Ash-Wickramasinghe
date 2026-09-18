'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Terminal, 
  ArrowRight, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { auth } from '@/config/firebase';
import { loginWithEmail, loginWithGoogle, logout } from '@/utils/firebase-auth';
import { CyberCard } from '@/app/components/CyberCard';

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle email/password authentication
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await loginWithEmail(email.trim(), password);
      router.push('/admin/dashboard');
    } catch (cause: any) {
      console.error('Authentication failed:', cause);
      let message = 'Authentication failed. Please verify your credentials.';
      if (cause.code === 'auth/invalid-credential' || cause.code === 'auth/user-not-found' || cause.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please try again.';
      } else if (cause.code === 'auth/too-many-requests') {
        message = 'Access temporarily restricted due to multiple failed attempts. Please try again later.';
      } else if (cause.message) {
        message = cause.message;
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  // Handle Google authentication
  async function handleGoogleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push('/admin/dashboard');
    } catch (cause: any) {
      console.error('Google authentication error:', cause);
      let message = 'Google sign-in encountered an issue.';
      if (cause.code === 'auth/popup-closed-by-user') {
        message = 'Authentication window was closed before authorization completed.';
      } else if (cause.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please enable popups for this site.';
      } else if (cause.message) {
        message = cause.message;
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  // If already authenticated, show status card
  if (user) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-4 py-28 font-sans">
        <CyberCard glowColor="cyan" highlightHeader="OPERATOR // AUTHENTICATED" className="w-full p-8 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4]">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Administrator Authenticated</h1>
            <p className="text-sm font-mono text-[#10B981]">{user.email}</p>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Cryptographic authentication handshake verified. CMS control plane is ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>ENTER DASHBOARD</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#111827] text-slate-300 hover:text-white font-mono text-xs rounded-lg border border-slate-700 transition-all"
            >
              SIGN OUT
            </button>
          </div>
        </CyberCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-4 py-28 font-sans">
      <CyberCard glowColor="cyan" highlightHeader="SECURE_GATEWAY // CMS_AUTH" className="w-full p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-3">
            <KeyRound size={13} />
            <span>OPERATOR ACCESS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sign in with an authorized administrator account to manage portfolio content and inquiries.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-mono text-slate-300 uppercase">Admin Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@domain.com"
              className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none transition-colors"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-mono text-slate-300 uppercase">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Lock size={14} />
            <span>{busy ? 'AUTHENTICATING...' : 'SIGN IN WITH CREDENTIALS'}</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-700 hover:border-[#06B6D4] flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <span>CONTINUE WITH GOOGLE AUTH</span>
          </button>
        </form>
      </CyberCard>
    </main>
  );
}
