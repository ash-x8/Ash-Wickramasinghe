import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  Check, 
  Trash2, 
  Copy, 
  Calendar, 
  Eye, 
  RefreshCw,
  AlertCircle,
  FileCode,
  CheckCircle2,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { uploadMediaFile } from '../../lib/firebase';
import { formatBytes } from '../../utils/imageOptimizer';

interface CvManagerTabProps {
  settings: SiteSettings;
  onSave: (updates: Partial<SiteSettings>) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type UploadPhase = 'idle' | 'uploading' | 'saving' | 'completed' | 'error';

export const CvManagerTab: React.FC<CvManagerTabProps> = ({
  settings,
  onSave,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local form state
  const [cvSource, setCvSource] = useState<'upload' | 'link'>(settings.cvSource || (settings.cvFileUrl ? 'upload' : 'link'));
  const [cvFileUrl, setCvFileUrl] = useState(settings.cvFileUrl || (settings.cvSource === 'upload' ? settings.cvUrl : ''));
  const [cvFileName, setCvFileName] = useState(settings.cvFileName || '');
  const [cvFileSize, setCvFileSize] = useState(settings.cvFileSize || '');
  const [cvExternalUrl, setCvExternalUrl] = useState(settings.cvExternalUrl || (settings.cvSource === 'link' ? settings.cvUrl : ''));
  const [cvPublished, setCvPublished] = useState(settings.cvPublished ?? true);
  const [cvLastUpdated, setCvLastUpdated] = useState(settings.cvLastUpdated || 'March 2026');
  
  // Upload and Save pipeline state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);

  // Determine active effective URL
  const activeUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Complete, Atomic CV Upload Pipeline
   * Step 1: Storage upload -> stream 0% to 100% progress
   * Step 2: Obtain download URL
   * Step 3: Atomically update Firestore CV configuration
   * Step 4: Confirm Firestore write success -> update UI state
   */
  const processCvFile = async (file: File) => {
    // 15MB limit check
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please choose a smaller document.', 'error');
      setErrorMessage('File size exceeds 15MB limit. Please choose a PDF, DOC, or DOCX document under 15MB.');
      setUploadPhase('error');
      return;
    }

    setFailedFile(file);
    setUploadPhase('uploading');
    setUploadPercent(5);
    setStatusMessage('Initiating secure file transfer...');
    setErrorMessage('');

    let downloadUrl = '';

    try {
      // Step 1 & 2: Upload to storage
      downloadUrl = await uploadMediaFile(file, 'cv', (info) => {
        setUploadPercent(info.percent);
        setStatusMessage(info.message || `Uploading document... ${info.percent}%`);
      });

      if (!downloadUrl) {
        throw new Error('Storage service returned an empty URL');
      }

      setPendingDownloadUrl(downloadUrl);
      setUploadPercent(100);
      setUploadPhase('saving');
      setStatusMessage('Syncing configuration with database...');

      const sizeStr = formatBytes(file.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Step 3 & 4: Atomic Firestore write
      await onSave({
        cvSource: 'upload',
        cvFileUrl: downloadUrl,
        cvFileName: file.name,
        cvFileSize: sizeStr,
        cvUrl: downloadUrl,
        cvLastUpdated: currentDate,
        cvPublished: true
      });

      // Update local state upon confirmed Firestore write
      setCvFileUrl(downloadUrl);
      setCvFileName(file.name);
      setCvFileSize(sizeStr);
      setCvSource('upload');
      setCvLastUpdated(currentDate);
      setCvPublished(true);

      setUploadPhase('completed');
      setStatusMessage('CV document successfully updated and published live!');
      showToast(`CV document "${file.name}" uploaded and published!`, 'success');
      setFailedFile(null);
      setPendingDownloadUrl('');

      // Auto-reset status after 4 seconds
      setTimeout(() => {
        setUploadPhase((prev) => prev === 'completed' ? 'idle' : prev);
      }, 4000);
    } catch (err: any) {
      console.error('CV upload pipeline error:', err);
      const isFirestoreError = downloadUrl !== '';
      const msg = isFirestoreError
        ? 'File was uploaded to storage, but saving configuration to the database failed.'
        : (err.message || 'Failed to upload CV document. Please check your network connection.');

      setErrorMessage(msg);
      setUploadPhase('error');
      showToast(msg, 'error');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCvFile(file);
    }
  };

  const handleRetryUpload = () => {
    if (pendingDownloadUrl && failedFile) {
      // Storage upload succeeded previously, retry Firestore write
      const sizeStr = formatBytes(failedFile.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setUploadPhase('saving');
      setStatusMessage('Retrying database configuration save...');
      onSave({
        cvSource: 'upload',
        cvFileUrl: pendingDownloadUrl,
        cvFileName: failedFile.name,
        cvFileSize: sizeStr,
        cvUrl: pendingDownloadUrl,
        cvLastUpdated: currentDate
      }).then(() => {
        setCvFileUrl(pendingDownloadUrl);
        setCvFileName(failedFile.name);
        setCvFileSize(sizeStr);
        setCvSource('upload');
        setCvLastUpdated(currentDate);
        setUploadPhase('completed');
        setStatusMessage('CV document successfully saved!');
        showToast('CV document saved successfully!', 'success');
        setFailedFile(null);
        setPendingDownloadUrl('');
      }).catch((err: any) => {
        setErrorMessage(err.message || 'Database save failed again.');
        setUploadPhase('error');
        showToast('Save failed again: ' + err.message, 'error');
      });
    } else if (failedFile) {
      processCvFile(failedFile);
    } else {
      triggerFilePicker();
    }
  };

  const handleDeleteUploadedCv = async () => {
    if (!window.confirm("Are you sure you want to remove the uploaded CV document?")) return;
    try {
      const newSource = cvExternalUrl ? 'link' : 'upload';
      setCvFileUrl('');
      setCvFileName('');
      setCvFileSize('');
      setCvSource(newSource);

      await onSave({
        cvFileUrl: '',
        cvFileName: '',
        cvFileSize: '',
        cvSource: newSource,
        cvUrl: cvExternalUrl || ''
      });
      showToast('Uploaded CV document removed', 'info');
    } catch (err: any) {
      showToast('Failed to remove CV: ' + err.message, 'error');
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

  const handleSwitchSource = async (newSource: 'upload' | 'link') => {
    setCvSource(newSource);
    const targetUrl = newSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);
    try {
      await onSave({
        cvSource: newSource,
        cvUrl: targetUrl
      });
      showToast(`Active CV source switched to ${newSource === 'upload' ? 'Uploaded File' : 'External Link'}`, 'success');
    } catch (err: any) {
      showToast('Failed to update CV source: ' + err.message, 'error');
    }
  };

  const handleSaveAll = async () => {
    setManualSaving(true);
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
      setManualSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden Native File Input supporting Mobile (Android, iOS) and Desktop */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck size={20} className="text-[#C59B63]" />
            Curriculum Vitae (CV) &amp; Dossier Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your official CV document. Files are hosted on cloud storage and synchronized in real time with the public website.
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

      {/* Upload State Feedback Banner */}
      {uploadPhase !== 'idle' && (
        <div className={`p-4 rounded-2xl border transition-all ${
          uploadPhase === 'uploading' || uploadPhase === 'saving'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : uploadPhase === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {uploadPhase === 'uploading' || uploadPhase === 'saving' ? (
                <RefreshCw size={20} className="animate-spin text-amber-400 shrink-0" />
              ) : uploadPhase === 'completed' ? (
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-semibold">
                  {uploadPhase === 'uploading' && `Uploading Document (${uploadPercent}%)...`}
                  {uploadPhase === 'saving' && 'Saving Configuration to Database...'}
                  {uploadPhase === 'completed' && 'CV Document Updated Successfully'}
                  {uploadPhase === 'error' && 'Upload Pipeline Failed'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {errorMessage || statusMessage}
                </div>
              </div>
            </div>

            {uploadPhase === 'error' && (
              <button
                type="button"
                onClick={handleRetryUpload}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            )}
          </div>

          {(uploadPhase === 'uploading' || uploadPhase === 'saving') && (
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#C59B63] transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Active Source Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Select Active CV Source</span>
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose whether the public website serves your uploaded document file or an external link.
            </p>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchSource('upload')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
              onClick={() => handleSwitchSource('link')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {/* Two Options Detailed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* OPTION A: DIRECT FILE UPLOAD */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            cvSource === 'upload'
              ? 'bg-slate-950/90 border-[#C59B63]/60 shadow-lg shadow-[#C59B63]/5 ring-1 ring-[#C59B63]/20'
              : 'bg-slate-950/50 border-slate-800/80 opacity-80'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
                  Option A — Direct File Upload
                </span>
                {cvSource === 'upload' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C59B63]/20 text-[#C59B63] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">PDF, DOC, DOCX up to 15MB</span>
            </div>

            {cvFileUrl ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <FileCode size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {cvFileName || 'Uploaded CV Document'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {cvFileSize ? `${cvFileSize} • ` : ''}Verified &amp; Stored
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={cvFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Preview document in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(cvFileUrl)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> Document live on website
                  </span>
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    disabled={uploadPhase === 'uploading' || uploadPhase === 'saving'}
                    className="text-[#C59B63] hover:underline font-semibold cursor-pointer"
                  >
                    Replace with new document
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={uploadPhase === 'uploading' || uploadPhase === 'saving'}
                  className="w-full border-2 border-dashed border-slate-800 hover:border-[#C59B63] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-900/50"
                >
                  <Upload size={24} className="text-[#C59B63]" />
                  <div className="text-slate-200 font-medium text-xs">
                    Choose CV from Android, iPhone, Tablet or Desktop
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Tap or click to browse files (PDF, DOC, DOCX up to 15MB)
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* OPTION B: EXTERNAL CV LINK */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            cvSource === 'link'
              ? 'bg-slate-950/90 border-[#C59B63]/60 shadow-lg shadow-[#C59B63]/5 ring-1 ring-[#C59B63]/20'
              : 'bg-slate-950/50 border-slate-800/80 opacity-80'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
                  Option B — External CV Link
                </span>
                {cvSource === 'link' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C59B63]/20 text-[#C59B63] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Hosted URL (Google Drive, GitHub, etc.)</span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                External CV Document URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={cvExternalUrl}
                  onChange={(e) => setCvExternalUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://domain.com/cv.pdf"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63]"
                />
                {cvExternalUrl && (
                  <a
                    href={cvExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center"
                    title="Open external link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Direct link to an externally hosted PDF or document. When selected as the active source, website visitors will be directed to this URL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing & Metadata Settings */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Last Updated Date Display
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cvLastUpdated}
              onChange={(e) => setCvLastUpdated(e.target.value)}
              placeholder="e.g. March 2026"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#C59B63]"
            />
            <button
              type="button"
              onClick={handleSetCurrentDate}
              className="px-3 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
              title="Set to current month and year"
            >
              <Calendar size={13} />
              <span>Today</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Displayed on the public CV header to indicate document recency.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Public Visibility Status
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cvPublished}
              onChange={(e) => setCvPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-[#C59B63] focus:ring-[#C59B63] accent-[#C59B63]"
            />
            <div>
              <div className="text-xs font-medium text-white">Publish CV on Website</div>
              <div className="text-[11px] text-slate-500">
                {cvPublished ? "The /cv page and download buttons are visible to all visitors." : "The CV is hidden; visitors see a courteous 'Under update' notice."}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Save All Action Bar */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={manualSaving}
          className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#C59B63] to-[#E5C392] text-black hover:opacity-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {manualSaving ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>Save CV Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
