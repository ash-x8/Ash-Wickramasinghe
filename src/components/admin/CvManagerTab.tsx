import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Download,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { SiteSettings, ActiveCvConfig } from '../../types';
import { 
  uploadCvFile, 
  getActiveCvConfig, 
  saveActiveCvConfig, 
  subscribeToActiveCvConfig 
} from '../../lib/firebase';
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

  // Form state initialized from props
  const [cvSource, setCvSource] = useState<'upload' | 'link'>(settings.cvSource || (settings.cvFileUrl ? 'upload' : 'link'));
  const [cvFileUrl, setCvFileUrl] = useState(settings.cvFileUrl || (settings.cvSource === 'upload' ? settings.cvUrl : ''));
  const [cvFileName, setCvFileName] = useState(settings.cvFileName || '');
  const [cvFileSize, setCvFileSize] = useState(settings.cvFileSize || '');
  const [cvFileType, setCvFileType] = useState<'pdf' | 'image' | 'doc'>(
    settings.cvFileType || (settings.cvFileUrl?.match(/\.(jpg|jpeg|png|webp)$/i) ? 'image' : 'pdf')
  );
  const [cvExternalUrl, setCvExternalUrl] = useState(settings.cvExternalUrl || (settings.cvSource === 'link' ? settings.cvUrl : ''));
  const [cvPublished, setCvPublished] = useState(settings.cvPublished ?? true);
  const [cvLastUpdated, setCvLastUpdated] = useState(settings.cvLastUpdated || 'March 2026');

  // Real-time Firestore active CV document state
  const [activeCvRecord, setActiveCvRecord] = useState<ActiveCvConfig | null>(null);

  // Upload and Save pipeline state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);

  // Synchronize when settings change or Firestore updates
  useEffect(() => {
    // Initial fetch from settings/cv
    getActiveCvConfig().then((config) => {
      if (config) {
        setActiveCvRecord(config);
        if (config.sourceType === 'uploaded') {
          setCvSource('upload');
          setCvFileUrl(config.downloadUrl);
        } else {
          setCvSource('link');
          setCvExternalUrl(config.downloadUrl);
        }
        setCvFileName(config.fileName || '');
        setCvFileSize(config.fileSizeFormatted || (config.fileSize ? formatBytes(config.fileSize) : ''));
        setCvFileType(config.fileType || 'pdf');
        if (config.published !== undefined) setCvPublished(config.published);
        if (config.lastUpdated) setCvLastUpdated(config.lastUpdated);
      }
    }).catch(console.warn);

    // Live subscription to settings/cv
    const unsub = subscribeToActiveCvConfig((config) => {
      if (config) {
        setActiveCvRecord(config);
        if (config.sourceType === 'uploaded' && config.downloadUrl) {
          setCvFileUrl(config.downloadUrl);
          setCvFileName(config.fileName);
          setCvFileType(config.fileType);
          setCvFileSize(config.fileSizeFormatted || formatBytes(config.fileSize));
        }
      }
    });

    return () => unsub();
  }, []);

  // Sync from props if settings changes
  useEffect(() => {
    if (settings) {
      setCvSource(settings.cvSource || (settings.cvFileUrl ? 'upload' : 'link'));
      setCvFileUrl(settings.cvFileUrl || (settings.cvSource === 'upload' ? settings.cvUrl : ''));
      setCvFileName(settings.cvFileName || '');
      setCvFileSize(settings.cvFileSize || '');
      setCvFileType(settings.cvFileType || (settings.cvFileUrl?.match(/\.(jpg|jpeg|png|webp)$/i) ? 'image' : 'pdf'));
      setCvExternalUrl(settings.cvExternalUrl || (settings.cvSource === 'link' ? settings.cvUrl : ''));
      setCvPublished(settings.cvPublished ?? true);
      setCvLastUpdated(settings.cvLastUpdated || 'March 2026');
    }
  }, [settings]);

  // Active effective URL for preview and public display
  const activeEffectiveUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Complete, Verified CV Upload Pipeline
   * Eliminates HTTP 405 by using official Firebase client SDK uploadBytesResumable
   * with automatic, resilient server fallback and guaranteed atomic Firestore save.
   */
  const processCvFile = async (file: File) => {
    if (!file) return;

    // Validate size (30MB max)
    if (file.size > 30 * 1024 * 1024) {
      const err = 'File size exceeds 30MB limit. Please select a file under 30MB.';
      showToast(err, 'error');
      setErrorMessage(err);
      setUploadPhase('error');
      return;
    }

    // Validate type: support PDF, images (JPG, PNG, WebP), and documents
    const nameLower = file.name.toLowerCase();
    const mimeLower = (file.type || '').toLowerCase();
    const isImage = mimeLower.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(nameLower);
    const isPdf = mimeLower.includes('pdf') || /\.pdf$/i.test(nameLower);
    const isDoc = mimeLower.includes('word') || mimeLower.includes('officedocument') || /\.(doc|docx)$/i.test(nameLower);

    if (!isImage && !isPdf && !isDoc) {
      const err = 'Unsupported file type. Please choose a PDF document (.pdf) or image (.jpg, .jpeg, .png, .webp).';
      showToast(err, 'error');
      setErrorMessage(err);
      setUploadPhase('error');
      return;
    }

    const detectedType: 'pdf' | 'image' | 'doc' = isImage ? 'image' : (isPdf ? 'pdf' : 'doc');

    setFailedFile(file);
    setUploadPhase('uploading');
    setUploadPercent(10);
    setStatusMessage(`Transferring ${detectedType === 'image' ? 'Image CV' : 'PDF Document'}...`);
    setErrorMessage('');

    try {
      // Step 1: Upload with genuine progress reporting (Firebase Storage SDK with resilient fallback)
      const uploadResult = await uploadCvFile(file, (info) => {
        setUploadPercent(info.percent);
        setStatusMessage(info.message);
      });

      if (!uploadResult.downloadUrl) {
        throw new Error('Upload succeeded but no download URL was returned.');
      }

      const sizeStr = formatBytes(file.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Step 2: Atomic Firestore sync for site settings
      await onSave({
        cvSource: 'upload',
        cvFileUrl: uploadResult.downloadUrl,
        cvFileName: file.name,
        cvFileSize: sizeStr,
        cvFileType: detectedType,
        cvUrl: uploadResult.downloadUrl,
        cvLastUpdated: currentDate,
        cvPublished: true
      });

      // Step 3: Update local React state only after both storage and database operations succeed
      setCvFileUrl(uploadResult.downloadUrl);
      setCvFileName(file.name);
      setCvFileSize(sizeStr);
      setCvFileType(detectedType);
      setCvSource('upload');
      setCvLastUpdated(currentDate);
      setCvPublished(true);

      setActiveCvRecord({
        sourceType: 'uploaded',
        fileType: detectedType,
        fileName: file.name,
        storagePath: uploadResult.storagePath,
        downloadUrl: uploadResult.downloadUrl,
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.fileSize,
        fileSizeFormatted: sizeStr,
        published: true,
        lastUpdated: currentDate,
        updatedAt: new Date().toISOString()
      });

      setUploadPhase('completed');
      setStatusMessage(`${detectedType === 'image' ? 'Image CV' : 'Document CV'} successfully uploaded and published live!`);
      showToast(`CV "${file.name}" uploaded and saved to Firebase!`, 'success');
      setFailedFile(null);

      setTimeout(() => {
        setUploadPhase((prev) => prev === 'completed' ? 'idle' : prev);
      }, 4000);
    } catch (err: any) {
      console.error('CV upload pipeline error:', err);
      const msg = err.message || 'Failed to upload CV. Please check connection and retry.';
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
    if (failedFile) {
      processCvFile(failedFile);
    }
  };

  const handleCopyUrl = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('CV URL copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteUploadedCv = async () => {
    if (!window.confirm('Are you sure you want to remove the uploaded CV? Website visitors will see the external URL or the dossier view.')) {
      return;
    }

    try {
      const newSource = cvExternalUrl ? 'link' : 'upload';
      
      // Update settings/cv document
      await saveActiveCvConfig({
        sourceType: newSource === 'link' ? 'external' : 'uploaded',
        downloadUrl: cvExternalUrl || '',
        fileName: '',
        fileSize: 0,
        fileSizeFormatted: '',
        storagePath: ''
      });

      // Update site_settings
      await onSave({
        cvFileUrl: '',
        cvFileName: '',
        cvFileSize: '',
        cvSource: newSource,
        cvUrl: cvExternalUrl || ''
      });

      setCvFileUrl('');
      setCvFileName('');
      setCvFileSize('');
      setCvSource(newSource);
      showToast('Uploaded CV removed successfully.', 'info');
    } catch (err: any) {
      showToast(`Failed to remove CV: ${err.message}`, 'error');
    }
  };

  const handleSourceChange = async (newSource: 'upload' | 'link') => {
    setCvSource(newSource);
    const newEffectiveUrl = newSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

    try {
      await saveActiveCvConfig({
        sourceType: newSource === 'upload' ? 'uploaded' : 'external',
        downloadUrl: newEffectiveUrl
      });

      await onSave({
        cvSource: newSource,
        cvUrl: newEffectiveUrl
      });
      showToast(`Active CV source set to: ${newSource === 'upload' ? 'Uploaded Document' : 'External Link'}`, 'success');
    } catch (err: any) {
      showToast(`Could not switch source: ${err.message}`, 'error');
    }
  };

  const handleSaveAll = async () => {
    setManualSaving(true);
    try {
      const effectiveUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

      // Save to settings/cv
      await saveActiveCvConfig({
        sourceType: cvSource === 'upload' ? 'uploaded' : 'external',
        downloadUrl: effectiveUrl.trim(),
        fileName: cvFileName || 'Curriculum_Vitae',
        fileSizeFormatted: cvFileSize,
        fileType: cvFileType,
        published: cvPublished,
        lastUpdated: cvLastUpdated.trim()
      });

      // Save to site_settings/main_settings
      await onSave({
        cvSource,
        cvFileUrl,
        cvFileName,
        cvFileSize,
        cvFileType,
        cvExternalUrl: cvExternalUrl.trim(),
        cvUrl: effectiveUrl.trim(),
        cvPublished,
        cvLastUpdated: cvLastUpdated.trim()
      });

      showToast('CV configuration saved successfully to Firebase!', 'success');
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setManualSaving(false);
    }
  };

  const handleSetCurrentDate = () => {
    const formatted = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setCvLastUpdated(formatted);
    showToast(`Updated date set to "${formatted}"`, 'info');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Hidden Native File Input (Works on Android, iOS, Windows, Mac, Linux) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp,.doc,.docx"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Top Banner & Status Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C59B63] font-bold">
              Active CV Pipeline
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <ShieldCheck size={11} /> Live Firebase Sync
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Curriculum Vitae Management</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Upload and manage your certified Curriculum Vitae. Changes update the public <code className="text-[#C59B63]">/cv</code> page immediately without rebuilding or redeploying.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/cv"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5 border border-slate-700 shadow-sm"
          >
            <Eye size={13} />
            <span>Open Live /cv Page</span>
            <ExternalLink size={11} className="text-slate-400" />
          </a>
          <button
            type="button"
            onClick={triggerFilePicker}
            disabled={uploadPhase === 'uploading' || uploadPhase === 'saving'}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C59B63] hover:bg-[#b08852] text-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Upload size={13} />
            <span>Upload New CV</span>
          </button>
        </div>
      </div>

      {/* Upload Progress & Error Feedback Box */}
      {uploadPhase !== 'idle' && (
        <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
          uploadPhase === 'completed'
            ? 'bg-emerald-950/40 border-emerald-500/40'
            : uploadPhase === 'error'
              ? 'bg-red-950/40 border-red-500/40'
              : 'bg-amber-950/30 border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {uploadPhase === 'uploading' && <RefreshCw size={16} className="text-amber-400 animate-spin" />}
              {uploadPhase === 'saving' && <RefreshCw size={16} className="text-[#C59B63] animate-spin" />}
              {uploadPhase === 'completed' && <CheckCircle2 size={16} className="text-emerald-400" />}
              {uploadPhase === 'error' && <AlertCircle size={16} className="text-red-400" />}

              <span className="text-xs font-semibold font-mono tracking-wide">
                {uploadPhase === 'uploading' && `Uploading to Storage (${uploadPercent}%)`}
                {uploadPhase === 'saving' && 'Recording in Firebase Firestore...'}
                {uploadPhase === 'completed' && 'Upload Complete & Published!'}
                {uploadPhase === 'error' && 'Upload Pipeline Failed'}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-300">
              {uploadPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                uploadPhase === 'completed' 
                  ? 'bg-emerald-500' 
                  : uploadPhase === 'error' 
                    ? 'bg-red-500' 
                    : 'bg-gradient-to-r from-[#C59B63] to-amber-300'
              }`}
              style={{ width: `${uploadPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="truncate pr-2">{statusMessage || errorMessage}</span>
            {uploadPhase === 'error' && (
              <button
                type="button"
                onClick={handleRetryUpload}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Retry Upload</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Source Selection & File Management */}
        <div className="space-y-6">
          
          {/* Active Source Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Active CV Source
              </span>
              <span className="text-[11px] text-slate-500">Choose primary display</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSourceChange('upload')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  cvSource === 'upload'
                    ? 'bg-gradient-to-br from-[#C59B63]/20 to-slate-900 border-[#C59B63] shadow-md ring-1 ring-[#C59B63]/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <FileText size={16} className={cvSource === 'upload' ? 'text-[#C59B63]' : 'text-slate-400'} />
                  {cvSource === 'upload' && <Check size={14} className="text-[#C59B63]" />}
                </div>
                <div className="text-xs font-bold text-white">Uploaded File</div>
                <div className="text-[11px] text-slate-400">Direct PDF or Image file</div>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('link')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  cvSource === 'link'
                    ? 'bg-gradient-to-br from-[#C59B63]/20 to-slate-900 border-[#C59B63] shadow-md ring-1 ring-[#C59B63]/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <LinkIcon size={16} className={cvSource === 'link' ? 'text-[#C59B63]' : 'text-slate-400'} />
                  {cvSource === 'link' && <Check size={14} className="text-[#C59B63]" />}
                </div>
                <div className="text-xs font-bold text-white">External Link</div>
                <div className="text-[11px] text-slate-400">Google Drive or URL</div>
              </button>
            </div>
          </div>

          {/* Option A: Uploaded File Details & Actions */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            cvSource === 'upload'
              ? 'bg-slate-950/90 border-[#C59B63]/60 shadow-lg shadow-[#C59B63]/5 ring-1 ring-[#C59B63]/20'
              : 'bg-slate-950/50 border-slate-800/80 opacity-80'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
                  Option A — Direct File (PDF or Image)
                </span>
                {cvSource === 'upload' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C59B63]/20 text-[#C59B63] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">PDF, JPG, PNG, WebP up to 30MB</span>
            </div>

            {cvFileUrl ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      cvFileType === 'image' 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {cvFileType === 'image' ? <ImageIcon size={22} /> : <FileCode size={22} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {cvFileName || 'Uploaded CV File'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase font-bold text-[#C59B63]">{cvFileType}</span>
                        <span>•</span>
                        <span>{cvFileSize || 'Persistent'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={cvFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Preview file in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(cvFileUrl)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Copy file URL"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteUploadedCv}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Remove uploaded CV"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active &amp; live on public site
                  </span>
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    disabled={uploadPhase === 'uploading' || uploadPhase === 'saving'}
                    className="text-[#C59B63] hover:underline font-semibold cursor-pointer"
                  >
                    Replace with new file
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
                    Choose PDF or Image CV from Device
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Works on Android, iPhone, Tablet &amp; Desktop (PDF, JPG, PNG, WebP up to 30MB)
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Option B: External CV Link */}
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
              <span className="text-[10px] text-slate-500 font-mono">Hosted Link (Google Drive, GitHub, etc.)</span>
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
                Direct link to an externally hosted PDF or document.
              </p>
            </div>
          </div>
        </div>

        {/* Live Admin CV Preview (Uses the exact same file that public /cv uses) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Live Active CV Preview
            </span>
            <div className="flex items-center gap-2 text-xs">
              <a
                href="/cv"
                target="_blank"
                rel="noreferrer"
                className="text-[#C59B63] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>View /cv</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col shadow-xl min-h-[480px]">
            {/* Header info */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-xs text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                {cvFileName || (cvFileType === 'image' ? 'Ash_Wickramasinghe_CV.png' : 'Ash_Wickramasinghe_CV.pdf')}
              </span>
              <div className="flex items-center gap-2">
                {activeEffectiveUrl && (
                  <a
                    href={activeEffectiveUrl}
                    download={cvFileName || (cvFileType === 'image' ? 'Ash_Wickramasinghe_CV.png' : 'Ash_Wickramasinghe_CV.pdf')}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Download active file"
                  >
                    <Download size={13} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#C59B63]/20 text-[#C59B63] hover:bg-[#C59B63]/30 transition-colors"
                >
                  Replace
                </button>
              </div>
            </div>

            {/* Preview Body */}
            {activeEffectiveUrl ? (
              <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[420px]">
                {cvFileType === 'image' ? (
                  <img
                    src={activeEffectiveUrl}
                    alt="Active CV Preview"
                    className="max-h-[480px] w-auto max-w-full object-contain rounded"
                  />
                ) : (
                  <iframe
                    src={activeEffectiveUrl}
                    title="Active CV Preview"
                    className="w-full h-[480px] border-none bg-neutral-950"
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[420px]">
                <FileText size={40} className="text-slate-600" />
                <div className="text-xs text-slate-400">No active CV file uploaded yet</div>
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C59B63] text-black hover:bg-[#b08852] transition-colors cursor-pointer"
                >
                  Upload First CV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata & Visibility Controls */}
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
              className="px-3 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
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
