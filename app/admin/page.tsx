'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { loginWithEmail, loginWithGoogle, logout } from '@/utils/firebase-auth';

export default function AdminLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-28">
        <div className="w-full rounded-xl border border-cyan-400/30 bg-slate-900/80 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin authenticated</h1>
          <p className="mt-2 text-slate-400">{user.email}</p>
          <a className="mt-6 inline-block rounded bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="/admin/dashboard">Open dashboard</a>
          <button className="ml-3 rounded border border-slate-600 px-5 py-3 text-slate-200" onClick={() => logout()}>Sign out</button>
        </div>
      </main>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    try { await loginWithEmail(email.trim(), password); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }

  async function google() {
    setBusy(true); setError('');
    try { await loginWithGoogle(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Google authentication failed.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-28">
      <form onSubmit={submit} className="w-full space-y-5 rounded-xl border border-cyan-400/30 bg-slate-900/80 p-8 shadow-xl">
        <div><p className="font-mono text-xs uppercase tracking-widest text-cyan-300">Protected CMS</p><h1 className="mt-2 text-3xl font-bold text-white">Admin sign in</h1><p className="mt-2 text-sm text-slate-400">Use a Firebase Authentication account with the admin custom claim.</p></div>
        {error && <p role="alert" className="rounded border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        <label className="block text-sm text-slate-300">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white" /></label>
        <label className="block text-sm text-slate-300">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white" /></label>
        <button disabled={busy} className="w-full rounded bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Authenticating…' : 'Sign in with email'}</button>
        <button type="button" disabled={busy} onClick={google} className="w-full rounded border border-slate-600 px-4 py-3 text-white disabled:opacity-50">Continue with Google</button>
      </form>
    </main>
  );
}
