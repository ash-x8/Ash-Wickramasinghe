import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Printer,
  ArrowLeft,
  Eye,
  Layout,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getActiveCvConfig,
  subscribeToActiveCvConfig,
  getSiteSettings,
  subscribeToSiteSettings
} from '../lib/firebase';
import { SiteSettings, ActiveCvConfig } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { useSeo } from '../utils/useSeo';

export const CvPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [activeCv, setActiveCv] = useState<ActiveCvConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'embedded' | 'dossier'>('embedded');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  useSeo({
    title: 'Curriculum Vitae — Ash Wickramasinghe',
    description: 'View and download the Curriculum Vitae (CV) of Kushan A Wickramasinghe (Ash Wickramasinghe).',
    canonicalPath: '/cv',
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([getActiveCvConfig(), getSiteSettings()])
      .then(([cvData, siteData]) => {
        if (!isMounted) return;
        if (siteData) setSettings(siteData);
        if (cvData) {
          setActiveCv(cvData);
        } else if (siteData) {
          const effectiveUrl = siteData.cvUrl || (siteData.cvSource === 'upload' ? siteData.cvFileUrl : siteData.cvExternalUrl);
          if (effectiveUrl) {
            const isImg = Boolean(siteData.cvFileType === 'image' || /\.(jpg|jpeg|png|webp|avif)($|\?)/i.test(effectiveUrl));
            setActiveCv({
              sourceType: siteData.cvSource === 'link' ? 'external' : 'uploaded',
              fileType: isImg ? 'image' : 'pdf',
              fileName: siteData.cvFileName || (isImg ? 'Ash_Wickramasinghe_CV.png' : 'Ash_Wickramasinghe_CV.pdf'),
              storagePath: siteData.cvStoragePath || '',
              downloadUrl: effectiveUrl,
              mimeType: isImg ? 'image/jpeg' : 'application/pdf',
              fileSize: 0,
              fileSizeFormatted: siteData.cvFileSize || '',
              published: siteData.cvPublished ?? true,
              lastUpdated: siteData.cvLastUpdated || '2025',
              updatedAt: siteData.updatedAt || ''
            });
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('CV loading error:', err);
        setLoadError('Unable to load the current CV record. Please check connection.');
        setLoading(false);
      });

    const unsubCv = subscribeToActiveCvConfig((newCv) => {
      if (!isMounted) return;
      if (newCv) setActiveCv(newCv);
      setLoading(false);
    });

    const unsubSettings = subscribeToSiteSettings((newSettings) => {
      if (!isMounted) return;
      setSettings(newSettings);
    });

    return () => {
      isMounted = false;
      unsubCv();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (viewerContainerRef.current?.requestFullscreen) {
          await viewerContainerRef.current.requestFullscreen();
        } else if ((viewerContainerRef.current as any)?.webkitRequestFullscreen) {
          await (viewerContainerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle notice:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const effectiveCvUrl = activeCv?.downloadUrl || settings.cvUrl || (settings.cvSource === 'upload' ? settings.cvFileUrl : settings.cvExternalUrl) || '';
  const isImageCv = Boolean(
    activeCv?.fileType === 'image' ||
    settings.cvFileType === 'image' ||
    (effectiveCvUrl && /\.(jpg|jpeg|png|webp|avif)($|\?)/i.test(effectiveCvUrl))
  );

  const displayFileName = activeCv?.fileName || settings.cvFileName || (isImageCv ? 'Ash_Wickramasinghe_CV.png' : 'Ash_Wickramasinghe_CV.pdf');
  const isPublished = activeCv?.published ?? settings.cvPublished ?? true;

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setZoomLevel(100);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans flex flex-col items-center justify-center">
        <div className="p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 backdrop-blur-md text-center max-w-md w-full space-y-5 shadow-sm">
          <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#C59B63]/20 border-t-[#C59B63] animate-spin" />
            <FileText size={20} className="text-[#9E6B24] dark:text-[#C59B63]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-wide">Loading Curriculum Vitae</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">Retrieving portfolio document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-sans text-center">
        <div className="p-6 sm:p-12 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 backdrop-blur-md space-y-4 shadow-sm">
          <FileText size={40} className="mx-auto text-[#9E6B24] dark:text-[#C59B63] opacity-80" />
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Curriculum Vitae Updating</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            The curriculum vitae is currently being updated with recent portfolio milestones. Please get in touch directly.
          </p>
          <div className="pt-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-colors"
            >
              Contact Ash
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !effectiveCvUrl) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-sans text-center">
        <div className="p-6 sm:p-12 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 backdrop-blur-md space-y-4 shadow-sm">
          <AlertCircle size={40} className="mx-auto text-[#9E6B24] dark:text-[#C59B63] opacity-80" />
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Curriculum Vitae Unavailable</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            {loadError || 'The curriculum vitae document is currently being updated. Please check back shortly or explore the project catalog.'}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors"
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 lg:pt-36 pb-20 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800/80 print:hidden">
        <div className="space-y-1">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 pt-1">
            <span>Curriculum Vitae</span>
            <span className="text-xs font-mono text-[#9E6B24] dark:text-[#C59B63] font-normal">
              &middot; {isImageCv ? 'Image CV' : 'PDF Document'}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex p-0.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-900/90 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('embedded')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                viewMode === 'embedded'
                  ? 'bg-white dark:bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {isImageCv ? <ImageIcon size={12} /> : <Eye size={12} />}
              <span>{isImageCv ? 'Visual CV' : 'Document'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                viewMode === 'dossier'
                  ? 'bg-white dark:bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Layout size={12} />
              <span>Dossier</span>
            </button>
          </div>

          <a
            href={effectiveCvUrl}
            download={displayFileName}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-colors cursor-pointer shadow-sm shrink-0"
          >
            <Download size={13} />
            <span className="hidden xs:inline">{isImageCv ? 'Download Image' : 'Download CV'}</span>
            <span className="xs:hidden">Download</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Print CV Document"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {viewMode === 'embedded' ? (
        <div
          ref={viewerContainerRef}
          className={`rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0A0D14] overflow-hidden shadow-xl transition-all duration-300 flex flex-col ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen' : 'w-full'
          }`}
        >
          <div className="px-3 sm:px-6 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-neutral-400 shrink-0">
            <div className="flex items-center gap-2 max-w-[60%] sm:max-w-md truncate">
              {isImageCv ? (
                <ImageIcon size={14} className="text-[#9E6B24] dark:text-[#C59B63] shrink-0" />
              ) : (
                <FileText size={14} className="text-[#9E6B24] dark:text-[#C59B63] shrink-0" />
              )}
              <span className="font-mono text-slate-800 dark:text-neutral-200 text-xs truncate" title={displayFileName}>
                {displayFileName}
              </span>
              {activeCv?.fileSizeFormatted && (
                <span className="hidden md:inline font-mono text-[11px] text-slate-500">
                  ({activeCv.fileSizeFormatted})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {isImageCv && (
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-0.5 text-slate-700 dark:text-neutral-300">
                  <button type="button" onClick={zoomOut} className="p-1 hover:text-[#C59B63] rounded cursor-pointer" title="Zoom Out">
                    <ZoomOut size={13} />
                  </button>
                  <span className="font-mono text-[10px] px-1 text-slate-500 dark:text-neutral-400 w-8 text-center select-none">
                    {zoomLevel}%
                  </span>
                  <button type="button" onClick={zoomIn} className="p-1 hover:text-[#C59B63] rounded cursor-pointer" title="Zoom In">
                    <ZoomIn size={13} />
                  </button>
                  <button type="button" onClick={resetZoom} className="p-1 hover:text-[#C59B63] rounded cursor-pointer px-1.5" title="Reset Zoom">
                    <RotateCcw size={11} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:border-[#C59B63] transition-colors cursor-pointer text-xs"
              >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>

              <a
                href={effectiveCvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#C59B63]/40 bg-[#C59B63]/10 text-[#9E6B24] dark:text-[#C59B63] hover:bg-[#C59B63]/20 transition-colors text-xs font-medium"
              >
                <span className="hidden sm:inline">Open File</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {!isImageCv && (
            <div className="sm:hidden px-3 py-2 bg-[#C59B63]/10 border-b border-[#C59B63]/20 flex items-center justify-between text-[11px] text-[#9E6B24] dark:text-[#C59B63] shrink-0">
              <span className="truncate pr-2">Touch device detected:</span>
              <a href={effectiveCvUrl} target="_blank" rel="noreferrer" className="font-bold underline flex items-center gap-1 shrink-0">
                <span>Open in Native Reader</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}

          <div className={`relative w-full flex-1 bg-slate-100 dark:bg-[#07090E] flex flex-col justify-center items-center ${
            isFullscreen ? 'h-full overflow-auto' : 'min-h-[60vh] sm:min-h-[75vh] md:h-[850px] lg:h-[920px]'
          }`}>
            {isImageCv ? (
              <div className="w-full h-full overflow-auto p-3 sm:p-6 flex justify-center items-start">
                <img
                  src={effectiveCvUrl}
                  alt="Ash Wickramasinghe - Curriculum Vitae"
                  className="rounded-lg shadow-2xl transition-all duration-200 select-none object-contain"
                  style={{
                    width: zoomLevel === 100 ? 'auto' : `${zoomLevel}%`,
                    maxWidth: zoomLevel === 100 ? '100%' : 'none',
                    height: 'auto',
                  }}
                  loading="eager"
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex-1">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-neutral-950/80 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[#C59B63]/20 border-t-[#C59B63] animate-spin" />
                      <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">Rendering PDF document...</span>
                    </div>
                  </div>
                )}
                <iframe
                  src={effectiveCvUrl}
                  title={`Curriculum Vitae - ${displayFileName}`}
                  className="w-full h-full border-none bg-white dark:bg-neutral-950 block min-h-[550px]"
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-8 md:p-12 lg:p-14 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 space-y-10 sm:space-y-12 shadow-sm print:p-0 print:border-none print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-neutral-800">
            <div className="space-y-2 max-w-full">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100 print:text-black break-words">
                {settings.creativeName || settings.name || 'Ash Wickramasinghe'}
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold break-words">
                Graphic Designer &middot; Social Media Strategist &middot; Author
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 print:text-neutral-600 break-words">
                {settings.location} &middot; {settings.email}
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 text-left sm:text-right print:text-neutral-600 shrink-0">
              {activeCv?.lastUpdated && (
                <div className="text-[11px] font-mono text-[#9E6B24] dark:text-[#C59B63]">
                  Updated: {activeCv.lastUpdated}
                </div>
              )}
              <div>Portfolio: ash-wickramasinghe.site</div>
              <div>GitHub: github.com/ash-wickramasinghe</div>
              <div>LinkedIn: linkedin.com/in/kushan-a-wickramasinghe</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-neutral-300 print:text-neutral-800">
              {settings.aboutBio || settings.bio}
            </p>
          </div>

          {(settings.timeline || []).filter((t) => t.type === 'work').length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Professional Experience
              </h3>
              <div className="space-y-8">
                {(settings.timeline || []).filter((t) => t.type === 'work').map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h4 className="text-sm sm:text-base font-medium text-slate-900 dark:text-neutral-100 print:text-black">
                        {item.role}
                      </h4>
                      <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 print:text-neutral-600 shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <div className="text-xs text-[#9E6B24] dark:text-[#C59B63] font-medium">
                      {item.organization}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 print:text-neutral-800 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(settings.timeline || []).filter((t) => t.type === 'education').length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Education &amp; Qualifications
              </h3>
              <div className="space-y-6">
                {(settings.timeline || []).filter((t) => t.type === 'education').map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h4 className="text-sm sm:text-base font-medium text-slate-900 dark:text-neutral-100 print:text-black">
                        {item.role}
                      </h4>
                      <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 print:text-neutral-600 shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-neutral-400 print:text-neutral-600">
                      {item.organization}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 print:text-neutral-800 pt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              Core Competencies &amp; Toolkit
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {(settings.skills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950/40 print:bg-neutral-50 border border-slate-200 dark:border-neutral-800/60 print:border-neutral-300 text-xs"
                >
                  <div className="font-medium text-slate-900 dark:text-neutral-200 print:text-black truncate">
                    {skill.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {skill.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
