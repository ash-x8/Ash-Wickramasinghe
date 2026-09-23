import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Save, 
  Check, 
  Globe, 
  Send, 
  Video, 
  Smartphone,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import { SiteSettings, SocialLinkItem } from '../../types';
import { defaultSiteSettings } from '../../data/defaultContent';

interface SocialManagerTabProps {
  settings: SiteSettings;
  onSave: (socialLinks: SocialLinkItem[]) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const PLATFORM_OPTIONS = [
  { id: 'youtube', label: 'YouTube', icon: Video, defaultPrefix: 'https://youtube.com/@' },
  { id: 'facebook', label: 'Facebook', icon: Globe, defaultPrefix: 'https://facebook.com/' },
  { id: 'linkedin', label: 'LinkedIn', icon: Globe, defaultPrefix: 'https://linkedin.com/in/' },
  { id: 'tiktok', label: 'TikTok', icon: Smartphone, defaultPrefix: 'https://tiktok.com/@' },
  { id: 'telegram', label: 'Telegram', icon: Send, defaultPrefix: 'https://t.me/' },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, defaultPrefix: 'https://wa.me/' },
  { id: 'github', label: 'GitHub', icon: Globe, defaultPrefix: 'https://github.com/' },
  { id: 'behance', label: 'Behance', icon: Globe, defaultPrefix: 'https://behance.net/' },
  { id: 'x', label: 'X (Twitter)', icon: Globe, defaultPrefix: 'https://x.com/' },
  { id: 'instagram', label: 'Instagram', icon: Globe, defaultPrefix: 'https://instagram.com/' },
  { id: 'custom', label: 'Custom Link', icon: Globe, defaultPrefix: 'https://' }
];

export const SocialManagerTab: React.FC<SocialManagerTabProps> = ({
  settings,
  onSave,
  showToast
}) => {
  const [links, setLinks] = useState<SocialLinkItem[]>(() => {
    if (settings.socialLinks && settings.socialLinks.length > 0) {
      return settings.socialLinks;
    }
    return defaultSiteSettings.socialLinks || [];
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (settings.socialLinks && settings.socialLinks.length > 0) {
      setLinks(settings.socialLinks);
    }
  }, [settings.socialLinks]);

  // New link form modal/state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlatform, setNewPlatform] = useState('youtube');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleToggleEnable = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const handleUpdateField = (id: string, field: 'label' | 'url', val: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= links.length) return;
    const reordered = [...links];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    // update order numbers
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLinks(updated);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      showToast('Please specify a valid destination URL', 'error');
      return;
    }

    const platformDef = PLATFORM_OPTIONS.find(p => p.id === newPlatform);
    const label = newLabel.trim() || platformDef?.label || 'Link';

    const newItem: SocialLinkItem = {
      id: `social-${Date.now()}`,
      platform: newPlatform,
      label,
      url: newUrl.trim(),
      enabled: true,
      order: links.length + 1
    };

    setLinks(prev => [...prev, newItem]);
    setShowAddModal(false);
    setNewLabel('');
    setNewUrl('');
    showToast(`Added ${label}`);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all social links to default configuration?')) {
      setLinks(defaultSiteSettings.socialLinks || []);
      showToast('Reset to default channels');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onSave(links);
      showToast('Social media links saved successfully');
    } catch (err: any) {
      console.error('Failed to save social links:', err);
      showToast(err.message || 'Failed to save social media channels', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 size={20} className="text-[#C59B63]" />
            Social Media &amp; Channel Manager
          </h2>
          <p className="text-xs text-slate-400">
            Configure, reorder, and toggle verified channels displayed across the footer, contact coordinates, and public headers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5"
            title="Reset to default channel coordinates"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C59B63] text-[#0A0D14] hover:bg-[#D8AC74] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Channel</span>
          </button>
        </div>
      </div>

      {/* Social Links List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Active Channel Registry ({links.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {links.filter(l => l.enabled).length} Enabled on Public Site
          </span>
        </div>

        {links.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No social channels registered. Click &quot;Add Channel&quot; to configure your first link.
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, idx) => {
              const platformDef = PLATFORM_OPTIONS.find(p => p.id === link.platform);
              const Icon = platformDef?.icon || Globe;

              return (
                <div
                  key={link.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    link.enabled
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  {/* Left: Platform info and reordering */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === links.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[#C59B63] shrink-0">
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Channel Label</span>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateField(link.id, 'label', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#C59B63] outline-none"
                          placeholder="Label (e.g. YouTube Channel)"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target URL</span>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateField(link.id, 'url', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#C59B63] outline-none font-mono"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                      title="Test URL in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>

                    {/* Enable / Disable toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnable(link.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        link.enabled 
                          ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-400' 
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {link.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete channel"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Footer Preview Box */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Public Website Footer Preview:
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap gap-2 text-xs">
            {links.filter(l => l.enabled).map(l => (
              <span
                key={l.id}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
                {l.label}
              </span>
            ))}
            {links.filter(l => l.enabled).length === 0 && (
              <span className="text-slate-500 text-xs italic font-sans">No channels currently enabled</span>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Social Channels</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add New Channel Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-[#C59B63]" />
              Add Social Media Channel
            </h3>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setNewPlatform(sel);
                    const def = PLATFORM_OPTIONS.find(p => p.id === sel);
                    if (def && !newLabel) {
                      setNewLabel(def.label);
                    }
                    if (def && !newUrl) {
                      setNewUrl(def.defaultPrefix);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-[#C59B63]"
                >
                  {PLATFORM_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Display Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. YouTube (@Ash-x8)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-[#C59B63]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Destination URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono outline-none focus:border-[#C59B63]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C59B63] text-[#0A0D14] font-semibold hover:bg-[#D8AC74] transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Add Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
