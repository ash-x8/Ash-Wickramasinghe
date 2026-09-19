import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Wrench, 
  Mail, 
  User, 
  Palette, 
  Globe, 
  Image as ImageIcon, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Save, 
  Check, 
  AlertCircle, 
  Search, 
  Menu, 
  X, 
  Upload, 
  Eye, 
  Copy,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getServices,
  saveServices,
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  uploadMediaFile,
  deleteMediaFile
} from '../lib/firebase';
import { Project, SiteSettings, ContactMessage, Article, ServiceItem, MediaItem } from '../types';
import { defaultSiteSettings, defaultProjects, defaultArticles } from '../data/defaultContent';

type AdminTab = 
  | 'overview' 
  | 'projects' 
  | 'services' 
  | 'writing' 
  | 'messages' 
  | 'profile' 
  | 'theme' 
  | 'seo' 
  | 'media';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast / notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // Load all CMS data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [s, p, a, srv, m] = await Promise.all([
        getSiteSettings(),
        getProjects(),
        getArticles(),
        getServices(),
        getContactMessages()
      ]);
      setSettings(s);
      setProjects(p);
      setArticles(a);
      setServices(srv);
      setMessages(m);
    } catch (err) {
      console.error("Error refreshing CMS data:", err);
      showToast("Error loading some database items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;

  /* =========================================================================
     PROJECT ACTIONS
     ========================================================================= */
  const handleSaveProject = async (projData: Partial<Project>) => {
    try {
      if (editingProject && editingProject.id) {
        await updateProject(editingProject.id, projData);
        showToast("Project updated successfully");
      } else {
        await createProject(projData as Omit<Project, 'id'>);
        showToast("New project created successfully");
      }
      setIsNewProjectModalOpen(false);
      setEditingProject(null);
      await refreshData();
    } catch (e: any) {
      console.error("Save project error:", e);
      showToast(e.message || "Failed to save project", "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      showToast("Project deleted");
      setDeleteConfirm(null);
      await refreshData();
    } catch (e: any) {
      showToast("Failed to delete project", "error");
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await updateProject(project.id, { featured: !project.featured });
      showToast(`Project ${!project.featured ? 'marked as featured' : 'unfeatured'}`);
      await refreshData();
    } catch (e) {
      showToast("Could not update featured status", "error");
    }
  };

  /* =========================================================================
     ARTICLE ACTIONS
     ========================================================================= */
  const handleSaveArticle = async (artData: Partial<Article>) => {
    try {
      if (editingArticle && editingArticle.id) {
        await updateArticle(editingArticle.id, artData);
        showToast("Article updated successfully");
      } else {
        await createArticle(artData as Omit<Article, 'id'>);
        showToast("Article created successfully");
      }
      setIsNewArticleModalOpen(false);
      setEditingArticle(null);
      await refreshData();
    } catch (e: any) {
      showToast(e.message || "Failed to save article", "error");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      showToast("Article deleted");
      setDeleteConfirm(null);
      await refreshData();
    } catch (e) {
      showToast("Failed to delete article", "error");
    }
  };

  /* =========================================================================
     SERVICE ACTIONS
     ========================================================================= */
  const handleSaveService = async (srvData: ServiceItem) => {
    try {
      let updated: ServiceItem[];
      if (editingService) {
        updated = services.map(s => s.id === srvData.id ? srvData : s);
      } else {
        updated = [...services, { ...srvData, id: `srv-${Date.now()}` }];
      }
      await saveServices(updated);
      setServices(updated);
      setIsNewServiceModalOpen(false);
      setEditingService(null);
      showToast("Service saved successfully");
    } catch (e) {
      showToast("Failed to save service", "error");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const updated = services.filter(s => s.id !== id);
      await saveServices(updated);
      setServices(updated);
      setDeleteConfirm(null);
      showToast("Service removed");
    } catch (e) {
      showToast("Failed to delete service", "error");
    }
  };

  /* =========================================================================
     MESSAGES ACTIONS
     ========================================================================= */
  const handleToggleMessageRead = async (msg: ContactMessage) => {
    try {
      const newStatus = msg.status === 'unread' ? 'read' : 'unread';
      await updateMessageStatus(msg.id, newStatus);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (e) {
      showToast("Failed to update message status", "error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessage(null);
      setDeleteConfirm(null);
      showToast("Message deleted");
    } catch (e) {
      showToast("Failed to delete message", "error");
    }
  };

  /* =========================================================================
     SETTINGS SAVE (Profile, Theme, SEO)
     ========================================================================= */
  const handleSaveSettings = async (updates: Partial<SiteSettings>) => {
    try {
      await updateSiteSettings(updates);
      setSettings(prev => ({ ...prev, ...updates }));
      showToast("Settings updated in Firestore");
    } catch (e: any) {
      showToast(e.message || "Failed to update settings", "error");
    }
  };

  /* =========================================================================
     MEDIA UPLOAD
     ========================================================================= */
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const url = await uploadMediaFile(file, 'portfolio_assets');
      const item: MediaItem = {
        id: `media-${Date.now()}`,
        name: file.name,
        url,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        uploadedAt: new Date().toISOString().slice(0, 10)
      };
      setMediaList(prev => [item, ...prev]);
      showToast("Media uploaded successfully");
    } catch (err: any) {
      showToast("Upload error: " + err.message, "error");
    } finally {
      setUploadingMedia(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-medium tracking-wide shadow-2xl flex items-center gap-2 transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-500 text-black font-semibold' 
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete <strong className="text-white">{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'project') handleDeleteProject(deleteConfirm.id);
                  if (deleteConfirm.type === 'article') handleDeleteArticle(deleteConfirm.id);
                  if (deleteConfirm.type === 'service') handleDeleteService(deleteConfirm.id);
                  if (deleteConfirm.type === 'message') handleDeleteMessage(deleteConfirm.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800/80 shrink-0">
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
              CMS
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Studio Admin</div>
              <div className="text-[10px] text-slate-400">Ash Wickramasinghe</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.length },
            { id: 'services', label: 'Services', icon: Wrench, count: services.length },
            { id: 'writing', label: 'Writing / Articles', icon: FileText, count: articles.length },
            { id: 'messages', label: 'Messages', icon: Mail, count: unreadMessagesCount, badgeColor: 'bg-amber-500 text-black' },
            { id: 'profile', label: 'Profile & Bio', icon: User },
            { id: 'theme', label: 'Theme & Accent', icon: Palette },
            { id: 'seo', label: 'SEO Settings', icon: Globe },
            { id: 'media', label: 'Media Library', icon: ImageIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${item.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 truncate">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Signed in</span>
            <span className="font-mono text-slate-300">{user?.email}</span>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold capitalize text-white flex items-center gap-2">
              <span className="text-slate-500">Admin</span>
              <ChevronRight size={14} className="text-slate-600" />
              <span>{activeTab}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl w-full">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metric stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Total Projects</div>
                  <div className="text-3xl font-bold text-white">{projects.length}</div>
                  <div className="text-[11px] text-slate-500">{projects.filter(p => p.featured).length} featured on homepage</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Client Inquiries</div>
                  <div className="text-3xl font-bold text-amber-400">{messages.length}</div>
                  <div className="text-[11px] text-slate-500">{unreadMessagesCount} unread submissions</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Active Services</div>
                  <div className="text-3xl font-bold text-white">{services.length}</div>
                  <div className="text-[11px] text-slate-500">Configured in CMS</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Published Articles</div>
                  <div className="text-3xl font-bold text-white">{articles.length}</div>
                  <div className="text-[11px] text-slate-500">Live on writing page</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { setEditingProject(null); setIsNewProjectModalOpen(true); setActiveTab('projects'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create New Project</span>
                  </button>
                  <button
                    onClick={() => { setEditingArticle(null); setIsNewArticleModalOpen(true); setActiveTab('writing'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Write New Article</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Mail size={14} />
                    <span>Open Messages Inbox ({unreadMessagesCount})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('theme')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Palette size={14} />
                    <span>Change Accent Color</span>
                  </button>
                </div>
              </div>

              {/* Recent messages summary */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Recent Contact Messages</h2>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500">No contact messages received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {messages.slice(0, 4).map(msg => (
                      <div key={msg.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white flex items-center gap-2">
                            <span>{msg.name}</span>
                            <span className="text-slate-500 font-mono text-[10px]">&lt;{msg.email}&gt;</span>
                            {msg.status === 'unread' && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <div className="text-slate-400 line-clamp-1">{msg.message}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{msg.createdAt.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Projects Management</h2>
                  <p className="text-xs text-slate-400">Add, edit, reorder, or toggle featured projects in your portfolio.</p>
                </div>
                <button
                  onClick={() => { setEditingProject(null); setIsNewProjectModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Project</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Year</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={proj.image} 
                              alt="" 
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0" 
                            />
                            <div>
                              <div className="font-semibold text-white">{proj.title}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{proj.description}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {proj.category}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{proj.year || '—'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleFeatured(proj)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                                proj.featured 
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {proj.featured ? 'Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-semibold ${
                              proj.visibility === 'draft' ? 'text-slate-500' : 'text-emerald-400'
                            }`}>
                              {proj.visibility || 'published'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => { setEditingProject(proj); setIsNewProjectModalOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit project"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'project', id: proj.id, name: proj.title })}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Services &amp; Offerings</h2>
                  <p className="text-xs text-slate-400">Manage public service offerings, key deliverables, and software toolkits.</p>
                </div>
                <button
                  onClick={() => { setEditingService(null); setIsNewServiceModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        {srv.badge && (
                          <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-semibold">
                            {srv.badge}
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-white mt-1">{srv.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingService(srv); setIsNewServiceModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'service', id: srv.id, name: srv.title })}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Deliverables:</div>
                      <div className="flex flex-wrap gap-1">
                        {srv.deliverables.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. WRITING / ARTICLES MANAGEMENT */}
          {activeTab === 'writing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Articles &amp; Essays</h2>
                  <p className="text-xs text-slate-400">Publish articles authored by Ash Wickramasinghe, Writer Tizzy, or Tizzy.</p>
                </div>
                <button
                  onClick={() => { setEditingArticle(null); setIsNewArticleModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="space-y-4">
                {articles.map((art) => (
                  <div key={art.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-amber-400 font-semibold">{art.category}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-slate-400">By {art.author}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-slate-500">{art.publishedAt}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{art.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{art.excerpt}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setEditingArticle(art); setIsNewArticleModalOpen(true); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit article"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'article', id: art.id, name: art.title })}
                        className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete article"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Client Messages &amp; Inquiries</h2>
                <p className="text-xs text-slate-400">Submissions received through the contact form on the public website.</p>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                  No contact messages have been submitted yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Message List */}
                  <div className="md:col-span-5 space-y-2">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => { setSelectedMessage(m); if (m.status === 'unread') handleToggleMessageRead(m); }}
                        className={`p-4 rounded-xl border cursor-pointer transition-colors space-y-1 ${
                          selectedMessage?.id === m.id
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-medium text-white">
                            {m.name}
                            {m.status === 'unread' && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{m.createdAt.slice(0, 10)}</span>
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono">{m.service}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{m.message}</div>
                      </div>
                    ))}
                  </div>

                  {/* Message Details */}
                  <div className="md:col-span-7">
                    {selectedMessage ? (
                      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{selectedMessage.name}</h3>
                            <a 
                              href={`mailto:${selectedMessage.email}`}
                              className="text-xs text-amber-400 hover:underline"
                            >
                              {selectedMessage.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleMessageRead(selectedMessage)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              Mark as {selectedMessage.status === 'unread' ? 'Read' : 'Unread'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'message', id: selectedMessage.id, name: `Message from ${selectedMessage.name}` })}
                              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="text-slate-500 uppercase font-semibold">Service Requested:</div>
                          <div className="font-medium text-slate-200">{selectedMessage.service || 'General Inquiry'}</div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="text-slate-500 uppercase font-semibold">Message:</div>
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <a
                            href={`mailto:${selectedMessage.email}?subject=Re: Inquiry on ash-wickramasinghe.site`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                          >
                            <Mail size={14} />
                            <span>Reply via Email</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                        Select a message from the list to read details.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. PROFILE & BIO */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Profile, Biography &amp; CV</h2>
                <p className="text-xs text-slate-400">Update your public identity, biographical narrative, and contact coordinates.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings({
                    name: settings.name,
                    title: settings.title,
                    bio: settings.bio,
                    aboutBio: settings.aboutBio,
                    careerTrajectory: settings.careerTrajectory,
                    statusText: settings.statusText,
                    location: settings.location,
                    email: settings.email,
                    github: settings.github,
                    linkedin: settings.linkedin,
                    telegram: settings.telegram,
                    cvUrl: settings.cvUrl,
                    avatarUrl: settings.avatarUrl
                  });
                }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Display Name</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Professional Title</label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Short Hero Bio</label>
                  <textarea
                    rows={2}
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Comprehensive About Biography</label>
                  <textarea
                    rows={4}
                    value={settings.aboutBio}
                    onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Location</label>
                    <input
                      type="text"
                      value={settings.location}
                      onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Contact Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">GitHub URL</label>
                    <input
                      type="url"
                      value={settings.github}
                      onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">LinkedIn URL</label>
                    <input
                      type="url"
                      value={settings.linkedin}
                      onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Telegram URL</label>
                    <input
                      type="url"
                      value={settings.telegram}
                      onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Avatar Image URL</label>
                    <input
                      type="text"
                      value={settings.avatarUrl}
                      onChange={(e) => setSettings({ ...settings, avatarUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">CV / Resume PDF URL</label>
                    <input
                      type="text"
                      value={settings.cvUrl}
                      onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 7. THEME & ACCENT */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Theme &amp; Visual Accent</h2>
                <p className="text-xs text-slate-400">Configure the singular accent color and default light/dark preference.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs max-w-xl">
                <div>
                  <label className="block text-slate-400 mb-2 font-semibold">Accent Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={settings.accentColor || '#c59b63'}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor || '#c59b63'}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono w-32"
                    />
                    <div 
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-black"
                      style={{ backgroundColor: settings.accentColor || '#c59b63' }}
                    >
                      Preview Swatch
                    </div>
                  </div>
                </div>

                {/* Preset Editorial Accent Options */}
                <div>
                  <div className="text-slate-400 mb-2 font-semibold">Curated Editorial Presets:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Warm Copper', hex: '#c59b63' },
                      { name: 'Terracotta', hex: '#e07a5f' },
                      { name: 'Amber Gold', hex: '#d97706' },
                      { name: 'Sage Olive', hex: '#84a98c' },
                      { name: 'Classic Sky', hex: '#38bdf8' },
                      { name: 'Rose Quartz', hex: '#fb7185' }
                    ].map(preset => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setSettings({ ...settings, accentColor: preset.hex })}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 flex items-center gap-2 text-[11px] cursor-pointer"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-2 font-semibold">Default Site Theme Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="themeMode"
                        checked={settings.defaultTheme === 'dark'}
                        onChange={() => setSettings({ ...settings, defaultTheme: 'dark' })}
                      />
                      <span>Dark Mode (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="themeMode"
                        checked={settings.defaultTheme === 'light'}
                        onChange={() => setSettings({ ...settings, defaultTheme: 'light' })}
                      />
                      <span>Light Mode</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleSaveSettings({ 
                      accentColor: settings.accentColor, 
                      defaultTheme: settings.defaultTheme 
                    })}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                  >
                    <Save size={14} />
                    <span>Apply Theme Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Search Engine Optimization (SEO)</h2>
                <p className="text-xs text-slate-400">Configure page title, meta description, and social share metadata.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-xs max-w-2xl">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Page Title</label>
                  <input
                    type="text"
                    value={settings.metaTitle || ''}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription || ''}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Search Keywords</label>
                  <input
                    type="text"
                    value={settings.keywords || ''}
                    onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleSaveSettings({
                      metaTitle: settings.metaTitle,
                      metaDescription: settings.metaDescription,
                      keywords: settings.keywords
                    })}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                  >
                    <Save size={14} />
                    <span>Save SEO Configurations</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Media Library</h2>
                  <p className="text-xs text-slate-400">Upload portfolio assets, posters, or certificates to Firebase Storage.</p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer">
                  <Upload size={14} />
                  <span>{uploadingMedia ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                    className="hidden"
                  />
                </label>
              </div>

              {mediaList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                  No files uploaded in this session yet. Upload images above to retrieve asset URLs.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="font-medium text-white truncate text-[11px]">{item.name}</div>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-slate-500">{item.size}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showToast("URL copied to clipboard");
                          }}
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Copy size={11} /> Copy URL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* PROJECT CREATE/EDIT MODAL */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => { setIsNewProjectModalOpen(false); setEditingProject(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                handleSaveProject({
                  title: fd.get('title') as string,
                  slug: fd.get('slug') as string,
                  category: fd.get('category') as string,
                  year: fd.get('year') as string,
                  client: fd.get('client') as string,
                  description: fd.get('description') as string,
                  detailedDescription: fd.get('detailedDescription') as string,
                  image: fd.get('image') as string,
                  liveUrl: fd.get('liveUrl') as string,
                  githubUrl: fd.get('githubUrl') as string,
                  tags: (fd.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
                  tools: (fd.get('tools') as string).split(',').map(s => s.trim()).filter(Boolean),
                  featured: fd.get('featured') === 'on',
                  visibility: (fd.get('visibility') as any) || 'published'
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Title *</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingProject?.title || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Slug</label>
                  <input
                    name="slug"
                    placeholder="auto-generated-if-empty"
                    defaultValue={editingProject?.slug || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProject?.category || 'Graphic Design'}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {['Graphic Design', 'Branding', 'Social Media', 'Posters', 'Creative Projects', 'Web Projects', 'Writing', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Year</label>
                  <input
                    name="year"
                    defaultValue={editingProject?.year || '2024'}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Client</label>
                  <input
                    name="client"
                    defaultValue={editingProject?.client || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cover Image URL *</label>
                <input
                  name="image"
                  required
                  defaultValue={editingProject?.image || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Short Summary *</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  defaultValue={editingProject?.description || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Detailed Case Study Description</label>
                <textarea
                  name="detailedDescription"
                  rows={4}
                  defaultValue={editingProject?.detailedDescription || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tags (comma-separated)</label>
                  <input
                    name="tags"
                    defaultValue={editingProject?.tags?.join(', ') || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tools (comma-separated)</label>
                  <input
                    name="tools"
                    defaultValue={editingProject?.tools?.join(', ') || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Live URL</label>
                  <input
                    name="liveUrl"
                    defaultValue={editingProject?.liveUrl || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">GitHub URL</label>
                  <input
                    name="githubUrl"
                    defaultValue={editingProject?.githubUrl || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProject?.featured ?? true}
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsNewProjectModalOpen(false); setEditingProject(null); }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARTICLE CREATE/EDIT MODAL */}
      {isNewArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingArticle ? 'Edit Article' : 'Write New Article'}
              </h3>
              <button
                onClick={() => { setIsNewArticleModalOpen(false); setEditingArticle(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                handleSaveArticle({
                  title: fd.get('title') as string,
                  slug: fd.get('slug') as string,
                  author: fd.get('author') as string,
                  category: fd.get('category') as string,
                  readTime: fd.get('readTime') as string,
                  publishedAt: fd.get('publishedAt') as string,
                  excerpt: fd.get('excerpt') as string,
                  content: fd.get('content') as string,
                  coverImage: fd.get('coverImage') as string,
                  tags: (fd.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
                  published: true
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingArticle?.title || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Author</label>
                  <select
                    name="author"
                    defaultValue={editingArticle?.author || 'Ash Wickramasinghe'}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Ash Wickramasinghe">Ash Wickramasinghe</option>
                    <option value="Writer Tizzy">Writer Tizzy</option>
                    <option value="Tizzy">Tizzy</option>
                    <option value="Writer Ash">Writer Ash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <input
                    name="category"
                    defaultValue={editingArticle?.category || 'Design Philosophy'}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Read Time</label>
                  <input
                    name="readTime"
                    defaultValue={editingArticle?.readTime || '4 min read'}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cover Image URL</label>
                <input
                  name="coverImage"
                  defaultValue={editingArticle?.coverImage || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Excerpt / Summary *</label>
                <textarea
                  name="excerpt"
                  required
                  rows={2}
                  defaultValue={editingArticle?.excerpt || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Article Content (Markdown) *</label>
                <textarea
                  name="content"
                  required
                  rows={8}
                  defaultValue={editingArticle?.content || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tags (comma-separated)</label>
                <input
                  name="tags"
                  defaultValue={editingArticle?.tags?.join(', ') || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsNewArticleModalOpen(false); setEditingArticle(null); }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE CREATE/EDIT MODAL */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-lg w-full my-auto space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => { setIsNewServiceModalOpen(false); setEditingService(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                handleSaveService({
                  id: editingService?.id || `srv-${Date.now()}`,
                  title: fd.get('title') as string,
                  badge: fd.get('badge') as string,
                  description: fd.get('description') as string,
                  deliverables: (fd.get('deliverables') as string).split(',').map(s => s.trim()).filter(Boolean),
                  techStack: (fd.get('techStack') as string).split(',').map(s => s.trim()).filter(Boolean)
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Service Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingService?.title || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Badge / Tagline</label>
                <input
                  name="badge"
                  placeholder="e.g. CORE DISCIPLINE"
                  defaultValue={editingService?.badge || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingService?.description || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Deliverables (comma-separated)</label>
                <input
                  name="deliverables"
                  defaultValue={editingService?.deliverables?.join(', ') || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Software / Tools (comma-separated)</label>
                <input
                  name="techStack"
                  defaultValue={editingService?.techStack?.join(', ') || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsNewServiceModalOpen(false); setEditingService(null); }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
