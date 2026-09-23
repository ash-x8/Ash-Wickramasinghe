import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Check, 
  Link as LinkIcon,
  Filter,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';
import { MediaItem } from '../../types';
import { uploadMediaAsset, UploadProgressInfo } from '../../lib/firebase';
import { formatBytes } from '../../utils/imageOptimizer';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  title?: string;
  categoryFilter?: 'all' | 'image' | 'logo' | 'profile' | 'project' | 'document';
  currentValue?: string;
  mediaList: MediaItem[];
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Choose Media from Gallery",
  categoryFilter = 'all',
  currentValue = '',
  mediaList
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentValue);
  const [selectedItem, setSelectedItem] = useState<MediaItem | undefined>(undefined);
  const [manualUrl, setManualUrl] = useState(currentValue);

  // Uploading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedUrl(currentValue);
    setManualUrl(currentValue);
  }, [currentValue, isOpen]);

  if (!isOpen) return null;

  // Filter list
  const filteredList = mediaList.filter((item) => {
    // Category match
    if (selectedCategory !== 'all') {
      if (item.category && item.category !== selectedCategory) {
        return false;
      }
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchOriginal = item.originalName?.toLowerCase().includes(q);
      const matchAlt = item.altText?.toLowerCase().includes(q);
      return matchName || matchOriginal || matchAlt;
    }
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const targetCategory = selectedCategory === 'all' ? 'image' : (selectedCategory as any);
      const uploadedItem = await uploadMediaAsset(file, targetCategory, (info) => {
        setUploadProgress(info);
      });
      setSelectedUrl(uploadedItem.url);
      setSelectedItem(uploadedItem);
      onSelect(uploadedItem.url, uploadedItem);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media file');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleConfirmSelection = () => {
    if (activeTab === 'url') {
      if (manualUrl.trim()) {
        onSelect(manualUrl.trim());
        onClose();
      }
    } else {
      if (selectedUrl) {
        onSelect(selectedUrl, selectedItem);
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-slate-400">Select an optimized asset from storage or upload a new file.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 rounded-lg font-medium tracking-wide transition-all ${
                activeTab === 'gallery'
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Gallery ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Upload size={13} />
              <span>Upload New</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-lg font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LinkIcon size={13} />
              <span>Manual URL</span>
            </button>
          </div>

          {/* Search bar inside gallery tab */}
          {activeTab === 'gallery' && (
            <div className="relative w-48 sm:w-64">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-amber-400/60"
              />
            </div>
          )}
        </div>

        {/* Category Filter Pills (Gallery tab only) */}
        {activeTab === 'gallery' && (
          <div className="flex items-center gap-1.5 px-6 py-2 border-b border-slate-800/50 bg-slate-900/40 overflow-x-auto text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 mr-1">
              <Filter size={11} /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Media' },
              { id: 'image', label: 'Images' },
              { id: 'logo', label: 'Logos' },
              { id: 'profile', label: 'Profile' },
              { id: 'project', label: 'Projects' },
              { id: 'document', label: 'Documents' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Body content based on tab */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {/* TAB 1: GALLERY */}
          {activeTab === 'gallery' && (
            <div>
              {filteredList.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <ImageIcon size={32} className="mx-auto text-slate-600" />
                  <p>No media files match your search or filter.</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  >
                    <Upload size={13} />
                    <span>Upload new image</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {filteredList.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedUrl(item.url);
                          setSelectedItem(item);
                        }}
                        className={`group relative rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        {/* Checkmark badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        {/* Thumbnail */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800/60 relative flex items-center justify-center">
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.format && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] uppercase font-mono text-slate-300">
                              {item.format}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="pt-2">
                          <div className="font-medium text-slate-200 truncate text-[11px]" title={item.name}>
                            {item.name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>{item.sizeFormatted || (typeof item.size === 'number' ? formatBytes(item.size) : item.size || '')}</span>
                            {item.width && item.height ? (
                              <span>{item.width}×{item.height}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="max-w-lg mx-auto py-8 space-y-6 text-center">
              <label 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all ${
                  isUploading 
                    ? 'border-amber-400/50 bg-amber-500/5' 
                    : 'border-slate-700 hover:border-amber-400/70 bg-slate-950/50 hover:bg-slate-950'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                  <Upload size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Click or drag image to upload</div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Supports high-resolution PNG, JPG, WebP, SVG. Automatically compressed into optimized WebP.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors shadow">
                  Browse Device Files
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {/* Upload Progress Bar */}
              {isUploading && uploadProgress && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-left animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-medium flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-spin" />
                      {uploadProgress.message}
                    </span>
                    <span className="font-mono text-slate-400">{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-left flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL URL */}
          {activeTab === 'url' && (
            <div className="max-w-md mx-auto py-8 space-y-4">
              <div className="text-left space-y-1">
                <label className="text-slate-300 font-semibold text-[11px]">External Image URL</label>
                <p className="text-slate-500 text-[10px]">Provide a direct HTTPS URL to an asset (e.g. Unsplash, CDN, or Cloud Storage).</p>
                <div className="relative pt-1">
                  <LinkIcon size={14} className="absolute left-3 top-4 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={manualUrl}
                    onChange={(e) => {
                      setManualUrl(e.target.value);
                      setSelectedUrl(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {manualUrl && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Image Preview:</span>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img 
                      src={manualUrl} 
                      alt="Preview" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 truncate max-w-sm">
            {selectedUrl ? (
              <span className="text-slate-400 text-[11px] truncate">
                Selected: <span className="text-amber-300 font-mono">{selectedItem?.name || selectedUrl.slice(0, 45)}...</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">No asset selected yet</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedUrl && !manualUrl}
              className="px-5 py-2 rounded-xl font-bold bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Use This Media</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
