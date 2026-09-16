'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut
} from 'lucide-react';
import { getSiteSettings } from '@/utils/firebase-service';
import { SiteSettings } from '@/lib/types';
import { defaultSiteSettings } from '@/lib/defaultContent';

export default function CvPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'document' | 'interactive'>('document');
  const [watermarkTime] = useState(() => new Date().toISOString());
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const showSecurityNotice = (message: string) => {
    setSecurityNotice(message);
    setTimeout(() => {
      setSecurityNotice(null);
    }, 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await getSiteSettings();
        if (loaded) setSettings(loaded);
      } catch (err) {
        console.warn("Using fallback settings for CV page:", err);
      }
    }
    loadData();

    // Block keyboard shortcuts: Ctrl+P, Ctrl+S, Cmd+P, Cmd+S
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice("SECURITY NOTICE: Document download and print functions are disabled to protect proprietary credentials.");
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const cvUrl = settings.cvUrl || defaultSiteSettings.cvUrl;
  // Embed with PDF parameters disabling browser toolbar/download UI
  const secureEmbedUrl = `${cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <div 
      onContextMenu={handleContextMenu}
      className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 no-select-document select-none"
    >
      {/* Floating Security Banner Toast */}
      {securityNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#111827] border border-[#06B6D4] text-[#06B6D4] font-mono text-xs rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-3 animate-bounce">
          <ShieldAlert size={18} className="text-[#06B6D4] shrink-0" />
          <span>{securityNotice}</span>
        </div>
      )}
      {/* PAGE HEADER & SECURITY BANNER */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] mb-3">
              <Lock size={13} className="text-[#00ff66]" />
              <span>// RESTRICTED ACCESS // VERIFIED DOSSIER</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Curriculum Vitae <span className="text-[#00f0ff]">[Read-Only]</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-mono mt-1">
              DIGITAL RIGHTS MANAGEMENT: ACTIVE // DIRECT DOWNLOAD &amp; PRINT DISABLED
            </p>
          </div>

          {/* Security Status Tag */}
          <div className="p-3 bg-[#111827] border border-[#00ff66]/30 rounded-lg flex items-center gap-3 font-mono text-xs self-start sm:self-auto">
            <ShieldCheck size={20} className="text-[#00ff66]" />
            <div>
              <div className="text-[#00ff66] font-bold">DRM ENCRYPTION ENGAGED</div>
              <div className="text-[10px] text-slate-400">Right-click &amp; Save Locked</div>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mt-4 p-3 bg-[#0c121d] border border-amber-500/30 rounded flex items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>
              This document is protected by digital watermark. Screen captures, prints, and downloads are restricted.
            </span>
          </div>
          <span className="hidden md:inline text-slate-500">TS_KEY: {watermarkTime.slice(0, 10)}</span>
        </div>
      </div>

      {/* VIEWER CONTROLS HUD */}
      <div className="p-3 bg-[#111827] border border-slate-800 rounded-t-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded border border-slate-800">
          <button
            onClick={() => setViewMode('document')}
            className={`px-3 py-1 rounded transition-all ${
              viewMode === 'document' 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF DOCUMENT EMBED
          </button>
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3 py-1 rounded transition-all ${
              viewMode === 'interactive' 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            INTERACTIVE DOSSIER
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3 text-slate-400">
          <button
            onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
            className="p-1.5 hover:text-[#00f0ff] hover:bg-[#0b0f19] rounded border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] w-12 text-center text-white">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
            className="p-1.5 hover:text-[#00f0ff] hover:bg-[#0b0f19] rounded border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="px-2 py-1 text-[10px] text-slate-500 hover:text-white border border-slate-800 rounded"
          >
            RESET
          </button>
        </div>
      </div>

      {/* DOCUMENT VIEWER CANVAS */}
      <div className="relative bg-[#0a0e17] border-x border-b border-slate-800 rounded-b-xl overflow-hidden min-h-[720px] shadow-2xl">
        {/* Anti-Download Floating Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-8 opacity-15 select-none">
          <div className="text-right font-mono text-[10px] text-[#00f0ff]">
            RESTRICTED ACCESS // EMBEDDED PREVIEW ONLY
          </div>
          <div className="text-center font-mono text-sm sm:text-lg text-slate-400 tracking-widest -rotate-12">
            CONFIDENTIAL // ASH WICKRAMASINGHE // READ-ONLY
          </div>
          <div className="text-left font-mono text-[10px] text-[#00ff66]">
            WATERMARK VERIFIED: {watermarkTime}
          </div>
        </div>

        {/* Mode 1: PDF Embed with Toolbar Suppression */}
        {viewMode === 'document' ? (
          <div 
            className="w-full flex justify-center p-4 sm:p-8 overflow-auto transition-transform origin-top"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className="relative w-full max-w-4xl h-[900px] bg-white rounded shadow-2xl overflow-hidden">
              <iframe
                src={secureEmbedUrl}
                title="Ash Wickramasinghe CV Read Only"
                className="w-full h-full border-0 pointer-events-auto"
                loading="lazy"
              />
              {/* Secondary transparent click-interceptor overlay at top right where PDF download/print buttons typically appear */}
              <div 
                className="absolute top-0 right-0 w-36 h-16 z-30 pointer-events-auto cursor-not-allowed bg-transparent"
                title="Download disabled by document owner"
                onClick={(e) => {
                  e.stopPropagation();
                  showSecurityNotice("SECURITY POLICY: Document downloading and printing are restricted by the owner.");
                }}
              />
            </div>
          </div>
        ) : (
          /* Mode 2: High-Definition Cyber Interactive Resume */
          <div className="max-w-4xl mx-auto p-6 sm:p-12 space-y-8 font-sans text-slate-300">
            {/* Resume Header */}
            <div className="border-b border-slate-800 pb-8 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">ASH WICKRAMASINGHE</h2>
                  <div className="text-[#00f0ff] font-mono text-sm font-semibold">{settings.title}</div>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-0.5">
                  <div>{settings.email}</div>
                  <div>{settings.location}</div>
                  <div className="text-[#00ff66]">github.com/ash-x8</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 pt-2 leading-relaxed">
                {settings.aboutBio}
              </p>
            </div>

            {/* Core Competencies Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider">
                // CORE TECHNICAL PROFICIENCIES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#111827] border border-slate-800 rounded">
                  <div className="text-white font-bold mb-1">Frontend Engineering</div>
                  <p className="text-slate-400 text-[11px]">React, Next.js, TypeScript, Tailwind CSS, Framer Motion, WebSockets, HTML5/Canvas</p>
                </div>
                <div className="p-3 bg-[#111827] border border-slate-800 rounded">
                  <div className="text-white font-bold mb-1">Backend &amp; Security</div>
                  <p className="text-slate-400 text-[11px]">Node.js, Express, Python, Zero-Trust Architecture, OAuth2, AES-GCM, Penetration Testing</p>
                </div>
                <div className="p-3 bg-[#111827] border border-slate-800 rounded">
                  <div className="text-white font-bold mb-1">Cloud &amp; DevOps</div>
                  <p className="text-slate-400 text-[11px]">Docker, Kubernetes, Firebase (Auth, Firestore, Storage), CI/CD Automation, Linux SysAdmin</p>
                </div>
                <div className="p-3 bg-[#111827] border border-slate-800 rounded">
                  <div className="text-white font-bold mb-1">Databases &amp; Systems</div>
                  <p className="text-slate-400 text-[11px]">PostgreSQL, MongoDB, Redis Caching, Firestore, Cloud SQL, System Hardening</p>
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase text-[#00ff66] tracking-wider">
                // PROFESSIONAL EXPERIENCE
              </h3>
              {settings.timeline.filter(t => t.type === 'work').map(exp => (
                <div key={exp.id} className="p-4 bg-[#111827] border border-slate-800 rounded-lg space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h4 className="text-base font-bold text-white">{exp.role}</h4>
                      <div className="text-xs font-mono text-[#00f0ff]">{exp.organization}</div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 mt-1 sm:mt-0">{exp.period}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {exp.skills.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-[#0b0f19] text-slate-400 rounded border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase text-[#3b82f6] tracking-wider">
                // ACADEMIC EDUCATION
              </h3>
              {settings.timeline.filter(t => t.type === 'education').map(edu => (
                <div key={edu.id} className="p-4 bg-[#111827] border border-slate-800 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white">{edu.role}</h4>
                    <span className="text-xs font-mono text-slate-400">{edu.period}</span>
                  </div>
                  <div className="text-xs font-mono text-[#3b82f6]">{edu.organization}</div>
                  <p className="text-xs text-slate-400 pt-1">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
