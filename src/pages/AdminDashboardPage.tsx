import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
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
  ChevronRight,
  Share2,
  FileCheck,
  Sun,
  Moon,
  Zap,
  Clock,
  MessageSquareQuote,
  Shield,
  Users,
  Database,
  Activity,
  Bell,
  Cloud,
  CheckCircle2,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getSiteSettings,
  updateSiteSettings,
  subscribeToSiteSettings,
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
  getAnalyticsTrends,
  subscribeToMedia,
  getMediaItems,
} from '../lib/firebase';
import { apiFetch } from '../lib/apiClient';
import {
  Project,
  SiteSettings,
  ContactMessage,
  Article,
  ServiceItem,
  MediaItem,
  PageViewTrend,
} from '../types';
import {
  defaultSiteSettings,
  defaultProjects,
  defaultArticles,
  defaultMessages,
} from '../data/defaultContent';
import { ActivityTrendsVisualizer } from '../components/admin/ActivityTrendsVisualizer';
import { AnalyticsOverviewTab } from '../components/admin/AnalyticsOverviewTab';
import { SecurityCenterTab } from '../components/admin/SecurityCenterTab';
import { AdminManagementTab } from '../components/admin/AdminManagementTab';
import { BackupRestoreTab } from '../components/admin/BackupRestoreTab';
import { SystemHealthTab } from '../components/admin/SystemHealthTab';
import { SocialManagerTab } from '../components/admin/SocialManagerTab';
import { CvManagerTab } from '../components/admin/CvManagerTab';
import { SeoSettingsTab } from '../components/admin/SeoSettingsTab';
import { SkillsManagerTab } from '../components/admin/SkillsManagerTab';
import { TimelineManagerTab } from '../components/admin/TimelineManagerTab';
import { TestimonialsManagerTab } from '../components/admin/TestimonialsManagerTab';
import { MediaGalleryTab } from '../components/admin/MediaGalleryTab';
import { ProfilePhotoManager } from '../components/admin/ProfilePhotoManager';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

type AdminTab =
  | 'overview'
  | 'analytics'
  | 'projects'
  | 'services'
  | 'writing'
  | 'messages'
  | 'profile'
  | 'skills'
  | 'timeline'
  | 'testimonials'
  | 'social'
  | 'cv'
  | 'theme'
  | 'seo'
  | 'media'
  | 'security'
  | 'admins'
  | 'backup'
  | 'health';

const VALID_TABS: AdminTab[] = [
  'overview',
  'analytics',
  'projects',
  'services',
  'writing',
  'messages',
  'profile',
  'skills',
  'timeline',
  'testimonials',
  'social',
  'cv',
  'theme',
  'seo',
  'media',
  'security',
  'admins',
  'backup',
  'health',
];

interface AdminNotificationRow {
  id: string;
  category: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { user, role, firebaseUser, linkGoogleCloudSync, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (tab && VALID_TABS.includes(tab as AdminTab)) {
      return tab as AdminTab;
    }
    return 'overview';
  });

  useEffect(() => {
    if (tab && VALID_TABS.includes(tab as AdminTab)) {
      setActiveTab(tab as AdminTab);
    }
  }, [tab]);

  const handleSelectTab = (newTab: AdminTab) => {
    setActiveTab(newTab);
    navigate(`/admin/${newTab}`);
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // CMS Data states
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [messages, setMessages] = useState<ContactMessage[]>(defaultMessages);
  const [trends, setTrends] = useState<PageViewTrend[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Messages filter
  const [messageSearch, setMessageSearch] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Top bar popovers & search
  const [notifications, setNotifications] = useState<AdminNotificationRow[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [syncingCloud, setSyncingCloud] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Modals state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectImageUrl, setProjectImageUrl] = useState('');

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);
  const [articleCoverUrl, setArticleCoverUrl] = useState('');

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  const [pickerForField, setPickerForField] = useState<{
    fieldName: 'project' | 'article';
    title: string;
    category?: any;
    currentValue?: string;
  } | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await apiFetch<{
        notifications: AdminNotificationRow[];
        unreadNotificationsCount: number;
      }>('/api/security/overview');
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadNotificationsCount || 0);
    } catch {
      // non-fatal background poll
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes, aRes, srvRes, mRes, trRes, medRes] = await Promise.allSettled([
        getSiteSettings(),
        getProjects(),
        getArticles(),
        getServices(),
        getContactMessages(),
        getAnalyticsTrends(30),
        getMediaItems(),
      ]);

      if (sRes.status === 'fulfilled' && sRes.value) setSettings(sRes.value);
      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) setProjects(pRes.value);
      if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) setArticles(aRes.value);
      if (srvRes.status === 'fulfilled' && Array.isArray(srvRes.value)) setServices(srvRes.value);
      if (mRes.status === 'fulfilled' && Array.isArray(mRes.value) && mRes.value.length > 0) setMessages(mRes.value);
      if (trRes.status === 'fulfilled' && Array.isArray(trRes.value)) setTrends(trRes.value);
      if (medRes.status === 'fulfilled' && Array.isArray(medRes.value)) setMediaList(medRes.value);
    } catch (err) {
      console.warn('Notice refreshing CMS data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    loadNotifications();
    const unsubMedia = subscribeToMedia((items) => setMediaList(items));
    const unsubSettings = subscribeToSiteSettings((newSettings) => setSettings(newSettings));
    return () => {
      unsubMedia();
      unsubSettings();
    };
  }, [refreshData, loadNotifications]);

  // Global keyboard shortcuts (Escape & Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        setIsNewProjectModalOpen(false);
        setIsNewArticleModalOpen(false);
        setIsNewServiceModalOpen(false);
        setSelectedMessage(null);
        setDeleteConfirm(null);
        setEditingProject(null);
        setEditingArticle(null);
        setEditingService(null);
        setMobileSidebarOpen(false);
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
        setQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;
  const isPrivileged = role === 'super_admin' || role === 'admin';

  const navGroups = useMemo((): Array<{
    title: string;
    items: Array<{
      id: AdminTab;
      label: string;
      icon: React.ComponentType<{ size?: number | string; className?: string }>;
      count?: number;
      badgeColor?: string;
    }>;
  }> => {
    return [
      {
        title: 'Command Center',
        items: [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'analytics', label: 'Website Analytics', icon: BarChart3 },
        ],
      },
      {
        title: 'Portfolio & Content',
        items: [
          { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.length },
          { id: 'services', label: 'Services', icon: Wrench, count: services.length },
          { id: 'writing', label: 'Articles & Essays', icon: FileText, count: articles.length },
          {
            id: 'messages',
            label: 'Messages Inbox',
            icon: Mail,
            count: unreadMessagesCount,
            badgeColor: 'bg-amber-500 text-black',
          },
          { id: 'media', label: 'Media Library', icon: ImageIcon, count: mediaList.length },
        ],
      },
      {
        title: 'Identity & Site Config',
        items: [
          { id: 'profile', label: 'Profile & Bio', icon: User },
          { id: 'skills', label: 'Skills Matrix', icon: Zap, count: settings.skills?.length || 0 },
          { id: 'timeline', label: 'Career Timeline', icon: Clock, count: settings.timeline?.length || 0 },
          {
            id: 'testimonials',
            label: 'Testimonials',
            icon: MessageSquareQuote,
            count: settings.testimonials?.length || 0,
          },
          { id: 'social', label: 'Social Channels', icon: Share2 },
          { id: 'cv', label: 'Curriculum Vitae', icon: FileCheck },
          { id: 'theme', label: 'Appearance & Theme', icon: Palette },
          { id: 'seo', label: 'SEO Management', icon: Globe },
        ],
      },
      {
        title: 'Security & Governance',
        items: [
          { id: 'security', label: 'Security & Sessions', icon: Shield },
          ...(isPrivileged
            ? [
                { id: 'admins' as AdminTab, label: 'Admin Accounts', icon: Users },
                { id: 'backup' as AdminTab, label: 'Backup & Restore', icon: Database },
              ]
            : []),
          { id: 'health', label: 'System Health', icon: Activity },
        ],
      },
    ];
  }, [projects.length, services.length, articles.length, unreadMessagesCount, mediaList.length, settings.skills, settings.timeline, settings.testimonials, isPrivileged]);

  const allNavItems = useMemo(() => navGroups.flatMap((g) => g.items), [navGroups]);

  const handleLinkCloudSync = async () => {
    setSyncingCloud(true);
    try {
      await linkGoogleCloudSync();
      showToast('Google Cloud Firestore write access linked');
    } catch (err: any) {
      showToast(err?.message || 'Could not link Google Cloud Sync', 'error');
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleMarkNotificationRead = async (id: string | 'all') => {
    try {
      await apiFetch('/api/security/notifications/read', { method: 'POST', body: { id } });
      await loadNotifications();
    } catch {
      // ignore
    }
  };

  /* =========================================================================
     CRUD HANDLERS
     ========================================================================= */
  const handleSaveProject = async (projData: Partial<Project>) => {
    try {
      if (editingProject && editingProject.id) {
        await updateProject(editingProject.id, projData);
        showToast('Project updated successfully');
      } else {
        await createProject(projData as Omit<Project, 'id'>);
        showToast('New project created successfully');
      }
      setIsNewProjectModalOpen(false);
      setEditingProject(null);
      await refreshData();
    } catch (e: any) {
      showToast(e.message || 'Failed to save project', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Project deleted');
      setDeleteConfirm(null);
      await refreshData();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await updateProject(project.id, { featured: !project.featured });
      showToast(`Project ${!project.featured ? 'marked as featured' : 'unfeatured'}`);
      await refreshData();
    } catch {
      showToast('Could not update featured status', 'error');
    }
  };

  const handleSaveArticle = async (artData: Partial<Article>) => {
    try {
      if (editingArticle && editingArticle.id) {
        await updateArticle(editingArticle.id, artData);
        showToast('Article updated successfully');
      } else {
        await createArticle(artData as Omit<Article, 'id'>);
        showToast('Article created successfully');
      }
      setIsNewArticleModalOpen(false);
      setEditingArticle(null);
      await refreshData();
    } catch (e: any) {
      showToast(e.message || 'Failed to save article', 'error');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast('Article deleted');
      setDeleteConfirm(null);
      await refreshData();
    } catch {
      showToast('Failed to delete article', 'error');
    }
  };

  const handleSaveService = async (srvData: ServiceItem) => {
    try {
      const updated = editingService
        ? services.map((s) => (s.id === srvData.id ? srvData : s))
        : [...services, { ...srvData, id: `srv-${Date.now()}` }];
      await saveServices(updated);
      setServices(updated);
      setIsNewServiceModalOpen(false);
      setEditingService(null);
      showToast('Service saved successfully');
    } catch {
      showToast('Failed to save service', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const updated = services.filter((s) => s.id !== id);
      await saveServices(updated);
      setServices(updated);
      setDeleteConfirm(null);
      showToast('Service removed');
    } catch {
      showToast('Failed to delete service', 'error');
    }
  };

  const handleToggleMessageRead = async (msg: ContactMessage) => {
    try {
      const newStatus = msg.status === 'unread' ? 'read' : 'unread';
      await updateMessageStatus(msg.id, newStatus);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m)));
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      showToast('Failed to update message status', 'error');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedMessage(null);
      setDeleteConfirm(null);
      showToast('Message deleted');
    } catch {
      showToast('Failed to delete message', 'error');
    }
  };

  const handleSaveSettings = async (updates: Partial<SiteSettings>) => {
    try {
      await updateSiteSettings(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast('Settings updated successfully', 'success');
      await refreshData();
    } catch (e: any) {
      showToast(e.message || 'Failed to update settings', 'error');
      throw e;
    }
  };

  const handleApplyBackupRestore = async (sanitizedSnapshot: Record<string, any>) => {
    if (sanitizedSnapshot.siteSettings) {
      await updateSiteSettings(sanitizedSnapshot.siteSettings);
    }
    if (Array.isArray(sanitizedSnapshot.projects)) {
      for (const p of sanitizedSnapshot.projects) {
        if (p?.id) {
          await updateProject(p.id, p).catch(async () => {
            await createProject(p);
          });
        } else if (p) {
          await createProject(p);
        }
      }
    }
    if (Array.isArray(sanitizedSnapshot.articles)) {
      for (const a of sanitizedSnapshot.articles) {
        if (a?.id) {
          await updateArticle(a.id, a).catch(async () => {
            await createArticle(a);
          });
        } else if (a) {
          await createArticle(a);
        }
      }
    }
    await refreshData();
    await loadNotifications();
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (messageStatusFilter !== 'all' && m.status !== messageStatusFilter) return false;
      if (messageSearch.trim()) {
        const q = messageSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.service || '').toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [messages, messageStatusFilter, messageSearch]);

  const activeNavMeta = allNavItems.find((item) => item.id === activeTab);

  const renderSidebarNav = (onAfterSelect?: () => void) => (
    <div className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <div className="px-3 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 font-semibold">
            {group.title}
          </div>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  handleSelectTab(item.id);
                  onAfterSelect?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-70 px-5 py-3 rounded-xl text-xs font-medium tracking-wide shadow-2xl flex items-center gap-2 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-black font-semibold'
              : toast.type === 'info'
              ? 'bg-sky-500 text-black font-semibold'
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden lg:flex w-68 flex-col bg-slate-900 border-r border-slate-800/80 shrink-0">
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold text-xs">
              ASH
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Studio Control Plane</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {role || 'admin'} &bull; 2FA Verified
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 overflow-y-auto text-xs">{renderSidebarNav()}</nav>

        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 truncate">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Signed in</span>
            <span className="font-mono text-slate-300">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] bg-slate-900 border-r border-slate-800 flex flex-col z-10">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="font-semibold text-sm text-white">Studio Control Plane</div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto text-xs">
              {renderSidebarNav(() => setMobileSidebarOpen(false))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2 truncate">
              <span className="text-slate-500 hidden sm:inline">Admin</span>
              <ChevronRight size={14} className="text-slate-600 hidden sm:inline" />
              <span className="truncate">{activeNavMeta?.label || activeTab}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Jump Search Trigger */}
            <button
              type="button"
              onClick={() => setQuickSearchOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white cursor-pointer"
              title="Quick jump (Ctrl+K)"
            >
              <Search size={13} />
              <span>Quick Jump</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-0.5">
                <Command size={9} />K
              </kbd>
            </button>

            {/* Google Cloud Sync Indicator */}
            {firebaseUser?.emailVerified ? (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
                <CheckCircle2 size={12} />
                <span>Cloud Synced</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleLinkCloudSync}
                disabled={syncingCloud}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-[11px] font-medium text-amber-300 cursor-pointer"
                title="Link Google account to sync CMS edits directly to Firestore"
              >
                <Cloud size={13} />
                <span className="hidden sm:inline">{syncingCloud ? 'Linking...' : 'Link Cloud Sync'}</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={15} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[9px] flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden text-xs">
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-white">Studio Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotificationRead('all')}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/70">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 12).map((ntf) => (
                        <div
                          key={ntf.id}
                          onClick={() => !ntf.read && handleMarkNotificationRead(ntf.id)}
                          className={`p-3.5 space-y-1 cursor-pointer hover:bg-slate-800/40 ${
                            !ntf.read ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{ntf.title}</span>
                            {!ntf.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{ntf.message}</p>
                          <div className="text-[10px] font-mono text-slate-500">
                            {new Date(ntf.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={`Switch public preview theme (${theme})`}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-200" />}
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink size={12} />
            </a>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white cursor-pointer"
              >
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                  {(user?.name || 'A')[0].toUpperCase()}
                </span>
                <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Admin'}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="font-semibold text-white truncate">{user?.name}</div>
                    <div className="font-mono text-[10px] text-slate-400 truncate">{user?.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px] uppercase">
                      {role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTab('security');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Shield size={14} className="text-amber-400" />
                    <span>Security &amp; Change Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTab('health');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Activity size={14} className="text-emerald-400" />
                    <span>System Diagnostics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Unlinked Cloud Write Warning Banner */}
        {!firebaseUser?.emailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
            <span>
              Browser Google session is not linked yet. Link your authorized Google account once to persist CMS edits directly into Firestore.
            </span>
            <button
              type="button"
              onClick={handleLinkCloudSync}
              disabled={syncingCloud}
              className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 cursor-pointer"
            >
              {syncingCloud ? 'Linking...' : 'Link Google Account Now'}
            </button>
          </div>
        )}

        {/* Dynamic Tab Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl w-full">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Total Projects</div>
                  <div className="text-3xl font-bold text-white">{projects.length}</div>
                  <div className="text-[11px] text-slate-500">
                    {projects.filter((p) => p.featured).length} featured on homepage
                  </div>
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

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setProjectImageUrl('');
                      setIsNewProjectModalOpen(true);
                      handleSelectTab('projects');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create New Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticle(null);
                      setArticleCoverUrl('');
                      setIsNewArticleModalOpen(true);
                      handleSelectTab('writing');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Write New Article</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('messages')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Mail size={14} />
                    <span>Messages Inbox ({unreadMessagesCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('security')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Shield size={14} className="text-amber-400" />
                    <span>Security Center</span>
                  </button>
                </div>
              </div>

              <ActivityTrendsVisualizer
                trends={trends}
                messages={messages}
                accentColor={settings.accentColor || '#C59B63'}
              />

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Recent Contact Messages
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('messages')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500">No contact messages received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {messages.slice(0, 4).map((msg) => (
                      <div key={msg.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white flex items-center gap-2">
                            <span>{msg.name}</span>
                            <span className="text-slate-500 font-mono text-[10px]">&lt;{msg.email}&gt;</span>
                            {msg.status === 'unread' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
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

          {/* 2. WEBSITE ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsOverviewTab
              accentColor={settings.accentColor || '#C59B63'}
              showToast={showToast}
            />
          )}

          {/* 3. PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Projects Management</h2>
                  <p className="text-xs text-slate-400">
                    Add, edit, reorder, or toggle featured projects in your portfolio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectImageUrl('');
                    setIsNewProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

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
                        <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
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
                              type="button"
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
                            <span
                              className={`text-[10px] font-semibold ${
                                proj.visibility === 'draft' ? 'text-slate-500' : 'text-emerald-400'
                              }`}
                            >
                              {proj.visibility || 'published'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProject(proj);
                                setProjectImageUrl(proj.image || '');
                                setIsNewProjectModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit project"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({ type: 'project', id: proj.id, name: proj.title })}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

          {/* 4. SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Services &amp; Offerings</h2>
                  <p className="text-xs text-slate-400">
                    Manage public service offerings, key deliverables, and software toolkits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setIsNewServiceModalOpen(true);
                  }}
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
                          type="button"
                          onClick={() => {
                            setEditingService(srv);
                            setIsNewServiceModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ type: 'service', id: srv.id, name: srv.title })}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
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

          {/* 5. WRITING / ARTICLES MANAGEMENT */}
          {activeTab === 'writing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Articles &amp; Essays</h2>
                  <p className="text-xs text-slate-400">
                    Publish articles and essays authored by Ash Wickramasinghe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingArticle(null);
                    setArticleCoverUrl('');
                    setIsNewArticleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="space-y-4">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                  >
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
                        type="button"
                        onClick={() => {
                          setEditingArticle(art);
                          setArticleCoverUrl(art.coverImage || '');
                          setIsNewArticleModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        title="Edit article"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: 'article', id: art.id, name: art.title })}
                        className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
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

          {/* 6. MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Client Messages &amp; Inquiries</h2>
                  <p className="text-xs text-slate-400">
                    Submissions received through the protected contact endpoint.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                      placeholder="Search sender, service..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                    {(['all', 'unread', 'read'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setMessageStatusFilter(status)}
                        className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer ${
                          messageStatusFilter === status
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                  No matching messages found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 space-y-2">
                    {filteredMessages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMessage(m);
                          if (m.status === 'unread') handleToggleMessageRead(m);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-colors space-y-1 ${
                          selectedMessage?.id === m.id
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-medium text-white">
                            {m.name}
                            {m.status === 'unread' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                          </div>
                          <span className="text-[10px] text-slate-500">{m.createdAt.slice(0, 10)}</span>
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono">{m.service}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{m.message}</div>
                      </div>
                    ))}
                  </div>

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
                              type="button"
                              onClick={() => handleToggleMessageRead(selectedMessage)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            >
                              Mark as {selectedMessage.status === 'unread' ? 'Read' : 'Unread'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'message',
                                  id: selectedMessage.id,
                                  name: `Message from ${selectedMessage.name}`,
                                })
                              }
                              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="text-slate-500 uppercase font-semibold">Service Requested:</div>
                          <div className="font-medium text-slate-200">
                            {selectedMessage.service || 'General Inquiry'}
                          </div>
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

          {/* 7. PROFILE & BIO */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white">Profile, Portrait &amp; Identity</h2>
                <p className="text-xs text-slate-400">
                  Manage your official portrait, brand logos, narrative biography, and contact coordinates.
                </p>
              </div>

              <ProfilePhotoManager
                settings={settings}
                mediaList={mediaList}
                onChange={(updates) => {
                  setSettings((prev) => ({ ...prev, ...updates }));
                  handleSaveSettings(updates);
                }}
                showToast={showToast}
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings(settings);
                }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs"
              >
                <div className="border-b border-slate-800 pb-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Verified Identity &amp; Creative Names
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Full Legal Name</label>
                      <input
                        type="text"
                        value={settings.fullName || ''}
                        onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                        placeholder="Kushan A Wickramasinghe"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Professional / Creative Name</label>
                      <input
                        type="text"
                        value={settings.creativeName || settings.name || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, creativeName: e.target.value, name: e.target.value })
                        }
                        placeholder="Ash Wickramasinghe"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Author / Writing Names</label>
                      <input
                        type="text"
                        value={
                          Array.isArray(settings.authorNames)
                            ? settings.authorNames.join(', ')
                            : settings.authorNames || ''
                        }
                        onChange={(e) => {
                          const namesArr = e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setSettings({ ...settings, authorNames: namesArr });
                        }}
                        placeholder="Writer Ash, Writer Tizzy, Tizzy"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-800 pb-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Professional Role &amp; Guiding Statement
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Professional Title / Roles</label>
                      <input
                        type="text"
                        value={settings.title}
                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Personal Statement / Philosophy
                      </label>
                      <input
                        type="text"
                        value={settings.personalStatement || ''}
                        onChange={(e) => setSettings({ ...settings, personalStatement: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
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
                      <label className="block text-slate-400 mb-1 font-semibold">Work Availability Status</label>
                      <input
                        type="text"
                        value={settings.statusText || settings.workAvailability || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            statusText: e.target.value,
                            workAvailability: e.target.value,
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-800 pb-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Biographical Content
                  </h3>
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
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Comprehensive About Biography
                    </label>
                    <textarea
                      rows={4}
                      value={settings.aboutBio}
                      onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Verified Contact &amp; Social Coordinates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Primary Contact Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Creative / Business Email</label>
                      <input
                        type="email"
                        value={settings.emailSecondary || ''}
                        onChange={(e) => setSettings({ ...settings, emailSecondary: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Primary Phone</label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Secondary Phone</label>
                      <input
                        type="tel"
                        value={settings.phoneSecondary || ''}
                        onChange={(e) => setSettings({ ...settings, phoneSecondary: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">WhatsApp Link</label>
                      <input
                        type="url"
                        value={settings.whatsapp || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Profile &amp; Identity</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 8. THEME & ACCENT */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Theme &amp; Visual Accent</h2>
                <p className="text-xs text-slate-400">
                  Configure the singular accent color and default light/dark preference.
                </p>
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

                <div>
                  <div className="text-slate-400 mb-2 font-semibold">Curated Editorial Presets:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Warm Copper', hex: '#c59b63' },
                      { name: 'Terracotta', hex: '#e07a5f' },
                      { name: 'Amber Gold', hex: '#d97706' },
                      { name: 'Sage Olive', hex: '#84a98c' },
                      { name: 'Classic Sky', hex: '#38bdf8' },
                      { name: 'Rose Quartz', hex: '#fb7185' },
                    ].map((preset) => (
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
                    type="button"
                    onClick={() =>
                      handleSaveSettings({
                        accentColor: settings.accentColor,
                        defaultTheme: settings.defaultTheme,
                      })
                    }
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Apply Theme Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <SkillsManagerTab
              skills={settings.skills || []}
              onSave={async (newSkills) => {
                await handleSaveSettings({ skills: newSkills });
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineManagerTab
              timeline={settings.timeline || []}
              onSave={async (newTimeline) => {
                await handleSaveSettings({ timeline: newTimeline });
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsManagerTab
              testimonials={settings.testimonials || []}
              onSave={async (newTestimonials) => {
                await handleSaveSettings({ testimonials: newTestimonials });
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'social' && (
            <SocialManagerTab
              settings={settings}
              onSave={async (links) => {
                await handleSaveSettings({ socialLinks: links });
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'cv' && (
            <CvManagerTab settings={settings} onSave={handleSaveSettings} showToast={showToast} />
          )}

          {activeTab === 'seo' && (
            <SeoSettingsTab settings={settings} onSave={handleSaveSettings} showToast={showToast} />
          )}

          {activeTab === 'media' && (
            <MediaGalleryTab
              mediaList={mediaList}
              settings={settings}
              onUpdateSettings={handleSaveSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'security' && (
            <SecurityCenterTab showToast={showToast} onRefreshHeaderNotifications={loadNotifications} />
          )}

          {activeTab === 'admins' && <AdminManagementTab showToast={showToast} />}

          {activeTab === 'backup' && (
            <BackupRestoreTab
              settings={settings}
              projects={projects}
              articles={articles}
              messages={messages}
              mediaList={mediaList}
              onApplyRestore={handleApplyBackupRestore}
              showToast={showToast}
            />
          )}

          {activeTab === 'health' && <SystemHealthTab showToast={showToast} />}
        </main>
      </div>

      {/* QUICK JUMP PALETTE (Cmd/Ctrl+K) */}
      {quickSearchOpen && (
        <div
          className="fixed inset-0 z-70 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickSearchOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                autoFocus
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Jump to section (security, analytics, projects, backup...)"
                className="flex-1 bg-transparent text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuickSearchOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1 text-xs">
              {allNavItems
                .filter((item) => item.label.toLowerCase().includes(quickSearchQuery.toLowerCase()))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectTab(item.id);
                        setQuickSearchOpen(false);
                        setQuickSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} className="text-amber-400" />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight size={13} className="text-slate-500" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* PROJECT CREATE/EDIT MODAL */}
      {isNewProjectModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsNewProjectModalOpen(false);
              setEditingProject(null);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewProjectModalOpen(false);
                  setEditingProject(null);
                }}
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
                  tags: (fd.get('tags') as string)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  tools: (fd.get('tools') as string)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  featured: fd.get('featured') === 'on',
                  visibility: (fd.get('visibility') as any) || 'published',
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
                    {[
                      'Graphic Design',
                      'Branding',
                      'Social Media',
                      'Posters',
                      'Creative Projects',
                      'Web Projects',
                      'Writing',
                      'Other',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">Cover Artwork / Image URL *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPickerForField({
                        fieldName: 'project',
                        title: 'Choose Project Cover Artwork',
                        category: 'project',
                        currentValue: projectImageUrl,
                      })
                    }
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon size={12} /> Choose from Media Gallery
                  </button>
                </div>
                <input
                  name="image"
                  required
                  value={projectImageUrl}
                  onChange={(e) => setProjectImageUrl(e.target.value)}
                  placeholder="/uploads/... or choose from gallery"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
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
                  <input type="checkbox" name="featured" defaultChecked={editingProject?.featured ?? true} />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
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
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsNewArticleModalOpen(false);
              setEditingArticle(null);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingArticle ? 'Edit Article' : 'Write New Article'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewArticleModalOpen(false);
                  setEditingArticle(null);
                }}
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
                  tags: (fd.get('tags') as string)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  published: true,
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
                    <option value="Writer Ash">Writer Ash</option>
                    <option value="Writer Tizzy">Writer Tizzy</option>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">Cover Image URL</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPickerForField({
                        fieldName: 'article',
                        title: 'Choose Article Cover Image',
                        category: 'general',
                        currentValue: articleCoverUrl,
                      })
                    }
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon size={12} /> Choose from Media Gallery
                  </button>
                </div>
                <input
                  name="coverImage"
                  value={articleCoverUrl}
                  onChange={(e) => setArticleCoverUrl(e.target.value)}
                  placeholder="/uploads/... or choose from gallery"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
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
                  onClick={() => {
                    setIsNewArticleModalOpen(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
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
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsNewServiceModalOpen(false);
              setEditingService(null);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-lg w-full my-auto space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewServiceModalOpen(false);
                  setEditingService(null);
                }}
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
                  deliverables: (fd.get('deliverables') as string)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  techStack: (fd.get('techStack') as string)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
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
                <label className="block text-slate-400 mb-1 font-semibold">
                  Deliverables (comma-separated)
                </label>
                <input
                  name="deliverables"
                  defaultValue={editingService?.deliverables?.join(', ') || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Software / Tools (comma-separated)
                </label>
                <input
                  name="techStack"
                  defaultValue={editingService?.techStack?.join(', ') || ''}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewServiceModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      {pickerForField && (
        <MediaPickerModal
          isOpen={!!pickerForField}
          onClose={() => setPickerForField(null)}
          title={pickerForField.title}
          categoryFilter={pickerForField.category}
          currentValue={pickerForField.currentValue}
          mediaList={mediaList}
          onSelect={(url) => {
            if (pickerForField.fieldName === 'project') {
              setProjectImageUrl(url);
            } else if (pickerForField.fieldName === 'article') {
              setArticleCoverUrl(url);
            }
            setPickerForField(null);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-2xl max-w-md w-full my-auto space-y-5 text-xs shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
                <p className="text-slate-400 text-xs mt-0.5 capitalize">{deleteConfirm.type} Record</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
              <p className="text-slate-300 text-xs">
                Are you sure you want to delete{' '}
                <strong className="text-white font-semibold">&ldquo;{deleteConfirm.name}&rdquo;</strong>?
              </p>
              <p className="text-slate-500 text-[11px]">
                This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { type, id } = deleteConfirm;
                  if (type === 'project') await handleDeleteProject(id);
                  else if (type === 'article') await handleDeleteArticle(id);
                  else if (type === 'service') await handleDeleteService(id);
                  else if (type === 'message') await handleDeleteMessage(id);
                }}
                className="px-5 py-2 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
