import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  Eye, 
  Download, 
  ArrowUpDown, 
  CheckCircle2, 
  User, 
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Tag,
  Maximize2,
  X
} from 'lucide-react';
import { MediaItem, SiteSettings } from '../../types';
import { 
  uploadMediaAsset, 
  deleteMediaItem, 
  updateMediaMetadata,
  UploadProgressInfo 
} from '../../lib/firebase';
import { formatBytes } from '../../utils/imageOptimizer';

interface MediaGalleryTabProps {
  mediaList: MediaItem[];
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MediaGalleryTab: React.FC<MediaGalleryTabProps> = ({
  mediaList,
  settings,
  onUpdateSettings,
  showToast
}) => {
  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'size-desc'>('newest');
  
  // Selection & Details Modal
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable item state
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAlt, setEditingAlt] = useState('');
  const [editingCaption, setEditingCaption] = useState('');
  const [editingCategory, setEditingCategory] = useState<MediaItem['category']>('image');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'image' | 'logo' | 'profile' | 'project' | 'document'>('image');

  // Check where media items are used across the website
  const getUsageBadges = (item: MediaItem): string[] => {
    const usages: string[] = [];
    if (settings.avatarUrl === item.url || settings.profileImage === item.url) {
      usages.push('Profile Photo');
    }
    if (settings.logoMonogramUrl === item.url) {
      usages.push('AW Monogram Logo');
    }
    if (settings.logoFullUrl === item.url) {
      usages.push('Full Official Logo');
    }
    if (settings.ogImage === item.url) {
      usages.push('Open Graph Image');
    }
    if (item.inUseBy && item.inUseBy.length > 0) {
      item.inUseBy.forEach(u => {
        if (!usages.includes(u)) usages.push(u);
      });
    }
    return usages;
  };

  // Filter & Sort
  const processedMedia = useMemo(() => {
    return mediaList
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (item.category !== selectedCategory) return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchOriginal = item.originalName?.toLowerCase().includes(q);
          const matchAlt = item.altText?.toLowerCase().includes(q);
          const matchCaption = item.caption?.toLowerCase().includes(q);
          return matchName || matchOriginal || matchAlt || matchCaption;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
        }
        if (sortBy === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'size-desc') {
          const sizeA = typeof a.size === 'number' ? a.size : 0;
          const sizeB = typeof b.size === 'number' ? b.size : 0;
          return sizeB - sizeA;
        }
        return 0;
      });
  }, [mediaList, selectedCategory, searchQuery, sortBy]);

  // Handle Files Upload
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await uploadMediaAsset(file, uploadCategory, (info) => {
          setUploadProgress({
            ...info,
            message: files.length > 1 ? `[${i + 1}/${files.length}] ${info.message}` : info.message
          });
        });
        successCount++;
      } catch (err: any) {
        showToast(`Failed to upload ${file.name}: ${err.message}`, "error");
      }
    }

    if (successCount > 0) {
      showToast(`Successfully uploaded & optimized ${successCount} asset(s)`, "success");
    }
    setIsUploading(false);
    setUploadProgress(null);
  };

  // Open item inspection modal
  const handleInspect = (item: MediaItem) => {
    setInspectItem(item);
    setEditingTitle(item.name || '');
    setEditingAlt(item.altText || '');
    setEditingCaption(item.caption || '');
    setEditingCategory(item.category || 'image');
  };

  // Save metadata
  const handleSaveMetadata = async () => {
    if (!inspectItem) return;
    setIsSavingMeta(true);
    try {
      await updateMediaMetadata(inspectItem.id, {
        name: editingTitle.trim() || inspectItem.name,
        altText: editingAlt.trim(),
        caption: editingCaption.trim(),
        category: editingCategory
      });
      showToast("Media details updated", "success");
      setInspectItem(prev => prev ? ({
        ...prev,
        name: editingTitle.trim() || prev.name,
        altText: editingAlt.trim(),
        caption: editingCaption.trim(),
        category: editingCategory
      }) : null);
    } catch (err: any) {
      showToast("Error updating metadata: " + err.message, "error");
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteMediaItem(deleteCandidate);
      showToast("Asset permanently removed", "info");
      if (inspectItem?.id === deleteCandidate.id) {
        setInspectItem(null);
      }
      setDeleteCandidate(null);
    } catch (err: any) {
      showToast("Delete error: " + err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Action: Set as Profile Image
  const handleSetAsProfile = async (url: string) => {
    try {
      await onUpdateSettings({ avatarUrl: url, profileImage: url });
      showToast("Profile image updated across Hero & About sections!", "success");
    } catch (err: any) {
      showToast("Failed to update profile image: " + err.message, "error");
    }
  };

  // Quick Action: Set as Monogram Logo
  const handleSetAsMonogram = async (url: string) => {
    try {
      await onUpdateSettings({ logoMonogramUrl: url });
      showToast("Site AW monogram emblem updated!", "success");
    } catch (err: any) {
      showToast("Failed to update monogram logo: " + err.message, "error");
    }
  };

  // Quick Action: Set as Full Official Logo
  const handleSetAsFullLogo = async (url: string) => {
    try {
      await onUpdateSettings({ logoFullUrl: url });
      showToast("Site full official logo lockup updated!", "success");
    } catch (err: any) {
      showToast("Failed to update full logo: " + err.message, "error");
    }
  };

  // Quick Action: Set as OpenGraph SEO Card
  const handleSetAsOgImage = async (url: string) => {
    try {
      await onUpdateSettings({ ogImage: url });
      showToast("Social sharing Open Graph card image updated!", "success");
    } catch (err: any) {
      showToast("Failed to update OG image: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Media Library &amp; Cloud Asset Storage</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {mediaList.length} Assets
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time asset management backed by Firebase Storage with automatic WebP compression &amp; thumbnail generation.
          </p>
        </div>

        {/* Upload Category Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Upload as:</span>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="image">Generic Asset</option>
            <option value="logo">Brand Logo</option>
            <option value="profile">Profile Photo</option>
            <option value="project">Project Artwork</option>
            <option value="document">PDF Document</option>
          </select>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleUploadFiles(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Upload size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Drag &amp; drop files here, or <span className="text-amber-400 underline cursor-pointer">browse your device</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports high-resolution PNG, JPG, WebP, SVG, and PDF. Large images are automatically converted to optimized WebP in-browser before upload.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer shadow-lg shadow-black/40">
            <Upload size={14} />
            <span>Select Files to Upload</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => handleUploadFiles(e.target.files)}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Live Upload Progress */}
        {isUploading && uploadProgress && (
          <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-left animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <Sparkles size={13} className="animate-spin text-amber-400" />
                {uploadProgress.message}
              </span>
              <span className="font-mono text-slate-300 font-bold">{uploadProgress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Toolbar: Search, Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'image', label: 'Images' },
            { id: 'logo', label: 'Logos' },
            { id: 'profile', label: 'Profile' },
            { id: 'project', label: 'Projects' },
            { id: 'document', label: 'Docs' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Sort & View Mode */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search filename or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="size-desc">Largest Size</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Gallery Content Display */}
      {processedMedia.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <ImageIcon size={36} className="mx-auto text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No media assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No media matches your search query or active category filter.' 
              : 'Upload your brand logos, profile photos, or project artwork above.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {processedMedia.map((item) => {
            const usageBadges = getUsageBadges(item);
            const isImage = !item.mimeType?.includes('pdf');
            return (
              <div
                key={item.id}
                onClick={() => handleInspect(item)}
                className="group relative rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:shadow-black/50"
              >
                {/* Thumbnail Container */}
                <div className="aspect-square w-full rounded-lg bg-slate-950 border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.altText || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                      <FileText size={28} className="text-amber-400 mb-1" />
                      <span className="text-[10px] font-mono">PDF Doc</span>
                    </div>
                  )}

                  {/* Format tag */}
                  {item.format && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono uppercase text-slate-300">
                      {item.format}
                    </span>
                  )}

                  {/* Quick Inspect icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspect(item);
                      }}
                      className="p-1.5 rounded-full bg-white text-black hover:scale-110 transition-transform shadow"
                      title="Inspect &amp; Details"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.url);
                        showToast("Public URL copied to clipboard", "success");
                      }}
                      className="p-1.5 rounded-full bg-slate-800 text-white hover:scale-110 transition-transform shadow"
                      title="Copy URL"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* Info & Badges */}
                <div className="pt-2.5 space-y-1">
                  <div className="font-medium text-slate-200 text-xs truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.sizeFormatted || (typeof item.size === 'number' ? formatBytes(item.size) : item.size || '')}</span>
                    {item.width && item.height ? (
                      <span className="font-mono">{item.width}×{item.height}</span>
                    ) : null}
                  </div>

                  {/* Active usage badges */}
                  {usageBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {usageBadges.map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedMedia.map((item) => {
                const usageBadges = getUsageBadges(item);
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => handleInspect(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 w-14">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <img 
                          src={item.thumbnailUrl || item.url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-200">
                      <div className="truncate max-w-xs">{item.name}</div>
                      {usageBadges.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {usageBadges.map((b, idx) => (
                            <span key={idx} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px] capitalize">
                      {item.category || 'image'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.width && item.height ? `${item.width} × ${item.height}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.sizeFormatted || (typeof item.size === 'number' ? formatBytes(item.size) : item.size || '—')}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.uploadedAt ? item.uploadedAt.slice(0, 10) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showToast("URL copied", "success");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Copy URL"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          title="Delete Asset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Item Inspection & Metadata Editor Drawer / Modal */}
      {inspectItem && (
        <div 
          className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectItem(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row text-xs">
            
            {/* Left: Big Preview & Quick Actions */}
            <div className="md:w-1/2 p-6 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Asset Preview</span>
                  <a
                    href={inspectItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                  >
                    <span>Open Raw</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 flex items-center justify-center relative shadow-inner">
                  <img
                    src={inspectItem.url}
                    alt={inspectItem.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Quick Assignment Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                  Quick Website Assignments:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => handleSetAsProfile(inspectItem.url)}
                    className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                  >
                    <User size={13} className="text-amber-400" />
                    <span>Set Profile Photo</span>
                  </button>
                  <button
                    onClick={() => handleSetAsMonogram(inspectItem.url)}
                    className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Tag size={13} className="text-amber-400" />
                    <span>Set AW Monogram</span>
                  </button>
                  <button
                    onClick={() => handleSetAsFullLogo(inspectItem.url)}
                    className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} className="text-amber-400" />
                    <span>Set Full Logo</span>
                  </button>
                  <button
                    onClick={() => handleSetAsOgImage(inspectItem.url)}
                    className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Eye size={13} className="text-amber-400" />
                    <span>Set OG / SEO Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Metadata Inspector & Editor */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Asset Details &amp; Metadata</h3>
                  <button
                    onClick={() => setInspectItem(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Asset Title</label>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Alt Text (Accessibility / SEO)</label>
                    <input
                      type="text"
                      value={editingAlt}
                      onChange={(e) => setEditingAlt(e.target.value)}
                      placeholder="Descriptive text for screen readers..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Caption / Notes</label>
                    <textarea
                      rows={2}
                      value={editingCaption}
                      onChange={(e) => setEditingCaption(e.target.value)}
                      placeholder="Context notes or credits..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Category</label>
                    <select
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
                    >
                      <option value="image">Generic Asset (image)</option>
                      <option value="logo">Brand Logo (logo)</option>
                      <option value="profile">Profile Photo (profile)</option>
                      <option value="project">Project Artwork (project)</option>
                      <option value="document">PDF Document (document)</option>
                    </select>
                  </div>
                </div>

                {/* Read-Only System Technical Info */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 font-mono text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Original Name:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{inspectItem.originalName || inspectItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="text-slate-200">{inspectItem.sizeFormatted || (typeof inspectItem.size === 'number' ? formatBytes(inspectItem.size) : inspectItem.size)}</span>
                  </div>
                  {inspectItem.width && inspectItem.height && (
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="text-slate-200">{inspectItem.width} × {inspectItem.height} px</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>MIME / Format:</span>
                    <span className="text-slate-200 uppercase">{inspectItem.format || inspectItem.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded Date:</span>
                    <span className="text-slate-200">{inspectItem.uploadedAt ? new Date(inspectItem.uploadedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setDeleteCandidate(inspectItem)}
                  className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete Asset</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inspectItem.url);
                      showToast("URL copied to clipboard", "success");
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={13} />
                    <span>Copy URL</span>
                  </button>
                  <button
                    onClick={handleSaveMetadata}
                    disabled={isSavingMeta}
                    className="px-4 py-2 rounded-xl font-bold bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                  >
                    {isSavingMeta ? (
                      <Sparkles size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} strokeWidth={2.5} />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Permanently Delete Asset?</h3>
              <p className="text-xs text-slate-400">
                This will delete <strong className="text-slate-200">"{deleteCandidate.name}"</strong> from both Firebase Storage and the Firestore database.
              </p>
            </div>

            {getUsageBadges(deleteCandidate).length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This asset is currently marked in use by:{' '}
                  {getUsageBadges(deleteCandidate).join(', ')}. Removing it may cause missing images on the live site.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? <Sparkles size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
