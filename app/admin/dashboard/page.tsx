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
  Palette,
  Globe,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  BookOpen,
  Settings,
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
  getServices,
  createService,
  updateService,
  deleteService,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getContactMessages, 
  updateMessageStatus, 
  deleteContactMessage, 
  uploadMediaFile 
} from '@/utils/firebase-service';
import { CyberCard } from '@/app/components/CyberCard';
import type { SiteSettings, Project, ServiceItem, WritingArticle, ContactMessage, SkillItem, ProjectCategory } from '@/lib/types';
import { defaultSiteSettings, defaultProjects, defaultServices, defaultArticles } from '@/lib/defaultContent';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'cv' | 'projects' | 'services' | 'writing' | 'media' | 'messages' | 'theme' | 'seo'>('profile');
  
  // Data States
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [articles, setArticles] = useState<WritingArticle[]>(defaultArticles);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Upload States
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadedMediaList, setUploadedMediaList] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [serviceTagInput, setServiceTagInput] = useState('');

  // Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<WritingArticle> | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (!currentUser) {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch Dashboard Data
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [loadedSettings, loadedProjects, loadedServices, loadedArticles, loadedMessages] = await Promise.all([
          getSiteSettings().catch(() => null),
          getProjects().catch(() => null),
          getServices().catch(() => null),
          getArticles().catch(() => null),
          getContactMessages().catch(() => [])
        ]);
        if (loadedSettings) setSettings(loadedSettings);
        if (loadedProjects && loadedProjects.length > 0) setProjects(loadedProjects);
        if (loadedServices && loadedServices.length > 0) setServices(loadedServices);
        if (loadedArticles && loadedArticles.length > 0) setArticles(loadedArticles);
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

  // Save Site Settings
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

  // CV Upload Handler
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

  // Media Library Upload
  const handleMediaLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaUploading(true);
    try {
      const downloadUrl = await uploadMediaFile(file, 'media_library');
      setUploadedMediaList(prev => [downloadUrl, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Media upload failed:", err);
      setSaveError("Media Upload failed: " + err.message);
    } finally {
      setMediaUploading(false);
    }
  };

  // Copy to Clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
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
        slug: '',
        category: 'Graphic Design',
        description: '',
        detailedDescription: '',
        image: '/ash_cyber_portrait.jpg',
        tags: ['Graphic Design', 'Branding'],
        githubUrl: '',
        liveUrl: '',
        featured: false,
        order: projects.length + 1
      });
      setTagInput('Graphic Design, Branding');
    }
    setIsProjectModalOpen(true);
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title || !editingProject.description) return;

    const parsedTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const slug = editingProject.slug || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const projectPayload: Omit<Project, 'id'> = {
      title: editingProject.title || 'Untitled Project',
      slug,
      category: (editingProject.category as ProjectCategory) || 'Graphic Design',
      description: editingProject.description || '',
      detailedDescription: editingProject.detailedDescription || editingProject.description || '',
      image: editingProject.image || '/ash_cyber_portrait.jpg',
      tags: parsedTags,
      technologies: parsedTags,
      githubUrl: editingProject.githubUrl || '',
      liveUrl: editingProject.liveUrl || '',
      featured: !!editingProject.featured,
      order: editingProject.order || (projects.length + 1),
      client: editingProject.client || '',
      year: editingProject.year || new Date().getFullYear().toString(),
      architectureNotes: editingProject.architectureNotes || []
    };

    try {
      if (editingProject.id) {
        await updateProject(editingProject.id, projectPayload);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectPayload } : p));
      } else {
        const newId = await createProject(projectPayload);
        setProjects(prev => [{ id: newId, ...projectPayload }, ...prev]);
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
    if (!window.confirm("Permanently delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting project:", err);
    }
  };

  // Service Modal Handler
  const openServiceModal = (serv?: ServiceItem) => {
    if (serv) {
      setEditingService({ ...serv });
      setServiceTagInput((serv.tags || []).join(', '));
    } else {
      setEditingService({
        title: '',
        description: '',
        category: 'Design',
        tags: [],
        featured: true,
        order: services.length + 1
      });
      setServiceTagInput('');
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title || !editingService.description) return;

    const parsedTags = serviceTagInput.split(',').map(t => t.trim()).filter(Boolean);
    const servicePayload: Omit<ServiceItem, 'id'> = {
      title: editingService.title || '',
      description: editingService.description || '',
      category: editingService.category || 'Design',
      tags: parsedTags,
      featured: !!editingService.featured,
      order: editingService.order || (services.length + 1)
    };

    try {
      if (editingService.id) {
        await updateService(editingService.id, servicePayload);
        setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...servicePayload } : s));
      } else {
        const newId = await createService(servicePayload);
        setServices(prev => [{ id: newId, ...servicePayload }, ...prev]);
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch (err: any) {
      console.error("Error saving service:", err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // Article Modal Handler
  const openArticleModal = (art?: WritingArticle) => {
    if (art) {
      setEditingArticle({ ...art });
    } else {
      setEditingArticle({
        title: '',
        slug: '',
        summary: '',
        content: '',
        author: 'Writer Ash',
        authorRole: 'Lead Creative Designer',
        date: new Date().toISOString().split('T')[0],
        category: 'Design Strategy',
        readTime: '4 min read',
        published: true
      });
    }
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.content) return;

    const slug = editingArticle.slug || editingArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const articlePayload: Omit<WritingArticle, 'id'> = {
      title: editingArticle.title || '',
      slug,
      summary: editingArticle.summary || '',
      content: editingArticle.content || '',
      author: editingArticle.author || 'Writer Ash',
      authorRole: editingArticle.authorRole || 'Editorial Specialist',
      date: editingArticle.date || new Date().toISOString().split('T')[0],
      category: editingArticle.category || 'Design Strategy',
      readTime: editingArticle.readTime || '4 min read',
      published: editingArticle.published !== false
    };

    try {
      if (editingArticle.id) {
        await updateArticle(editingArticle.id, articlePayload);
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...articlePayload } : a));
      } else {
        const newId = await createArticle(articlePayload);
        setArticles(prev => [{ id: newId, ...articlePayload }, ...prev]);
      }
      setIsArticleModalOpen(false);
      setEditingArticle(null);
    } catch (err: any) {
      console.error("Error saving article:", err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Delete this writing article?")) return;
    try {
      await deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  };

  // Toggle Contact Message Status
  const handleToggleMessage = async (id: string, currentStatus?: 'read' | 'unread') => {
    const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      await updateMessageStatus(id, nextStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus, read: nextStatus === 'read' } : m));
    } catch (err) {
      console.error("Error toggling message status:", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Delete message?")) return;
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  if (authChecking) {
    return (
      <main className="min-h-screen pt-32 flex items-center justify-center font-mono text-[#06B6D4]">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#06B6D4] animate-ping" />
          <span>VERIFYING ADMINISTRATOR SESSION...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-2">
            <ShieldCheck size={14} />
            <span>OPERATOR CONTROL PLANE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portfolio CMS Control Panel
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Authenticated Admin: <span className="text-[#10B981] font-bold">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>PREVIEW PUBLIC SITE</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-mono text-xs rounded-lg border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* STATUS NOTICES */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] font-mono text-xs flex items-center gap-2">
          <Check size={16} />
          <span>FIRESTORE &amp; STORAGE SYNCHRONIZATION COMPLETE.</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>ALERT: {saveError}</span>
        </div>
      )}

      {/* METRICS HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8 font-mono">
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">PROJECTS</div>
          <div className="text-2xl font-bold text-white mt-1">{projects.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">SERVICES</div>
          <div className="text-2xl font-bold text-white mt-1">{services.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">ARTICLES</div>
          <div className="text-2xl font-bold text-white mt-1">{articles.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">MESSAGES</div>
          <div className="text-2xl font-bold text-[#06B6D4] mt-1">{unreadCount} New</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 uppercase">STORAGE</div>
          <div className="text-2xl font-bold text-[#10B981] mt-1">FIREBASE</div>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-8">
        {[
          { id: 'profile', label: 'PROFILE & DOSSIER', icon: <Terminal size={14} /> },
          { id: 'cv', label: 'CV & CREDENTIALS', icon: <FileText size={14} /> },
          { id: 'projects', label: `PROJECTS (${projects.length})`, icon: <Layers size={14} /> },
          { id: 'services', label: `SERVICES (${services.length})`, icon: <Sparkles size={14} /> },
          { id: 'writing', label: `WRITING (${articles.length})`, icon: <BookOpen size={14} /> },
          { id: 'media', label: 'MEDIA LIBRARY', icon: <ImageIcon size={14} /> },
          { id: 'messages', label: `MESSAGES (${unreadCount})`, icon: <Mail size={14} /> },
          { id: 'theme', label: 'THEME & ACCENT', icon: <Palette size={14} /> },
          { id: 'seo', label: 'SEO & META', icon: <Globe size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg font-mono text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
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
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <CyberCard glowColor="cyan" highlightHeader="CONFIG // PROFILE_DATA" className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Identity &amp; Narrative Parameters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Operator Name</span>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Professional Designation</span>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Hero Overview Bio</span>
              <textarea
                rows={3}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Detailed Dossier Bio (About Page)</span>
              <textarea
                rows={4}
                value={settings.aboutBio}
                onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            {/* Avatar Uploader */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-300 uppercase block mb-3">Operator Avatar / Portrait</span>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-[#070A10] flex-shrink-0">
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
                    className="w-full px-4 py-2 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-700 transition-all">
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
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
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
                <p className="text-sm text-slate-400 font-mono">Synchronized with interactive /cv page.</p>
              </div>
              <Link
                href="/cv"
                target="_blank"
                className="px-3 py-1.5 bg-[#111827] text-[#06B6D4] font-mono text-xs rounded border border-slate-700 hover:border-[#06B6D4] flex items-center gap-1.5"
              >
                <span>VIEW DOSSIER</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">CV Document URL (PDF)</span>
              <input
                type="text"
                value={settings.cvUrl}
                onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <div className="p-6 rounded-xl bg-[#070A10] border border-dashed border-slate-700 text-center space-y-3">
              <FileText size={32} className="mx-auto text-[#06B6D4]" />
              <div className="text-sm text-white font-bold">Upload New Resume / CV PDF</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Upload your latest PDF resume directly into Firebase Storage.
              </p>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-600 transition-all">
                  <UploadCloud size={16} className="text-[#06B6D4]" />
                  <span>{cvUploading ? 'UPLOADING TO STORAGE...' : 'SELECT PDF FILE'}</span>
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
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Save size={15} />
                <span>SAVE CV CONFIGURATION</span>
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
              <h3 className="text-xl font-bold text-white">Project Showcase Catalog ({projects.length})</h3>
              <p className="text-xs font-mono text-slate-400">Manage graphic design, branding, social, and web projects.</p>
            </div>
            <button
              onClick={() => openProjectModal()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 self-start cursor-pointer"
            >
              <Plus size={16} />
              <span>NEW PROJECT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <CyberCard key={proj.id} highlightHeader={proj.category} className="flex flex-col justify-between overflow-hidden">
                <div className="relative h-44 w-full bg-[#070A10]">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg"; }}
                  />
                  {proj.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#10B981] text-[10px] font-mono font-bold text-slate-950">
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
                        className="p-1.5 rounded bg-[#111827] text-slate-300 hover:text-[#06B6D4] border border-slate-700 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded bg-red-950/40 text-red-300 hover:text-red-100 border border-red-500/30 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      Slug: {proj.slug || proj.id}
                    </span>
                  </div>
                </div>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Services &amp; Offerings Management ({services.length})</h3>
              <p className="text-xs font-mono text-slate-400">Dynamically rendered on the public /services page.</p>
            </div>
            <button
              onClick={() => openServiceModal()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>NEW SERVICE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((serv) => (
              <CyberCard key={serv.id} highlightHeader={serv.category || 'SERVICE'} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">{serv.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{serv.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openServiceModal(serv)}
                      className="p-1.5 rounded bg-[#111827] text-slate-300 hover:text-[#06B6D4] border border-slate-700 cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(serv.id)}
                      className="p-1.5 rounded bg-red-950/40 text-red-300 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Order #{serv.order || 0}</span>
                </div>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WRITING */}
      {activeTab === 'writing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Writing &amp; Articles Management ({articles.length})</h3>
              <p className="text-xs font-mono text-slate-400">Published editorial content for /writing.</p>
            </div>
            <button
              onClick={() => openArticleModal()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>NEW ARTICLE</span>
            </button>
          </div>

          <div className="space-y-4">
            {articles.map((art) => (
              <CyberCard key={art.id} highlightHeader={`ARTICLE // ${art.author.toUpperCase()}`} className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{art.title}</h4>
                    <span className="text-xs font-mono text-[#06B6D4]">{art.author} ({art.authorRole}) // {art.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openArticleModal(art)}
                      className="p-1.5 rounded bg-[#111827] text-slate-300 hover:text-[#06B6D4] border border-slate-700 cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="p-1.5 rounded bg-red-950/40 text-red-300 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{art.summary}</p>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <CyberCard glowColor="cyan" highlightHeader="STORAGE // MEDIA_LIBRARY" className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Firebase Storage Media Uploader</h3>
            <p className="text-xs font-mono text-slate-400 mt-1">Upload images, graphics, or PDFs and generate direct URLs for portfolio use.</p>
          </div>

          <div className="p-6 rounded-xl bg-[#070A10] border border-dashed border-slate-700 text-center space-y-3">
            <UploadCloud size={36} className="mx-auto text-[#06B6D4]" />
            <div className="text-sm font-bold text-white">Upload Media Asset</div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs rounded-lg border border-slate-600 transition-all">
              <span>{mediaUploading ? 'UPLOADING...' : 'SELECT IMAGE / ASSET'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleMediaLibraryUpload}
                disabled={mediaUploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadedMediaList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-mono uppercase text-slate-300">Recently Uploaded Media URLs</h4>
              <div className="space-y-2">
                {uploadedMediaList.map((url, idx) => (
                  <div key={idx} className="p-3 bg-[#070A10] border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
                    <span className="text-slate-300 truncate">{url}</span>
                    <button
                      onClick={() => copyToClipboard(url)}
                      className="px-3 py-1 bg-[#111827] hover:bg-[#06B6D4] hover:text-[#070A10] text-[#06B6D4] rounded border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedUrl === url ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                      <span>{copiedUrl === url ? 'COPIED!' : 'COPY URL'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CyberCard>
      )}

      {/* TAB 7: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Contact Inquiries ({messages.length})</h3>

          {messages.length === 0 ? (
            <CyberCard className="p-12 text-center text-slate-400 font-mono text-xs">
              NO INCOMING MESSAGES RECORDED IN FIRESTORE.
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
                        className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                          msg.status === 'unread'
                            ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {msg.status === 'unread' ? 'MARK AS READ' : 'MARK UNREAD'}
                      </button>
                      <button
                        onClick={() => msg.id && handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded bg-red-950/40 text-red-300 border border-red-500/30 cursor-pointer"
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

      {/* TAB 8: THEME */}
      {activeTab === 'theme' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <CyberCard glowColor="cyan" highlightHeader="CONFIG // THEME_ACCENT" className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Visual System &amp; Accent Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Configurable Accent Color Code</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accentColor || '#06B6D4'}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.accentColor || '#06B6D4'}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-[#070A10] border border-slate-700 rounded text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-mono text-slate-300 uppercase">Default Appearance Preference</span>
                <select
                  value={settings.themeMode || 'dark'}
                  onChange={(e) => setSettings({ ...settings, themeMode: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
                >
                  <option value="dark">Dark First (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Save size={15} />
                <span>PERSIST THEME SETTINGS</span>
              </button>
            </div>
          </CyberCard>
        </form>
      )}

      {/* TAB 9: SEO */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <CyberCard glowColor="cyan" highlightHeader="CONFIG // SEO_METADATA" className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Public Portfolio Search Engine Optimization</h3>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Default Site Title</span>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase">Site Description / Bio</span>
              <textarea
                rows={3}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#070A10] border border-slate-700 rounded-lg text-white font-sans text-sm focus:border-[#06B6D4] outline-none"
              />
            </label>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Save size={15} />
                <span>SAVE SEO SETTINGS</span>
              </button>
            </div>
          </CyberCard>
        </form>
      )}

      {/* PROJECT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#070A10] border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingProject.id ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
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
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">Category *</span>
                  <select
                    value={editingProject.category || 'Graphic Design'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs outline-none"
                  >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Posters">Posters</option>
                    <option value="Creative Projects">Creative Projects</option>
                    <option value="Web Projects">Web Projects</option>
                    <option value="Writing">Writing</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Summary Description *</span>
                <textarea
                  rows={2}
                  required
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Detailed Narrative Description</span>
                <textarea
                  rows={3}
                  value={editingProject.detailedDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-sans text-sm outline-none"
                />
              </label>

              {/* Cover Image */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 block">Cover Poster Image</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingProject.image || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1 px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-[#111827] hover:bg-slate-800 text-slate-300 font-mono text-xs rounded border border-slate-700 flex items-center gap-1.5 shrink-0">
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
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-mono text-slate-300">GitHub / Repository URL</span>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-mono text-slate-300">Tags / Tools (Comma-separated)</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs outline-none"
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
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-mono text-xs rounded hover:bg-slate-700 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase rounded cursor-pointer"
                >
                  SAVE PROJECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#070A10] border border-slate-700 rounded-2xl p-6 space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">{editingService.id ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 font-sans text-xs">
              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Service Title *</span>
                <input
                  type="text"
                  required
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white text-sm"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Service Description *</span>
                <textarea
                  rows={3}
                  required
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white text-sm"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Category</span>
                <input
                  type="text"
                  value={editingService.category || 'Design'}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Tags (Comma-separated)</span>
                <input
                  type="text"
                  value={serviceTagInput}
                  onChange={(e) => setServiceTagInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs"
                />
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-mono text-xs rounded cursor-pointer">CANCEL</button>
                <button type="submit" className="px-6 py-2 bg-[#06B6D4] text-[#070A10] font-mono text-xs font-bold uppercase rounded cursor-pointer">SAVE SERVICE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#070A10] border border-slate-700 rounded-2xl p-6 space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">{editingArticle.id ? 'Edit Article' : 'New Writing Piece'}</h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-sans">
              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Article Title *</span>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white text-sm"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-slate-300 font-mono">Author Identity</span>
                  <select
                    value={editingArticle.author || 'Writer Ash'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs"
                  >
                    <option value="Writer Ash">Writer Ash</option>
                    <option value="Writer Tizzy">Writer Tizzy</option>
                    <option value="Tizzy">Tizzy</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-slate-300 font-mono">Category</span>
                  <input
                    type="text"
                    value={editingArticle.category || 'Design Strategy'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white font-mono text-xs"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Summary *</span>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.summary || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white text-sm"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-mono">Full Essay Content *</span>
                <textarea
                  rows={6}
                  required
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111827] border border-slate-700 rounded text-white text-sm font-sans"
                />
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsArticleModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-mono text-xs rounded cursor-pointer">CANCEL</button>
                <button type="submit" className="px-6 py-2 bg-[#06B6D4] text-[#070A10] font-mono text-xs font-bold uppercase rounded cursor-pointer">SAVE ARTICLE</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
