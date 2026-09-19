import React, { useState } from 'react';
import { 
  Globe, 
  Save, 
  Search, 
  Share2, 
  Eye, 
  Check, 
  AlertCircle,
  Sparkles,
  Smartphone,
  Monitor
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface SeoSettingsTabProps {
  settings: SiteSettings;
  onSave: (updates: Partial<SiteSettings>) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const SeoSettingsTab: React.FC<SeoSettingsTabProps> = ({
  settings,
  onSave,
  showToast
}) => {
  const [metaTitle, setMetaTitle] = useState(
    settings.metaTitle || 'Ash Wickramasinghe | Graphic Designer & Content Specialist'
  );
  const [metaDescription, setMetaDescription] = useState(
    settings.metaDescription || 
    'Official portfolio of Ash Wickramasinghe. Creative Direction, Graphic Design, Social Media Management, and Digital Editorial Content.'
  );
  const [keywords, setKeywords] = useState(
    settings.keywords || 
    'Ash Wickramasinghe, Graphic Designer, Social Media Manager, Content Editor, Creative Director, Sri Lanka, Colombo, Digital Content'
  );
  const [ogImage, setOgImage] = useState(
    settings.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'
  );
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        keywords: keywords.trim()
      });
      showToast('SEO & Metadata settings saved successfully');
    } catch (err: any) {
      console.error('Save SEO error:', err);
      showToast(err.message || 'Failed to save SEO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe size={20} className="text-[#C59B63]" />
          Search Engine Optimization (SEO) &amp; OpenGraph
        </h2>
        <p className="text-xs text-slate-400">
          Optimize search engine visibility, browser title tags, and rich social media link preview cards (Twitter, LinkedIn, Facebook).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
            {/* Page Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">
                  Default Document &amp; Browser Title
                </label>
                <span className={`font-mono text-[11px] ${
                  titleLength > 60 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {titleLength} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-sans"
                placeholder="Ash Wickramasinghe | Graphic Designer..."
              />
              <p className="text-[11px] text-slate-500">
                Recommended length: 50–60 characters. Appears in search results and browser tab bars.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">
                  Meta Search Description
                </label>
                <span className={`font-mono text-[11px] ${
                  descLength > 160 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {descLength} / 160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-sans leading-relaxed"
                placeholder="Concise overview of your expertise, creative direction, and role..."
              />
              <p className="text-[11px] text-slate-500">
                Recommended length: 140–160 characters. Displayed beneath the title on Google and Bing search results.
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Indexing Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-sans"
                placeholder="Ash Wickramasinghe, Graphic Designer, Social Media Manager..."
              />
              <p className="text-[11px] text-slate-500">
                Helps search spiders identify core competencies and disciplines.
              </p>
            </div>

            {/* Social Share Image */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                OpenGraph Share Image URL
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono text-[11px]"
                placeholder="https://..."
              />
              <p className="text-[11px] text-slate-500">
                Featured banner image shown when sharing links on LinkedIn, WhatsApp, X, and Facebook.
              </p>
            </div>

            {/* Save Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving Metadata...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save SEO Metadata</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Search & Social Previews */}
        <div className="lg:col-span-6 space-y-6">
          {/* Google Search Snippet Mockup */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Search size={14} className="text-[#C59B63]" />
                Google Search Result Preview
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Desktop Preview"
                >
                  <Monitor size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Mobile Preview"
                >
                  <Smartphone size={12} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white text-slate-900 font-sans shadow-sm">
              {/* Google Result Header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                  AW
                </div>
                <div className="flex flex-col text-[11px] leading-tight">
                  <span className="font-medium text-slate-900">Ash Wickramasinghe</span>
                  <span className="text-slate-500 text-[10px]">https://ash-wickramasinghe.site</span>
                </div>
              </div>

              {/* Title link */}
              <div className="text-blue-700 text-sm font-medium hover:underline cursor-pointer line-clamp-1 mb-1">
                {metaTitle || 'Ash Wickramasinghe | Portfolio'}
              </div>

              {/* Snippet Description */}
              <div className="text-xs text-slate-600 line-clamp-2 leading-snug">
                {metaDescription || 'Official portfolio showcasing graphic design, branding, and content creation.'}
              </div>
            </div>
          </div>

          {/* Social Media Link Card Mockup (LinkedIn / X Card) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3 font-mono uppercase tracking-wider text-slate-400 text-xs flex items-center gap-2">
              <Share2 size={14} className="text-[#C59B63]" />
              Social Media OpenGraph Card Preview
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-w-md mx-auto">
              <div className="w-full h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                {ogImage ? (
                  <img
                    src={ogImage}
                    alt="Social Card Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-slate-600 font-mono text-xs">No image provided</div>
                )}
              </div>
              <div className="p-4 space-y-1 font-sans">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  ash-wickramasinghe.site
                </div>
                <div className="font-semibold text-white text-xs line-clamp-1">
                  {metaTitle}
                </div>
                <div className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                  {metaDescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
