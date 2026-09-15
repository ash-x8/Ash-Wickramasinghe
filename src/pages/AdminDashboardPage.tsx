import React, { useState, useEffect } from 'react';
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
  Radio, 
  Cpu, 
  Database, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CyberCard } from '../components/CyberCard';
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
} from '../lib/firebase';
import { SiteSettings, Project, ContactMessage, SkillItem, ProjectCategory } from '../types';
import { defaultSiteSettings, defaultProjects } from '../data/defaultContent';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'cv' | 'projects' | 'skills' | 'messages'>('profile');
  
  // Data States
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile / CV Upload States
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  // Project Modal / Edit State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(85);
  const [newSkillCategory, setNewSkillCategory] = useState<SkillItem['category']>('Frontend & UI');

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [loadedSettings, loadedProjects, loadedMessages] = await Promise.all([
          getSiteSettings(),
          getProjects(),
          getContactMessages()
        ]);
        if (loadedSettings) setSettings(loadedSettings);
        if (loadedProjects) setProjects(loadedProjects);
        if (loadedMessages) setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

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

  // Open Project Modal for Creating/Editing
  const openProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject({ ...proj });
      setTagInput(proj.tags.join(', '));
    } else {
      setEditingProject({
        title: '',
        category: 'Full-Stack',
        description: '',
        detailedDescription: '',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        tags: ['React', 'TypeScript', 'Node.js'],
        githubUrl: 'https://github.com/ash-x8',
        liveUrl: '',
        featured: false,
        order: projects.length + 1
      });
      setTagInput('React, TypeScript, Node.js');
    }
    setIsProjectModalOpen(true);
  };

  // Save Project (Create or Update)
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
      detailedDescription: editingProject.detailedDescription || '',
      image: editingProject.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      tags: parsedTags.length > 0 ? parsedTags : ['TypeScript'],
      githubUrl: editingProject.githubUrl || '',
      liveUrl: editingProject.liveUrl || '',
      featured: !!editingProject.featured,
      order: editingProject.order || 1
    };

    try {
      if (editingProject.id) {
        // Update
        await updateProject(editingProject.id, projectPayload);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...projectPayload, id: editingProject.id! } : p));
      } else {
        // Create
        const newId = await createProject(projectPayload);
        setProjects(prev => [...prev, { ...projectPayload, id: newId }]);
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
    if (!confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Delete project failed:", err);
      alert("Error deleting project: " + err.message);
    }
  };

  // Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const updatedSkills = [
      ...settings.skills,
      { name: newSkillName.trim(), level: Number(newSkillLevel), category: newSkillCategory }
    ];
    setSettings(prev => ({ ...prev, skills: updatedSkills }));
    setNewSkillName('');
  };

  // Remove Skill
  const handleRemoveSkill = (index: number) => {
    const updated = settings.skills.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, skills: updated }));
  };

  // Toggle Message Status
  const handleToggleMessageStatus = async (id: string, currentStatus: 'read' | 'unread') => {
    const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      await updateMessageStatus(id, nextStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      {/* DASHBOARD TOP BAR */}
      <div className="mb-8 p-4 bg-[#111827] border border-[#00f0ff]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0b0f19] border border-[#00f0ff] rounded-lg flex items-center justify-center text-[#00f0ff]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-white font-bold text-base flex items-center gap-2">
              ADMIN CMS // ROOT CONTROLLER
              <span className="px-2 py-0.5 bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 text-[10px] font-mono rounded">
                AUTHENTICATED
              </span>
            </div>
            <div className="text-slate-400 font-mono text-xs">
              Logged in as: <span className="text-[#00f0ff]">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-[#0b0f19] border border-slate-700 text-slate-300 hover:text-[#00f0ff] rounded flex items-center gap-1.5"
          >
            Live Site <ExternalLink size={13} />
          </a>
          <button
            onClick={logout}
            className="px-3.5 py-2 bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 rounded flex items-center gap-1.5 transition-all"
          >
            <LogOut size={13} />
            TERMINATE SESSION
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {saveSuccess && (
        <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-emerald-300 font-mono text-xs animate-fadeIn">
          <Check size={16} className="text-emerald-400" />
          <span>CHANGES COMMITTED SUCCESSFULLY TO FIRESTORE DATABASE.</span>
        </div>
      )}
      {saveError && (
        <div className="mb-6 p-3 bg-red-950/60 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 font-mono text-xs">
          <AlertCircle size={16} className="text-red-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4 font-mono text-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] font-bold'
              : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu size={14} />
          Profile &amp; Bios
        </button>
        <button
          onClick={() => setActiveTab('cv')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'cv'
              ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] font-bold'
              : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={14} />
          CV / Document CMS
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] font-bold'
              : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FolderPlus size={14} />
          Projects CRUD ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'skills'
              ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] font-bold'
              : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          Skills Matrix ({settings.skills.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] font-bold'
              : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Mail size={14} />
          Inbox ({messages.filter(m => m.status === 'unread').length} Unread)
        </button>
      </div>

      {/* TAB 1: PROFILE & SITE CONTENT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <CyberCard highlightHeader="PROFILE_PHOTO_MANAGEMENT" className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-[#00f0ff]/40 bg-[#0a0e17] shrink-0">
                <img 
                  src={settings.avatarUrl} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex-1 font-mono text-xs">
                <div className="text-white font-bold">Replace Profile Photo (Firebase Storage)</div>
                <p className="text-slate-400 text-[11px]">
                  Select an image from your device to upload directly to Firebase Storage. The live site will update instantly without redeployment.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="px-4 py-2 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase rounded cursor-pointer hover:bg-[#00f0ff]/90 transition-all flex items-center gap-1.5">
                    <UploadCloud size={14} />
                    {avatarUploading ? "UPLOADING..." : "UPLOAD NEW AVATAR"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="hidden" 
                    />
                  </label>
                  <span className="text-slate-500 text-[10px]">Max 5MB (PNG, JPG, WEBP)</span>
                </div>
              </div>
            </div>
          </CyberCard>

          <CyberCard highlightHeader="IDENTITY_&_NARRATIVE_SETTINGS" className="p-6 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300">PUBLIC_NAME</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">PROFESSIONAL_TITLE</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300">STATUS_INDICATOR_TEXT</label>
                <input
                  type="text"
                  value={settings.statusText}
                  onChange={(e) => setSettings({ ...settings, statusText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">SECURITY_CLEARANCE_BADGE</label>
                <input
                  type="text"
                  value={settings.clearanceLevel}
                  onChange={(e) => setSettings({ ...settings, clearanceLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300">HOME_HERO_BIO</label>
              <textarea
                rows={3}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300">ABOUT_PAGE_DEEP_BIO</label>
              <textarea
                rows={4}
                value={settings.aboutBio}
                onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300">CAREER_TRAJECTORY_PARAGRAPH</label>
              <textarea
                rows={3}
                value={settings.careerTrajectory}
                onChange={(e) => setSettings({ ...settings, careerTrajectory: e.target.value })}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-slate-300">CONTACT_EMAIL</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300">LOCATION</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300">GITHUB_URL</label>
                <input
                  type="url"
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase rounded hover:bg-[#00f0ff]/90 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <Save size={15} />
                SAVE SITE SETTINGS TO FIRESTORE
              </button>
            </div>
          </CyberCard>
        </form>
      )}

      {/* TAB 2: CV / RESUME CMS */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          <CyberCard highlightHeader="CV_DOCUMENT_MANAGEMENT" className="p-6">
            <div className="space-y-4 font-mono text-xs">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Upload New CV Document (PDF)
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Upload an updated PDF resume to Firebase Storage. The Read-Only viewer on <span className="text-[#00f0ff]">/cv</span> will automatically bind to the new document URL while retaining strict anti-download DRM protections.
                </p>
              </div>

              <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 w-full sm:w-auto">
                  <div className="text-slate-300 font-bold">CURRENT BOUND CV URL:</div>
                  <div className="text-[#00f0ff] text-[11px] truncate max-w-md">
                    {settings.cvUrl}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="px-5 py-2.5 bg-[#00ff66] text-[#0b0f19] font-bold uppercase rounded cursor-pointer hover:bg-[#00ff66]/90 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    <UploadCloud size={15} />
                    {cvUploading ? "UPLOADING TO STORAGE..." : "UPLOAD NEW PDF"}
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleCvUpload}
                      disabled={cvUploading}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-slate-300 block mb-1">MANUAL PDF URL OVERRIDE</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settings.cvUrl}
                    onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                  <button
                    onClick={async () => {
                      await updateSiteSettings({ cvUrl: settings.cvUrl });
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className="px-4 py-2 bg-[#00f0ff] text-[#0b0f19] font-bold rounded hover:bg-[#00f0ff]/90"
                  >
                    BIND
                  </button>
                </div>
              </div>
            </div>
          </CyberCard>

          {/* CV Live Preview Window */}
          <CyberCard highlightHeader="CURRENT_VIEWER_PREVIEW" className="p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 font-mono text-xs">
              <span className="text-slate-400">Live View at /cv</span>
              <a 
                href="/cv" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#00f0ff] hover:underline flex items-center gap-1"
              >
                Open Protected /cv Page <ExternalLink size={12} />
              </a>
            </div>
            <div className="w-full h-96 bg-[#0a0e17] rounded border border-slate-800 overflow-hidden">
              <iframe
                src={`${settings.cvUrl}#toolbar=0`}
                title="CV Preview"
                className="w-full h-full border-0"
              />
            </div>
          </CyberCard>
        </div>
      )}

      {/* TAB 3: PROJECTS CRUD */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="font-mono text-xs text-slate-400">
              MANAGING {projects.length} REPOSITORIES IN FIRESTORE
            </div>
            <button
              onClick={() => openProjectModal()}
              className="px-4 py-2 bg-[#00f0ff] text-[#0b0f19] font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 hover:bg-[#00f0ff]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Plus size={15} />
              ADD NEW REPOSITORY
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <CyberCard key={project.id} className="p-5 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[#00f0ff] uppercase px-2 py-0.5 bg-[#0b0f19] border border-slate-800 rounded">
                        {project.category}
                      </span>
                      <h4 className="text-base font-bold text-white font-sans mt-1">
                        {project.title}
                      </h4>
                    </div>
                    {project.featured && (
                      <span className="text-[10px] text-[#00ff66] border border-[#00ff66]/40 px-2 py-0.5 rounded">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 font-sans">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#0b0f19] text-slate-400 border border-slate-800 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-600 text-[10px]">ORDER: {project.order || 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openProjectModal(project)}
                      className="p-1.5 bg-[#111827] border border-slate-700 text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff] rounded"
                      title="Edit Project"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 bg-red-950/30 border border-red-500/40 text-red-400 hover:bg-red-900/50 rounded"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SKILLS & PROFICIENCY */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <CyberCard highlightHeader="ADD_NEW_COMPETENCY" className="p-6 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300">SKILL_NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Rust / WebAssembly"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">CATEGORY</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                >
                  <option value="Frontend & UI">Frontend &amp; UI</option>
                  <option value="Backend & APIs">Backend &amp; APIs</option>
                  <option value="Cyber & Security">Cyber &amp; Security</option>
                  <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                  <option value="Databases & Tools">Databases &amp; Tools</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">PROFICIENCY ({newSkillLevel}%)</label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-full accent-[#00f0ff]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#00ff66] text-[#0b0f19] font-bold rounded hover:bg-[#00ff66]/90 flex items-center gap-1.5"
              >
                <Plus size={14} />
                APPEND TO MATRIX
              </button>
            </div>
          </CyberCard>

          {/* Current Skills List */}
          <CyberCard highlightHeader="ACTIVE_SKILLS_INDEX" className="p-6 font-mono text-xs">
            <div className="space-y-3">
              {settings.skills.map((skill, idx) => (
                <div key={idx} className="p-3 bg-[#0b0f19] border border-slate-800 rounded flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <div>
                      <div className="text-white font-bold">{skill.name}</div>
                      <div className="text-[10px] text-slate-500">{skill.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#00ff66] font-bold">{skill.level}%</span>
                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove Skill"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={async () => {
                  await updateSiteSettings({ skills: settings.skills });
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-5 py-2.5 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase rounded hover:bg-[#00f0ff]/90 flex items-center gap-1.5"
              >
                <Save size={14} />
                SAVE SKILLS TO FIRESTORE
              </button>
            </div>
          </CyberCard>
        </div>
      )}

      {/* TAB 5: INBOUND MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="font-mono text-xs text-slate-400">
            {messages.length} CONTACT SUBMISSIONS RECORDED IN FIRESTORE
          </div>

          {messages.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl font-mono text-xs text-slate-500">
              NO INBOUND TRANSMISSIONS RECORDED YET.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {messages.map((msg) => (
                <CyberCard 
                  key={msg.id} 
                  highlightHeader={msg.status === 'unread' ? "STATUS: UNREAD" : "STATUS: READ"}
                  glowColor={msg.status === 'unread' ? 'cyan' : 'blue'}
                  className="p-5"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                    <div>
                      <h4 className="text-white font-bold text-sm font-sans">{msg.subject}</h4>
                      <div className="text-slate-400 text-[11px]">
                        From: <span className="text-[#00f0ff] font-bold">{msg.name}</span> ({msg.email})
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm font-sans bg-[#0b0f19] p-3.5 rounded border border-slate-800 leading-relaxed mb-4">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <a
                      href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.subject)}`}
                      className="text-[#00ff66] hover:underline flex items-center gap-1.5"
                    >
                      <Mail size={13} />
                      Reply via Direct Email
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                        className="px-2.5 py-1 bg-[#111827] border border-slate-700 text-slate-300 rounded hover:text-white"
                      >
                        {msg.status === 'unread' ? 'MARK READ' : 'MARK UNREAD'}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 border border-red-500/30 rounded bg-red-950/20"
                        title="Delete Transmission"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </CyberCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT PROJECT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-[#00f0ff] rounded-xl shadow-2xl p-6 sm:p-8 font-mono text-xs space-y-4">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white font-sans">
              {editingProject.id ? 'EDIT REPOSITORY SPEC' : 'INITIALIZE NEW REPOSITORY'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300">TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">CATEGORY *</label>
                  <select
                    value={editingProject.category || 'Full-Stack'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  >
                    <option value="Full-Stack">Full-Stack</option>
                    <option value="Web Apps">Web Apps</option>
                    <option value="Cyber/Tools">Cyber/Tools</option>
                    <option value="Scripts">Scripts</option>
                    <option value="Cloud & Systems">Cloud &amp; Systems</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">BRIEF DESCRIPTION *</label>
                <textarea
                  required
                  rows={2}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">DETAILED ARCHITECTURAL SUMMARY</label>
                <textarea
                  rows={3}
                  value={editingProject.detailedDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              {/* Image upload / URL */}
              <div className="space-y-1">
                <label className="text-slate-300">PROJECT IMAGE URL OR STORAGE UPLOAD</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProject.image || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-[#111827] border border-[#00f0ff]/40 text-[#00f0ff] rounded cursor-pointer hover:bg-[#00f0ff]/10 flex items-center gap-1 shrink-0">
                    <UploadCloud size={14} />
                    {projectImageUploading ? "..." : "Upload File"}
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

              <div className="space-y-1">
                <label className="text-slate-300">TECH TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="React, TypeScript, Tailwind, Docker"
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300">GITHUB REPO URL</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">LIVE DEMO URL</label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-800 rounded text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingProject.featured}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#00f0ff]"
                  />
                  <span>FEATURE ON HOME SHOWCASE</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-400 rounded hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase rounded hover:bg-[#00f0ff]/90"
                >
                  SAVE SPECIFICATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
