import React, { useState } from 'react';
import { 
  FileCheck, 
  Upload, 
  Eye, 
  ExternalLink, 
  Save, 
  Check, 
  AlertCircle, 
  Calendar,
  FileText,
  Copy,
  RefreshCw,
  ShieldCheck,
  EyeOff
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { uploadMediaFile } from '../../lib/firebase';

interface CvManagerTabProps {
  settings: SiteSettings;
  onSave: (updates: Partial<SiteSettings>) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const CvManagerTab: React.FC<CvManagerTabProps> = ({
  settings,
  onSave,
  showToast
}) => {
  const [cvUrl, setCvUrl] = useState(settings.cvUrl || '');
  const [cvPublished, setCvPublished] = useState(settings.cvPublished ?? true);
  const [cvLastUpdated, setCvLastUpdated] = useState(
    settings.cvLastUpdated || 'March 2026'
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (up to 15MB)
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please upload a smaller PDF.', 'error');
      return;
    }

    setUploading(true);
    try {
      const downloadUrl = await uploadMediaFile(file, 'cv');
      setCvUrl(downloadUrl);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setCvLastUpdated(currentDate);
      showToast('CV document uploaded successfully!');
    } catch (err: any) {
      console.error('CV upload error:', err);
      showToast(err.message || 'Failed to upload CV document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCurrentDate = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setCvLastUpdated(dateStr);
    showToast(`Updated timestamp to "${dateStr}"`);
  };

  const handleCopyUrl = () => {
    if (!cvUrl) return;
    navigator.clipboard.writeText(cvUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('CV link copied to clipboard');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        cvUrl: cvUrl.trim(),
        cvPublished,
        cvLastUpdated: cvLastUpdated.trim()
      });
      showToast('CV document settings updated successfully');
    } catch (err: any) {
      console.error('Failed to save CV settings:', err);
      showToast(err.message || 'Failed to save CV settings', 'error');
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
            <FileCheck size={20} className="text-[#C59B63]" />
            Curriculum Vitae (CV) &amp; Dossier Manager
          </h2>
          <p className="text-xs text-slate-400">
            Control the verified CV document URL, public availability status, and view real-time embedded preview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/cv"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Eye size={13} />
            <span>View Public /cv Page</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings & Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Status & Availability Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono uppercase tracking-wider text-slate-400">
                Public Visibility Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                cvPublished 
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30' 
                  : 'bg-amber-950/60 text-amber-400 border border-amber-600/30'
              }`}>
                {cvPublished ? 'PUBLIC: LIVE' : 'PUBLIC: OFFLINE (UPDATING)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  {cvPublished ? (
                    <ShieldCheck size={16} className="text-emerald-400" />
                  ) : (
                    <EyeOff size={16} className="text-amber-400" />
                  )}
                  <span>{cvPublished ? 'CV Published & Accessible' : 'CV Hidden (Maintenance Mode)'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {cvPublished 
                    ? 'Visitors to /cv can view the document and detailed credentials dossier.'
                    : 'Visitors to /cv see a polite notice stating credentials are currently being updated.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCvPublished(!cvPublished)}
                className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors shrink-0 ${
                  cvPublished 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {cvPublished ? 'Published' : 'Offline'}
              </button>
            </div>

            {/* Last Updated Timestamp */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold">
                Last Updated Display Label
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cvLastUpdated}
                  onChange={(e) => setCvLastUpdated(e.target.value)}
                  placeholder="e.g. March 2026"
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleSetCurrentDate}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                  title="Set to current month and year"
                >
                  <Calendar size={14} />
                  <span className="hidden sm:inline">Set Today</span>
                </button>
              </div>
            </div>
          </div>

          {/* Document File & URL Configuration */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
            <div className="border-b border-slate-800 pb-3 font-mono uppercase tracking-wider text-slate-400">
              Document File Source
            </div>

            {/* Direct Upload Box */}
            <div>
              <label className="block text-slate-400 mb-2 font-semibold">
                Upload New PDF Document
              </label>
              <label className="border-2 border-dashed border-slate-800 hover:border-[#C59B63] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-950/40">
                <input
                  type="file"
                  accept="application/pdf,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="text-[#C59B63] animate-spin" />
                    <span className="text-slate-300 font-mono text-xs">Uploading &amp; generating secure URL...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-[#C59B63]" />
                    <div className="text-slate-200 font-medium">Click or drag PDF here to upload</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PDF, DOCX up to 15MB. Automatically deployed to media storage.
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Direct URL input */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold">
                Document URL (or external cloud document)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cvUrl}
                  onChange={(e) => setCvUrl(e.target.value)}
                  placeholder="https://firebasestorage.googleapis.com/... or https://drive.google.com/..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono text-xs"
                />
                {cvUrl && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy URL"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Open file in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                You can upload a PDF directly, or paste a link to Google Drive, Dropbox, or custom hosted link.
              </p>
            </div>

            {/* Save Button */}
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
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save CV Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Document Viewer Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Eye size={14} className="text-[#C59B63]" />
              Embedded Document Viewer Preview
            </span>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#C59B63] hover:underline flex items-center gap-1 font-mono"
              >
                <span>External Link</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative">
            {cvUrl ? (
              <iframe
                src={cvUrl}
                title="CV Document Preview"
                className="w-full h-[540px] border-0 bg-white"
              />
            ) : (
              <div className="p-8 text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <FileText size={24} />
                </div>
                <div className="text-sm font-semibold text-slate-300">No CV File Configured</div>
                <p className="text-xs text-slate-500">
                  Upload a PDF document or provide a document link on the left to activate the live embedded viewer preview.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
