'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, sendPasswordResetEmail, User } from 'firebase/auth';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { auth } from '@/config/firebase';
import { loginWithEmail, logout } from '@/utils/firebase-auth';
import { CyberCard } from '@/app/components/CyberCard';

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

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
      let message = 'Authentication failed. Please verify your administrator credentials.';
      if (cause.code === 'auth/invalid-credential' || cause.code === 'auth/user-not-found' || cause.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Access denied.';
      } else if (cause.code === 'auth/too-many-requests') {
        message = 'Access temporarily restricted due to multiple failed attempts. Please wait a moment and try again.';
      } else if (cause.message) {
        message = cause.message;
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  // Handle password reset
  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your administrator email address to receive a password reset link.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (cause: any) {
      console.error('Password reset failed:', cause);
      setError('Password reset link could not be sent: ' + (cause.message || 'Verification error'));
    } finally {
      setBusy(false);
    }
  }

  // If already authenticated
  if (user) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-4 py-28 font-sans">
        <CyberCard glowColor="cyan" highlightHeader="ADMINISTRATOR // AUTHENTICATED" className="w-full p-8 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4]">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Administrator Authenticated</h1>
            <p className="text-sm font-mono text-[#10B981]">{user.email}</p>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Firebase session active. Navigating to CMS control panel...
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>ENTER DASHBOARD</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#111827] text-slate-300 hover:text-white font-mono text-xs rounded-lg border border-slate-700 transition-all cursor-pointer"
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
      <CyberCard glowColor="cyan" highlightHeader="RESTRICTED_ACCESS // CONTROL_PLANE" className="w-full p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-3">
            <KeyRound size={13} />
            <span>ADMINISTRATOR GATEWAY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sign in with your administrator email and password to manage portfolio content.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Password reset email dispatched to {email}. Check your inbox.</span>
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
              placeholder="admin@domain.com"
              className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none transition-colors"
            />
          </label>

          <label className="block space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-300 uppercase">Password</span>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-mono text-[#06B6D4] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Lock size={14} />
            <span>{busy ? 'AUTHENTICATING...' : 'SIGN IN TO DASHBOARD'}</span>
          </button>
        </form>
      </CyberCard>
    </main>
  );
}
