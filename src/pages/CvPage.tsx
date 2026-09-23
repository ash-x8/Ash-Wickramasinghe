import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  Eye, 
  Layout, 
  Download, 
  ExternalLink,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';

export const CvPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [viewMode, setViewMode] = useState<'dossier' | 'embedded'>('dossier');
  const [imageZoomFit, setImageZoomFit] = useState(true);

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn("Using fallback settings for CV:", err));

    // Real-time synchronization: updates live without page refresh or redeployment
    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const effectiveCvUrl = settings.cvUrl || (settings.cvSource === 'upload' ? settings.cvFileUrl : settings.cvExternalUrl);

  // Detect whether active CV is an image or PDF
  const isImageCv = Boolean(
    settings.cvFileType === 'image' || 
    (effectiveCvUrl && /\.(jpg|jpeg|png|webp|avif)($|\?)/i.test(effectiveCvUrl))
  );

  // If unpublished by administrator
  if (settings.cvPublished === false) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-sans text-center">
        <div className="p-6 sm:p-12 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md space-y-4">
          <FileText size={40} className="mx-auto text-[#C59B63] opacity-80" />
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Curriculum Vitae Updating</h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            The curriculum vitae of Ash Wickramasinghe is currently being refreshed with recent project achievements. Please connect directly via the contact coordinates.
          </p>
          <div className="pt-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              Contact Ash
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 lg:pt-36 pb-20 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans overflow-x-hidden">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 print:hidden">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors self-start"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {effectiveCvUrl && (
            <div className="inline-flex p-0.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-[11px] max-w-full overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('dossier')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-xs ${
                  viewMode === 'dossier'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layout size={12} />
                <span>Dossier View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('embedded')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-xs ${
                  viewMode === 'embedded'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isImageCv ? <ImageIcon size={12} /> : <Eye size={12} />}
                <span>{isImageCv ? 'Visual CV Viewer' : 'Document Viewer'}</span>
              </button>
            </div>
          )}

          {effectiveCvUrl && (
            <a
              href={effectiveCvUrl}
              download={settings.cvFileName || (isImageCv ? "Ash_Wickramasinghe_CV.png" : "Ash_Wickramasinghe_CV.pdf")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full bg-[#C59B63] text-black hover:bg-[#b08852] transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Download size={13} />
              <span>{isImageCv ? 'Download Image' : 'Download CV'}</span>
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs uppercase tracking-wider rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Embedded Document / Image Viewer Mode */}
      {viewMode === 'embedded' && effectiveCvUrl ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl space-y-0">
          
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
            <span className="font-mono truncate max-w-full flex items-center gap-2">
              {isImageCv ? <ImageIcon size={14} className="text-[#C59B63]" /> : <FileText size={14} className="text-[#C59B63]" />}
              <span>{settings.cvFileName || (isImageCv ? 'Ash_Wickramasinghe_CV.png' : 'Ash_Wickramasinghe_CV.pdf')}</span>
            </span>

            <div className="flex items-center gap-3">
              {isImageCv && (
                <button
                  type="button"
                  onClick={() => setImageZoomFit(!imageZoomFit)}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                >
                  {imageZoomFit ? <ZoomIn size={12} /> : <ZoomOut size={12} />}
                  <span>{imageZoomFit ? 'Actual Size' : 'Fit Screen'}</span>
                </button>
              )}
              <a
                href={effectiveCvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#C59B63] hover:underline flex items-center gap-1 text-xs font-mono"
              >
                <span>Fullscreen</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Visual Canvas */}
          {isImageCv ? (
            /* High-Res Responsive Image CV Viewer */
            <div className="p-3 sm:p-6 bg-neutral-950 flex justify-center items-center overflow-x-auto min-h-[50vh]">
              <img
                src={effectiveCvUrl}
                alt="Ash Wickramasinghe - Curriculum Vitae"
                className={`rounded-xl shadow-2xl transition-all duration-300 ${
                  imageZoomFit 
                    ? 'max-w-full h-auto object-contain mx-auto' 
                    : 'w-auto max-w-none'
                }`}
                style={{ maxHeight: imageZoomFit ? '85vh' : 'none' }}
              />
            </div>
          ) : (
            /* Responsive PDF Viewer with Mobile Helper */
            <div className="space-y-0">
              {/* Mobile Quick Action Banner */}
              <div className="sm:hidden p-3 bg-[#C59B63]/10 border-b border-[#C59B63]/20 flex items-center justify-between text-xs text-[#C59B63]">
                <span>Tap below to open or download full document:</span>
                <a
                  href={effectiveCvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1"
                >
                  <span>Open PDF</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <iframe
                src={effectiveCvUrl}
                title="Curriculum Vitae Document Viewer"
                className="w-full h-[65vh] sm:h-[800px] border-none bg-neutral-950"
              />
            </div>
          )}
        </div>
      ) : (
        /* Printable CV Dossier Canvas with High-Contrast Mobile Support */
        <div className="p-4 sm:p-8 md:p-12 lg:p-14 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white space-y-10 sm:space-y-12 shadow-sm print:p-0 print:border-none print:bg-white print:text-black">
          
          {/* CV Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
            <div className="space-y-2 max-w-full">
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black break-words">
                {settings.creativeName || settings.name || "Ash Wickramasinghe"}
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-[#C59B63] font-medium break-words">
                Graphic Designer &bull; Social Media Strategist &bull; Content Editor
              </p>
              <p className="text-xs text-neutral-400 print:text-neutral-600 break-words">
                {settings.location} &bull; {settings.email}
              </p>
            </div>

            <div className="text-xs text-neutral-400 space-y-1 text-left sm:text-right print:text-neutral-600 shrink-0">
              {settings.cvLastUpdated && (
                <div className="text-[11px] font-mono text-[#C59B63]">
                  Updated: {settings.cvLastUpdated}
                </div>
              )}
              <div className="break-all sm:break-normal">Portfolio: ash-wickramasinghe.site</div>
              <div className="break-all sm:break-normal">GitHub: github.com/ash-wickramasinghe</div>
              <div className="break-all sm:break-normal">LinkedIn: linkedin.com/in/kushan-a-wickramasinghe</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-[#C59B63] font-semibold">
              Executive Summary
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800">
              {settings.aboutBio || settings.bio}
            </p>
          </div>

          {/* Professional Experience */}
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#C59B63] font-semibold">
              Professional Experience
            </h2>

            <div className="space-y-8">
              {(settings.timeline || []).filter(t => t.type === 'work').map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-sm sm:text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black">
                      {item.role}
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 print:text-neutral-600 shrink-0">
                      {item.period}
                    </span>
                  </div>
                  <div className="text-xs text-[#C59B63] font-medium">
                    {item.organization}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(item.skills || []).map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-neutral-100 print:bg-neutral-100 text-neutral-400 print:text-neutral-700 border border-neutral-800/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Background */}
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#C59B63] font-semibold">
              Education &amp; Qualifications
            </h2>

            <div className="space-y-6">
              {(settings.timeline || []).filter(t => t.type === 'education').map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-sm sm:text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black">
                      {item.role}
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 print:text-neutral-600 shrink-0">
                      {item.period}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 print:text-neutral-600">
                    {item.organization}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800 pt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Competencies & Software Matrix */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-[#C59B63] font-semibold">
              Core Competencies &amp; Toolkit
            </h2>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {(settings.skills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-neutral-950/40 dark:bg-neutral-950/40 light:bg-neutral-50 print:bg-neutral-50 border border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 print:border-neutral-300 text-xs"
                >
                  <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800 print:text-black truncate">
                    {skill.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
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
