'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  ShieldCheck, 
  LogOut, 
  FileText, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  Terminal, 
  Layers, 
  ExternalLink, 
  Plus, 
  X, 
  Eye, 
  Save, 
  Mail, 
  Cpu, 
  Database, 
  Clock,
  Palette,
  Megaphone,
  Film,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { auth } from '@/config/firebase';
import { logout } from '@/utils/firebase-auth';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  getContactMessages, 
  updateMessageStatus, 
  deleteContactMessage, 
  uploadMediaFile 
} from '@/lib/firebase';
import { CyberCard } from '@/app/components/CyberCard';
import type { SiteSettings, Project, ContactMessage, SkillItem, ProjectCategory } from '@/lib/types';
import { defaultSiteSettings, defaultProjects } from '@/lib/defaultContent';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'cv' | 'projects' | 'skills' | 'messages'>('profile');
  
  // Data States
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Upload States
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  // Project Modal / Edit State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(90);
  const [newSkillCategory, setNewSkillCategory] = useState<SkillItem['category']>('Frontend & UI');

  // Listen to Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [loadedSettings, loadedProjects, loadedMessages] = await Promise.all([
          getSiteSettings().catch(() => null),
          getProjects().catch(() => null),
          getContactMessages().catch(() => [])
        ]);
        if (loadedSettings) setSettings(loadedSettings);
        if (loadedProjects && loadedProjects.length > 0) setProjects(loadedProjects);
        if (loadedMessages) setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await updateSiteSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setSaveError(err.message || "Failed to update Firestore settings.");
    }
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setSaveError(null);
    try {
      const downloadUrl = await uploadMediaFile(file, 'avatars');
      const updated = { ...settings, avatarUrl: downloadUrl };
      setSettings(updated);
      await updateSiteSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setSaveError("Upload failed: " + (err.message || "Storage error"));
    } finally {
      setAvatarUploading(false);
    }
  };

  // CV PDF Upload Handler
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);
    setSaveError(null);
    try {
      const downloadUrl = await uploadMediaFile(file, 'resumes');
      const updated = { ...settings, cvUrl: downloadUrl };
      setSettings(updated);
      await updateSiteSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("CV upload failed:", err);
      setSaveError("CV Upload failed: " + (err.message || "Storage error"));
    } finally {
      setCvUploading(false);
    }
  };

  // Project Image Upload Handler
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectImageUploading(true);
    try {
      const downloadUrl = await uploadMediaFile(file, 'projects');
      setEditingProject(prev => ({ ...prev, image: downloadUrl }));
    } catch (err) {
      console.error("Project image upload failed:", err);
    } finally {
      setProjectImageUploading(false);
    }
  };

  // Open Project Modal
  const openProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject({ ...proj });
      setTagInput((proj.tags || proj.technologies || []).join(', '));
    } else {
      setEditingProject({
        title: '',
        category: 'Full-Stack',
        description: '',
        detailedDescription: '',
        image: '/ash_cyber_portrait.jpg',
        tags: ['Graphic Design', 'Branding', 'Creative'],
        technologies: ['Graphic Design', 'Branding'],
        githubUrl: 'https://github.com/ash-wickramasinghe',
        liveUrl: '',
        featured: false,
        order: projects.length + 1
      });
      setTagInput('Graphic Design, Branding, Creative');
    }
    setIsProjectModalOpen(true);
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title || !editingProject.description) return;

    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const projectPayload: Omit<Project, 'id'> = {
      title: editingProject.title || 'Untitled Project',
      category: (editingProject.category as ProjectCategory) || 'Full-Stack',
      description: editingProject.description || '',
      detailedDescription: editingProject.detailedDescription || editingProject.description || '',
      image: editingProject.image || '/ash_cyber_portrait.jpg',
      tags: parsedTags,
      technologies: parsedTags,
      githubUrl: editingProject.githubUrl || '',
      liveUrl: editingProject.liveUrl || '',
      featured: !!editingProject.featured,
      order: editingProject.order || (projects.length + 1),
      architectureNotes: editingProject.architectureNotes || []
    };

    try {
      if (editingProject.id) {
        // Update existing
        await updateProject(editingProject.id, projectPayload);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectPayload } : p));
      } else {
        // Create new
        const newId = await createProject(projectPayload);
        const created: Project = { id: newId, ...projectPayload };
        setProjects(prev => [created, ...prev]);
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error("Failed to save project:", err);
      alert("Error saving project: " + err.message);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this project record?")) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert("Could not delete project: " + err.message);
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: SkillItem = {
      name: newSkillName.trim(),
      level: Number(newSkillLevel),
      category: newSkillCategory
    };

    const updatedSkills = [...(settings.skills || []), newSkill];
    const updatedSettings = { ...settings, skills: updatedSkills };
    setSettings(updatedSettings);
    setNewSkillName('');

    try {
      await updateSiteSettings(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error("Error saving skill:", err);
      setSaveError("Failed to save skill: " + err.message);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (index: number) => {
    const updatedSkills = (settings.skills || []).filter((_, i) => i !== index);
    const updatedSettings = { ...settings, skills: updatedSkills };
    setSettings(updatedSettings);

    try {
      await updateSiteSettings(updatedSettings);
    } catch (err: any) {
      console.error("Error updating skills:", err);
    }
  };

  // Toggle Message Status
  const handleToggleMessage = async (id: string, currentStatus?: 'read' | 'unread') => {
    const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      await updateMessageStatus(id, nextStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus, read: nextStatus === 'read' } : m));
    } catch (err) {
      console.error("Error toggling message status:", err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Unauthenticated or Checking State
  if (authChecking) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center font-mono text-[#06B6D4]">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#06B6D4] animate-ping" />
          <span>VERIFYING CRYPTOGRAPHIC SESSION...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-32">
        <CyberCard glowColor="cyan" highlightHeader="ACCESS_RESTRICTED" className="max-w-md p-8 text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white font-sans">Authentication Required</h1>
            <p className="text-sm text-slate-400 font-mono">
              You must be signed in with an authorized administrator account to access the CMS portal.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg"
          >
            <span>GO TO SIGN IN</span>
            <ArrowRight size={14} />
          </Link>
        </CyberCard>
      </main>
    );
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      
      {/* TOP HUD BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-2">
            <ShieldCheck size={14} />
            <span>OPERATOR_PANEL // AUTHENTICATED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portfolio CMS Dashboard
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Active Session: <span className="text-[#10B981] font-bold">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>VIEW LIVE SITE</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-mono text-xs rounded-lg border border-red-500/40 flex items-center gap-1.5 transition-all"
          >
            <LogOut size={14} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* STATUS NOTICES */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>FIRESTORE SYNCHRONIZATION COMPLETE. ALL CHANGES PERSISTED.</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} />
          <span>SYSTEM ALERT: {saveError}</span>
        </div>
      )}

      {/* TELEMETRY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 font-mono">
          <div className="text-xs text-slate-400 uppercase">PROJECTS</div>
          <div className="text-2xl font-bold text-white mt-1">{projects.length}</div>
          <div className="text-[10px] text-[#06B6D4] mt-0.5">{projects.filter(p => p.featured).length} Featured</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 font-mono">
          <div className="text-xs text-slate-400 uppercase">UNREAD INQUIRIES</div>
          <div className="text-2xl font-bold text-[#06B6D4] mt-1">{unreadCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{messages.length} Total Messages</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 font-mono">
          <div className="text-xs text-slate-400 uppercase">ACTIVE SKILLS</div>
          <div className="text-2xl font-bold text-white mt-1">{(settings.skills || []).length}</div>
          <div className="text-[10px] text-[#10B981] mt-0.5">Competency Matrix</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 font-mono">
          <div className="text-xs text-slate-400 uppercase">DATABASE</div>
          <div className="text-2xl font-bold text-[#10B981] mt-1">CONNECTED</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Firestore Cloud DB</div>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-8">
        {[
          { id: 'profile', label: 'PROFILE & DOSSIER', icon: <Terminal size={14} /> },
          { id: 'cv', label: 'CV & CREDENTIALS', icon: <FileText size={14} /> },
          { id: 'projects', label: `PROJECTS (${projects.length})`, icon: <Layers size={14} /> },
          { id: 'skills', label: `SKILLS (${(settings.skills || []).length})`, icon: <Cpu size={14} /> },
          { id: 'messages', label: `MESSAGES (${unreadCount} NEW)`, icon: <Mail size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-lg font-mono text-xs tracking-wider flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <CyberCard glowColor="cyan" highlightHeader="CONFIG // PROFILE_DATA" className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Identity &amp; Narrative Parameters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Operator Name</span>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Professional Designation</span>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Availability Status</span>
                <input
                  type="text"
                  value={settings.statusText}
                  onChange={(e) => setSettings({ ...settings, statusText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Clearance Marker</span>
                <input
                  type="text"
                  value={settings.clearanceLevel}
                  onChange={(e) => setSettings({ ...settings, clearanceLevel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Hero Overview Bio</span>
              <textarea
                rows={3}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Detailed Dossier Bio (About Page)</span>
              <textarea
                rows={4}
                value={settings.aboutBio}
                onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            {/* Avatar Uploader */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-300 uppercase block mb-3">Operator Avatar / Portrait</span>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-[#0B0F17] flex-shrink-0">
                  <img
                    src={settings.avatarUrl || "/ash_cyber_portrait.jpg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg"; }}
                  />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input
                    type="text"
                    value={settings.avatarUrl}
                    onChange={(e) => setSettings({ ...settings, avatarUrl: e.target.value })}
                    placeholder="Direct Image URL or upload below"
                    className="w-full px-4 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-700 flex items-center gap-2 transition-all">
                      <UploadCloud size={14} className="text-[#06B6D4]" />
                      <span>{avatarUploading ? 'UPLOADING...' : 'UPLOAD NEW AVATAR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={avatarUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-mono">PNG, JPG, WEBP (Max 10MB)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Channels & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <label className="block space-y-1.5">
                <span className="text-xs font-mono text-slate-400">Email</span>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded text-white font-mono text-xs"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-mono text-slate-400">Location</span>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded text-white font-mono text-xs"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-mono text-slate-400">GitHub</span>
                <input
                  type="text"
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded text-white font-mono text-xs"
                />
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2"
              >
                <Save size={15} />
                <span>SAVE PROFILE CONFIGURATION</span>
              </button>
            </div>
          </CyberCard>
        </form>
      )}

      {/* TAB 2: CV */}
      {activeTab === 'cv' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <CyberCard glowColor="cyan" highlightHeader="CONFIG // CV_MANAGEMENT" className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Curriculum Vitae Document Asset</h3>
                <p className="text-sm text-slate-400 font-mono">Synchronized with the interactive /cv dossier view.</p>
              </div>
              <Link
                href="/cv"
                target="_blank"
                className="px-3 py-1.5 bg-[#111827] text-[#06B6D4] font-mono text-xs rounded border border-slate-700 hover:border-[#06B6D4] flex items-center gap-1.5"
              >
                <span>TEST VIEWER</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Current CV Document URL (PDF)</span>
              <input
                type="text"
                value={settings.cvUrl}
                onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <div className="p-6 rounded-xl bg-[#0B0F17] border border-dashed border-slate-700 text-center space-y-3">
              <FileText size={32} className="mx-auto text-[#06B6D4]" />
              <div className="text-sm text-white font-bold">Upload New CV / Resume Document</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Upload your updated PDF resume. The file will be stored in Firebase Storage and set as your live active dossier.
              </p>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-600 transition-all">
                  <UploadCloud size={16} className="text-[#06B6D4]" />
                  <span>{cvUploading ? 'UPLOADING TO STORAGE...' : 'SELECT PDF DOCUMENT'}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleCvUpload}
                    disabled={cvUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2"
              >
                <Save size={15} />
                <span>SAVE CV SETTINGS</span>
              </button>
            </div>
          </CyberCard>
        </form>
      )}

      {/* TAB 3: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Project Catalog ({projects.length})</h3>
              <p className="text-xs font-mono text-slate-400">Add, modify, or retire portfolio showcase entries.</p>
            </div>
            <button
              onClick={() => openProjectModal()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 self-start"
            >
              <Plus size={16} />
              <span>NEW PROJECT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <CyberCard key={proj.id} highlightHeader={proj.category} className="flex flex-col justify-between overflow-hidden">
                <div className="relative h-44 w-full bg-[#0B0F17]">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg"; }}
                  />
                  {proj.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#10B981]/90 text-[10px] font-mono font-bold text-slate-950">
                      FEATURED
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white">{proj.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProjectModal(proj)}
                        className="p-1.5 rounded bg-[#111827] text-slate-300 hover:text-[#06B6D4] border border-slate-700"
                        title="Edit Project"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded bg-red-950/40 text-red-300 hover:text-red-100 border border-red-500/30"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-xs font-mono text-slate-500">
                      Order: #{proj.order ?? 0}
                    </div>
                  </div>
                </div>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-8">
          {/* Add Skill Form */}
          <CyberCard glowColor="cyan" highlightHeader="NEW_COMPETENCY // APPEND" className="p-6">
            <form onSubmit={handleAddSkill} className="space-y-4">
              <h3 className="text-base font-bold text-white">Add Skill or Tool to Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-400">Skill Name</span>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g., Graphic Design, Premiere Pro, Figma"
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-400">Category</span>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  >
                    <option value="Frontend & UI">Frontend &amp; UI / Design</option>
                    <option value="Backend & APIs">Creative Tools &amp; Adobe Suite</option>
                    <option value="Cyber & Security">Video &amp; Motion Media</option>
                    <option value="Cloud & DevOps">Social Media &amp; Web Tech</option>
                    <option value="Databases & Tools">Digital Marketing &amp; Analytics</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-400">Proficiency: {newSkillLevel}%</span>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B0F17] font-mono text-xs font-bold uppercase rounded flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>ADD TO MATRIX</span>
                </button>
              </div>
            </form>
          </CyberCard>

          {/* Current Skills List */}
          <CyberCard highlightHeader="MATRIX // ACTIVE_SKILLS" className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(settings.skills || []).map((skill, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-white font-bold truncate">{skill.name}</span>
                      <span className="text-[#06B6D4] ml-2">{skill.level}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#06B6D4]" style={{ width: `${skill.level}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{skill.category}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-2"
                    title="Remove Skill"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </CyberCard>
        </div>
      )}

      {/* TAB 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Direct Communications ({messages.length})</h3>
              <p className="text-xs font-mono text-slate-400">Incoming inquiries submitted via the /contact dossier terminal.</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <CyberCard className="p-12 text-center text-slate-400 font-mono text-xs">
              NO INCOMING TRANSMISSIONS RECORDED IN DATABASE.
            </CyberCard>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <CyberCard 
                  key={msg.id}
                  glowColor={msg.status === 'unread' ? 'cyan' : undefined}
                  highlightHeader={msg.status === 'unread' ? 'STATUS // UNREAD' : 'STATUS // ARCHIVED'}
                  className="p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{msg.subject}</h4>
                      <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                        <span>From: <strong className="text-[#06B6D4]">{msg.name}</strong></span>
                        <span>Email: <a href={`mailto:${msg.email}`} className="text-slate-300 underline">{msg.email}</a></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => msg.id && handleToggleMessage(msg.id, msg.status)}
                        className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                          msg.status === 'unread'
                            ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {msg.status === 'unread' ? 'MARK AS READ' : 'MARK UNREAD'}
                      </button>
                      <button
                        onClick={() => msg.id && handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded bg-red-950/40 text-red-300 hover:text-red-100 border border-red-500/30"
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {msg.message}
                  </p>
                </CyberCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROJECT MODAL (ADD / EDIT) */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0F17] border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                <h3 className="text-xl font-bold text-white">
                  {editingProject.id ? 'Edit Project Dossier' : 'Create New Project'}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">Project Title *</span>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">Category *</span>
                  <select
                    value={editingProject.category || 'Full-Stack'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  >
                    <option value="Full-Stack">Full-Stack / Web</option>
                    <option value="Web Apps">Web Applications</option>
                    <option value="Cyber/Tools">Creative &amp; Branding</option>
                    <option value="Cloud & Systems">Social Media &amp; Content</option>
                    <option value="Scripts">Video &amp; Motion Media</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Short Summary Description *</span>
                <textarea
                  rows={2}
                  required
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Detailed Case Study Description</span>
                <textarea
                  rows={3}
                  value={editingProject.detailedDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>

              {/* Project Image */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 block">Project Poster Image</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingProject.image || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                    placeholder="Image URL or upload below"
                    className="flex-1 px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-[#111827] hover:bg-slate-800 text-slate-300 font-mono text-xs rounded border border-slate-700 flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud size={14} className="text-[#06B6D4]" />
                    <span>{projectImageUploading ? 'UPLOADING...' : 'UPLOAD'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProjectImageUpload}
                      disabled={projectImageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">Live URL</span>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">GitHub / Repository URL</span>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Tags / Tools (Comma-separated)</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Graphic Design, Branding, Next.js"
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                />
              </label>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProject.featured}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#06B6D4]"
                  />
                  <span className="text-xs font-mono text-white">Featured Project</span>
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Order:</span>
                  <input
                    type="number"
                    value={editingProject.order || 1}
                    onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-mono text-xs rounded hover:bg-slate-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase rounded"
                >
                  SAVE PROJECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
