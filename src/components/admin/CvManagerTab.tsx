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
  Image as ImageIcon
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

  // Local form state initialized from props
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

  // Synchronize when settings change from Firestore listener
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

  // Upload and Save pipeline state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);

  // Active effective URL
  const activeUrl = cvSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Complete, Verified CV Upload Pipeline
   * Supports BOTH PDF and Image files (.pdf, .jpg, .jpeg, .png, .webp)
   */
  const processCvFile = async (file: File) => {
    if (!file) return;

    // Validate size (30MB max)
    if (file.size > 30 * 1024 * 1024) {
      const err = 'File size exceeds 30MB limit. Please choose a file under 30MB.';
      showToast(err, 'error');
      setErrorMessage(err);
      setUploadPhase('error');
      return;
    }

    // Validate type: support PDF, DOC, DOCX, and images (JPG, PNG, WebP)
    const nameLower = file.name.toLowerCase();
    const mimeLower = (file.type || '').toLowerCase();
    const isImage = mimeLower.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(nameLower);
    const isPdf = mimeLower.includes('pdf') || /\.pdf$/i.test(nameLower);
    const isDoc = mimeLower.includes('word') || mimeLower.includes('officedocument') || /\.(doc|docx)$/i.test(nameLower);

    if (!isImage && !isPdf && !isDoc) {
      const err = 'Unsupported file type. Please choose a PDF document (.pdf) or an image (.jpg, .jpeg, .png, .webp).';
      showToast(err, 'error');
      setErrorMessage(err);
      setUploadPhase('error');
      return;
    }

    const detectedType: 'pdf' | 'image' | 'doc' = isImage ? 'image' : (isPdf ? 'pdf' : 'doc');

    setFailedFile(file);
    setUploadPhase('uploading');
    setUploadPercent(10);
    setStatusMessage(`Transferring ${detectedType === 'image' ? 'Image CV' : 'PDF CV'}...`);
    setErrorMessage('');

    let downloadUrl = '';

    try {
      // Step 1: Upload with true progress
      downloadUrl = await uploadMediaFile(file, 'cv', (info) => {
        setUploadPercent(info.percent);
        setStatusMessage(info.message || `Uploading CV... ${info.percent}%`);
      });

      if (!downloadUrl) {
        throw new Error('Upload service returned an empty URL');
      }

      setPendingDownloadUrl(downloadUrl);
      setUploadPercent(100);
      setUploadPhase('saving');
      setStatusMessage('Recording CV configuration in database...');

      const sizeStr = formatBytes(file.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Step 2: Atomic Firestore write
      await onSave({
        cvSource: 'upload',
        cvFileUrl: downloadUrl,
        cvFileName: file.name,
        cvFileSize: sizeStr,
        cvFileType: detectedType,
        cvUrl: downloadUrl,
        cvLastUpdated: currentDate,
        cvPublished: true
      });

      // Step 3: Update local state
      setCvFileUrl(downloadUrl);
      setCvFileName(file.name);
      setCvFileSize(sizeStr);
      setCvFileType(detectedType);
      setCvSource('upload');
      setCvLastUpdated(currentDate);
      setCvPublished(true);

      setUploadPhase('completed');
      setStatusMessage(`${detectedType === 'image' ? 'Image CV' : 'Document CV'} successfully uploaded and published live!`);
      showToast(`CV "${file.name}" uploaded and published live!`, 'success');
      setFailedFile(null);
      setPendingDownloadUrl('');

      setTimeout(() => {
        setUploadPhase((prev) => prev === 'completed' ? 'idle' : prev);
      }, 4000);
    } catch (err: any) {
      console.error('CV upload pipeline error:', err);
      const msg = err.message || 'Failed to upload CV. Please check your network and retry.';
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
      const sizeStr = formatBytes(failedFile.size);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const detectedType = failedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(failedFile.name) ? 'image' : 'pdf';
      setUploadPhase('saving');
      setStatusMessage('Retrying database configuration save...');
      onSave({
        cvSource: 'upload',
        cvFileUrl: pendingDownloadUrl,
        cvFileName: failedFile.name,
        cvFileSize: sizeStr,
        cvFileType: detectedType,
        cvUrl: pendingDownloadUrl,
        cvLastUpdated: currentDate
      }).then(() => {
        setCvFileUrl(pendingDownloadUrl);
        setCvFileName(failedFile.name);
        setCvFileSize(sizeStr);
        setCvFileType(detectedType);
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
        showToast('Save failed: ' + err.message, 'error');
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
      showToast('Uploaded CV removed', 'info');
    } catch (err: any) {
      showToast('Failed to remove CV: ' + err.message, 'error');
    }
  };

  const handleSetCurrentDate = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setCvLastUpdated(dateStr);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('CV URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchSource = async (newSource: 'upload' | 'link') => {
    setCvSource(newSource);
    const newEffectiveUrl = newSource === 'upload' ? (cvFileUrl || cvExternalUrl) : (cvExternalUrl || cvFileUrl);
    try {
      await onSave({
        cvSource: newSource,
        cvUrl: newEffectiveUrl
      });
      showToast(`Switched active CV source to ${newSource === 'upload' ? 'Uploaded File' : 'External Link'}`);
    } catch (err: any) {
      showToast('Failed to update source: ' + err.message, 'error');
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
        cvFileType,
        cvExternalUrl: cvExternalUrl.trim(),
        cvUrl: effectiveCvUrl.trim(),
        cvPublished,
        cvLastUpdated: cvLastUpdated.trim()
      });
      showToast('CV configuration saved and published live!', 'success');
    } catch (err: any) {
      console.error('Failed to save CV settings:', err);
      showToast(err.message || 'Failed to save CV settings', 'error');
    } finally {
      setManualSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden Native File Input supporting Mobile (Android, iOS) and Desktop for both PDF & Images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
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
            Supports both PDF documents (.pdf) and high-resolution CV images (.jpg, .png, .webp). Uploaded files synchronize live with the public website.
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

      {/* Upload State Feedback Banner with Retry */}
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
                  {uploadPhase === 'uploading' && `Uploading CV File (${uploadPercent}%)...`}
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
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Retry Upload</span>
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
              Choose whether the public website serves your uploaded document/image or an external link.
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
              <span>Uploaded File (PDF / Image)</span>
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
                        <span>{cvFileSize || 'Stored'}</span>
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

                {/* Preview snippet for images */}
                {cvFileType === 'image' && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 font-mono mb-1.5 uppercase">Image Preview:</div>
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-40 bg-black/40 flex items-center justify-center">
                      <img 
                        src={cvFileUrl} 
                        alt="CV Preview" 
                        className="max-h-40 w-auto object-contain"
                      />
                    </div>
                  </div>
                )}

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
