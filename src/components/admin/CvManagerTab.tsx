import React, { useState } from 'react';
import { 
  FileCheck, 
  Upload, 
  Eye, 
  ExternalLink, 
  Save, 
  Check, 
  Calendar,
  FileText,
  Copy,
  RefreshCw,
  ShieldCheck,
  EyeOff,
  Trash2,
  Download,
  Link as LinkIcon,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { uploadMediaFile } from '../../lib/firebase';
import { formatBytes } from '../../utils/imageOptimizer';

interface CvManagerTabProps {
  settings: SiteSettings;
  onSave: (updates: Partial<SiteSettings>) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CvManagerTab: React.FC<CvManagerTabProps> = ({
  settings,
  onSave,
  showToast
}) => {
  const [cvSource, setCvSource] = useState<'upload' | 'link'>(settings.cvSource || (settings.cvFileUrl ? 'upload' : 'link'));
  const [cvFileUrl, setCvFileUrl] = useState(settings.cvFileUrl || '');
  const [cvFileName, setCvFileName] = useState(settings.cvFileName || '');
  const [cvFileSize, setCvFileSize] = useState(settings.cvFileSize || '');
  const [cvExternalUrl, setCvExternalUrl] = useState(settings.cvExternalUrl || settings.cvUrl || '');
  const [cvPublished, setCvPublished] = useState(settings.cvPublished ?? true);
  const [cvLastUpdated, setCvLastUpdated] = useState(settings.cvLastUpdated || 'March 2026');
  
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine active effective URL
  const activeUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (up to 15MB)
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please upload a smaller PDF or DOC document.', 'error');
      return;
    }

    setUploading(true);
    setUploadPercent(10);
    try {
      const downloadUrl = await uploadMediaFile(file, 'cv', (info) => {
        setUploadPercent(info.percent);
      });
      
      const sizeStr = formatBytes(file.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      setCvFileUrl(downloadUrl);
      setCvFileName(file.name);
      setCvFileSize(sizeStr);
      setCvSource('upload');
      setCvLastUpdated(currentDate);

      // Auto-save immediately into Firestore
      await onSave({
        cvSource: 'upload',
        cvFileUrl: downloadUrl,
        cvFileName: file.name,
        cvFileSize: sizeStr,
        cvUrl: downloadUrl,
        cvLastUpdated: currentDate
      });

      showToast(`CV document "${file.name}" uploaded and set as active source!`, 'success');
    } catch (err: any) {
      console.error('CV upload error:', err);
      showToast(err.message || 'Failed to upload CV document', 'error');
    } finally {
      setUploading(false);
      setUploadPercent(0);
    }
  };

  const handleDeleteUploadedCv = async () => {
    if (!window.confirm("Are you sure you want to remove the uploaded CV file?")) return;
    try {
      setCvFileUrl('');
      setCvFileName('');
      setCvFileSize('');
      const newSource = cvExternalUrl ? 'link' : 'upload';
      setCvSource(newSource);

      await onSave({
        cvFileUrl: '',
        cvFileName: '',
        cvFileSize: '',
        cvSource: newSource,
        cvUrl: cvExternalUrl || ''
      });
      showToast('Uploaded CV file removed from system', 'info');
    } catch (err: any) {
      showToast('Failed to delete CV: ' + err.message, 'error');
    }
  };

  const handleSetCurrentDate = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setCvLastUpdated(dateStr);
    showToast(`Updated timestamp to "${dateStr}"`);
  };

  const handleCopyUrl = (urlToCopy: string) => {
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('CV URL copied to clipboard');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const effectiveCvUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);
      await onSave({
        cvSource,
        cvFileUrl,
        cvFileName,
        cvFileSize,
        cvExternalUrl: cvExternalUrl.trim(),
        cvUrl: effectiveCvUrl.trim(),
        cvPublished,
        cvLastUpdated: cvLastUpdated.trim()
      });
      showToast('CV document settings updated in Firestore!', 'success');
    } catch (err: any) {
      console.error('Failed to save CV settings:', err);
      showToast(err.message || 'Failed to save CV settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck size={20} className="text-[#C59B63]" />
            Curriculum Vitae (CV) &amp; Dossier Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure how your official CV is served to website visitors. Choose between an uploaded file or an external URL.
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
            <span>Open Live /cv Page</span>
          </a>
        </div>
      </div>

      {/* Active Source Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#C59B63]">
            {cvSource === 'upload' ? <Upload size={18} /> : <LinkIcon size={18} />}
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Currently Active CV Source</div>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{cvSource === 'upload' ? 'Option A: Uploaded Document File' : 'Option B: External Document Link'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={10} /> Active on Website
              </span>
            </div>
          </div>
        </div>

        {/* Source Switcher Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setCvSource('upload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              cvSource === 'upload'
                ? 'bg-[#C59B63] text-black font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={13} />
            <span>Uploaded File</span>
          </button>
          <button
            type="button"
            onClick={() => setCvSource('link')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              cvSource === 'link'
                ? 'bg-[#C59B63] text-black font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon size={13} />
            <span>External Link</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dual Options & Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* OPTION A: UPLOAD CV FILE */}
          <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
            cvSource === 'upload'
              ? 'bg-slate-900 border-[#C59B63]/60 shadow-lg shadow-[#C59B63]/5'
              : 'bg-slate-900/60 border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
                  Option A — Direct File Upload
                </span>
                {cvSource === 'upload' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C59B63]/20 text-[#C59B63]">
                    ACTIVE SOURCE
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">PDF, DOC, DOCX up to 15MB</span>
            </div>

            {cvFileUrl ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                      <FileCode size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                        {cvFileName || 'Uploaded CV Document'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {cvFileSize ? `${cvFileSize} • ` : ''}Stored in Firebase
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={cvFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Preview in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(cvFileUrl)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Copy file URL"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteUploadedCv}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Remove uploaded CV"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> File verified &amp; ready
                  </span>
                  <label className="text-[#C59B63] hover:underline cursor-pointer font-medium">
                    <span>Replace with new file</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div>
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
                      <span className="text-slate-200 font-medium text-xs">Uploading &amp; optimizing CV... {uploadPercent}%</span>
                      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-[#C59B63] transition-all" style={{ width: `${uploadPercent}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-[#C59B63]" />
                      <div className="text-slate-200 font-medium text-xs">Click or drag CV file here to upload</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Accepts PDF, DOC, DOCX. Automatically synced to Firebase database.
                      </div>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* OPTION B: EXTERNAL CV LINK */}
          <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
            cvSource === 'link'
              ? 'bg-slate-900 border-[#C59B63]/60 shadow-lg shadow-[#C59B63]/5'
              : 'bg-slate-900/60 border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
                  Option B — External CV Link
                </span>
                {cvSource === 'link' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C59B63]/20 text-[#C59B63]">
                    ACTIVE SOURCE
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Google Drive, Dropbox, Custom URL</span>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 text-xs font-semibold">
                External CV Document URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={cvExternalUrl}
                  onChange={(e) => setCvExternalUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://dropbox.com/..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono text-xs"
                />
                {cvExternalUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(cvExternalUrl)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy URL"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <a
                      href={cvExternalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Test link in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Paste any publicly accessible cloud document link. Visitors clicking &ldquo;Download CV&rdquo; or viewing the CV page will receive this link when Option B is active.
              </p>
            </div>
          </div>

          {/* Visibility & Timestamp Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono uppercase tracking-wider text-slate-400">
                Public CV Availability
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                cvPublished 
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30' 
                  : 'bg-amber-950/60 text-amber-400 border border-amber-600/30'
              }`}>
                {cvPublished ? 'PUBLIC: ACCESSIBLE' : 'PUBLIC: HIDDEN (UPDATING)'}
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
                  <span>{cvPublished ? 'CV Published & Downloadable' : 'CV Hidden (Maintenance Mode)'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {cvPublished 
                    ? 'The "Download CV" buttons and /cv dossier are active and publicly accessible.'
                    : 'Visitors to /cv see a notice stating credentials are being updated.'}
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
                {cvPublished ? 'Published' : 'Hidden'}
              </button>
            </div>

            {/* Last Updated Timestamp */}
            <div className="space-y-2 pt-2">
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

            {/* Save Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAll}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Firebase...</span>
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

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Eye size={14} className="text-[#C59B63]" />
              Active CV Preview
            </span>
            {activeUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#C59B63] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Direct Open</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[520px] flex flex-col items-center justify-center relative">
            {activeUrl ? (
              activeUrl.endsWith('.pdf') || activeUrl.includes('application/pdf') || activeUrl.includes('drive.google.com') ? (
                <iframe
                  src={activeUrl}
                  title="CV Document Preview"
                  className="w-full h-[540px] border-0 bg-white"
                />
              ) : (
                <div className="p-8 text-center space-y-4 max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#C59B63] mx-auto">
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{cvFileName || 'Document Ready'}</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Active source: {cvSource === 'upload' ? 'Uploaded Document' : 'External Link'}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl text-xs bg-[#C59B63] text-black font-semibold hover:bg-[#b08852] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download / Open Document</span>
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="p-8 text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <FileText size={24} />
                </div>
                <div className="text-sm font-semibold text-slate-300">No Active CV Configured</div>
                <p className="text-xs text-slate-500">
                  Upload a PDF/DOC document or provide an external URL to activate CV distribution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

