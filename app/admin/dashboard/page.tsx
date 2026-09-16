'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { logout } from '@/utils/firebase-auth';
import { getProjects, getSiteSettings, updateSiteSettings } from '@/utils/firebase-service';
import { defaultProjects, defaultSiteSettings } from '@/lib/defaultContent';
import type { Project, SiteSettings } from '@/lib/types';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [notice, setNotice] = useState('');

  useEffect(() => onAuthStateChanged(auth, async current => {
    setUser(current);
    if (current) {
      const [nextSettings, nextProjects] = await Promise.all([getSiteSettings(), getProjects()]);
      setSettings(nextSettings); setProjects(nextProjects);
    }
    setLoading(false);
  }), []);

  if (loading) return <main className="min-h-[70vh] px-4 py-32 text-center text-cyan-300">Checking authentication…</main>;
  if (!user) return <main className="min-h-[70vh] px-4 py-32 text-center text-slate-300">Please sign in at <a className="text-cyan-300" href="/admin">/admin</a>.</main>;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice('');
    try { await updateSiteSettings(settings); setNotice('Settings saved to Firestore.'); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Unable to save settings.'); }
  }

  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-28">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6"><div><p className="font-mono text-xs text-cyan-300">AUTHENTICATED CMS</p><h1 className="text-3xl font-bold text-white">Portfolio dashboard</h1><p className="text-sm text-slate-400">{user.email}</p></div><button onClick={() => logout()} className="rounded border border-red-400/40 px-4 py-2 text-red-200">Sign out</button></header>
    {notice && <p role="status" className="rounded border border-cyan-400/30 bg-cyan-950/30 p-3 text-cyan-200">{notice}</p>}
    <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]"><form onSubmit={save} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6"><h2 className="text-xl font-semibold text-white">Site settings</h2><label className="block text-sm text-slate-300">Name<input value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><label className="block text-sm text-slate-300">Professional title<input value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><label className="block text-sm text-slate-300">Bio<textarea rows={5} value={settings.bio} onChange={e => setSettings({...settings, bio: e.target.value})} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><button className="rounded bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Save settings</button></form><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6"><h2 className="text-xl font-semibold text-white">Projects ({projects.length})</h2><div className="mt-4 space-y-3">{projects.map(project => <article key={project.id} className="border-b border-slate-800 pb-3"><h3 className="font-semibold text-white">{project.title}</h3><p className="text-sm text-slate-400">{project.category} · {project.featured ? 'Featured' : 'Standard'}</p></article>)}</div><p className="mt-5 text-xs text-slate-500">Project CRUD and uploads remain available through the Firebase service layer and should be extended here with your authenticated admin account.</p></div></section>
  </main>;
}
