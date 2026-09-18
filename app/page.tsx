'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Terminal, 
  Sparkles, 
  Layers, 
  Share2, 
  Film, 
  Code2, 
  ArrowRight, 
  ExternalLink, 
  GitBranch, 
  FileText,
  Palette,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { TypewriterEffect } from './components/TypewriterEffect';
import { CyberCard } from './components/CyberCard';
import { getSiteSettings, getProjects } from '@/lib/firebase';
import type { SiteSettings, Project } from '@/lib/types';
import { defaultSiteSettings, defaultProjects } from '@/lib/defaultContent';

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedProjects] = await Promise.all([
          getSiteSettings().catch(() => null),
          getProjects().catch(() => null)
        ]);
        if (loadedSettings) setSettings(loadedSettings);
        if (loadedProjects && loadedProjects.length > 0) setProjects(loadedProjects);
      } catch (err) {
        console.warn("Using fallback data for home page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const corePillars = [
    {
      icon: <Palette className="text-[#06B6D4]" size={24} />,
      title: "Graphic Design & Branding",
      badge: "VISUAL_IDENTITY",
      desc: "Crafting distinctive brand identities, vector logos, marketing collateral, and high-impact visual design systems that command attention.",
      tech: ["Brand Systems", "Vector Art", "Photoshop", "Illustrator"]
    },
    {
      icon: <Megaphone className="text-[#10B981]" size={24} />,
      title: "Social Media Strategy & Growth",
      badge: "AUDIENCE_OPS",
      desc: "Executing organic social media campaigns, carousel layouts, engagement growth strategies, and multi-channel content scheduling.",
      tech: ["Instagram & X", "LinkedIn Growth", "Content Calendars", "Analytics"]
    },
    {
      icon: <Film className="text-[#3B82F6]" size={24} />,
      title: "Content & Reel Video Editing",
      badge: "MOTION_MEDIA",
      desc: "Producing high-retention short-form video reels, promotional motion graphics, kinetic typography, and polished digital storytelling.",
      tech: ["Shorts & Reels", "Kinetic Type", "Premiere Pro", "Color Grading"]
    },
    {
      icon: <Code2 className="text-[#A855F7]" size={24} />,
      title: "Creative Digital Web Platforms",
      badge: "DIGITAL_TECH",
      desc: "Designing and developing modern, responsive web experiences, bespoke portfolios, and interactive interfaces with Next.js and Tailwind.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase"]
    }
  ];

  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      
      {/* HERO SECTION */}
      <section className="py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Creative Digital Specialist &amp; Designer</span>
            </div>

            {/* Main Title & Typewriter */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
                Ash <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#10B981]">Wickramasinghe</span>
              </h1>
              <div className="text-xl sm:text-2xl font-mono text-slate-300 min-h-[36px]">
                <TypewriterEffect 
                  prefix="&gt;"
                  words={[
                    "Graphic Design & Branding Specialist",
                    "Social Media Strategist & Manager",
                    "Content & Video Reel Editor",
                    "Creative Digital Web Technologist"
                  ]}
                />
              </div>
            </div>

            {/* Bio Narrative */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-sans">
              {settings.bio}
            </p>

            {/* Status & Clearance Box */}
            <div className="p-4 rounded-xl bg-[#111827]/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-[#10B981] font-bold">● AVAILABILITY:</span>
                <span>{settings.statusText || 'OPEN FOR SELECT PROJECTS'}</span>
              </div>
              <div className="text-[#06B6D4] tracking-wider">
                {settings.clearanceLevel || 'CREATIVE_PORTFOLIO // VERIFIED'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/projects"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#0B0F17] font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2"
              >
                <span>EXPLORE WORK</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/cv"
                className="px-6 py-3 bg-[#111827] hover:bg-slate-800 text-white font-mono text-sm font-medium tracking-wider rounded-lg border border-slate-700 hover:border-[#06B6D4] transition-all flex items-center gap-2"
              >
                <FileText size={16} className="text-[#06B6D4]" />
                <span>VIEW CV DOSSIER</span>
              </Link>

              <Link
                href="/contact"
                className="px-6 py-3 bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white font-mono text-sm tracking-wider rounded-lg transition-all flex items-center gap-2"
              >
                <span>DIRECT INQUIRY &gt;</span>
              </Link>
            </div>
          </div>

          {/* Hero Right: Creative Portrait & HUD Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <CyberCard 
                glowColor="cyan"
                highlightHeader="SPECIALIST_DOSSIER // AW-2026"
                className="p-6"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700/80 mb-5 bg-[#0B0F17]">
                  <img
                    src={settings.avatarUrl || "/ash_cyber_portrait.jpg"}
                    alt="Ash Wickramasinghe"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg";
                    }}
                  />
                  
                  {/* Subtle portrait overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-60" />
                  
                  {/* Live Status Badge */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#111827]/90 border border-[#10B981]/50 backdrop-blur-sm flex items-center gap-2 text-[11px] font-mono text-[#10B981]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    <span>ONLINE &amp; ACTIVE</span>
                  </div>
                </div>

                {/* Card Quick Profile Details */}
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">OPERATOR:</span>
                    <span className="text-white font-bold">{settings.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">EXPERTISE:</span>
                    <span className="text-[#06B6D4]">Graphic Design &amp; Content</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">LOCATION:</span>
                    <span className="text-slate-300">{settings.location}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">DIRECT DISPATCH:</span>
                    <a href={`mailto:${settings.email}`} className="text-[#3B82F6] hover:underline">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </CyberCard>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS HUD BAND */}
      <section className="py-8 border-y border-slate-800/80 my-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(settings.metrics || defaultSiteSettings.metrics).map((metric, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#111827]/40 border border-slate-800/60 font-mono">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#06B6D4] mb-1 tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-0.5 font-sans">
                {metric.label}
              </div>
              <div className="text-[11px] text-slate-400">
                {metric.subtext}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-3">
              <Terminal size={13} />
              <span>// CORE_DISCIPLINES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Strategic Creative &amp; <span className="text-[#06B6D4]">Digital Capabilities</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md font-sans">
            Delivering cross-disciplinary expertise from foundational visual identity design to high-converting social campaigns and responsive web presences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corePillars.map((pillar, idx) => (
            <CyberCard 
              key={idx}
              highlightHeader={pillar.badge}
              className="p-6 transition-all hover:border-[#06B6D4]/60"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
                  {pillar.icon}
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-white font-sans">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-sans">
                    {pillar.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {pillar.tech.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#0B0F17] border border-slate-800 text-[11px] font-mono text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* FEATURED WORK PREVIEW */}
      <section className="py-12 border-t border-slate-800/80 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-slate-800 text-xs font-mono text-[#06B6D4] mb-3">
              <Sparkles size={13} />
              <span>// SELECTED_WORK</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Featured <span className="text-[#06B6D4]">Projects &amp; Case Studies</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
          >
            <span>VIEW ALL PROJECTS</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <CyberCard 
              key={project.id}
              highlightHeader={`PRJ_ID // ${project.category.toUpperCase()}`}
              className="flex flex-col overflow-hidden"
            >
              <div className="relative h-48 w-full bg-[#0B0F17] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg";
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#111827]/90 border border-[#06B6D4]/40 text-[10px] font-mono text-[#06B6D4]">
                  {project.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans mb-1">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 font-sans">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {(project.tags || project.technologies || []).slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#0B0F17] border border-slate-800 text-[10px] font-mono text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    {project.liveUrl ? (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#06B6D4] hover:underline flex items-center gap-1"
                      >
                        <span>VIEW LIVE</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-600">INSPECTION_MODE</span>
                    )}

                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <GitBranch size={12} />
                        <span>SOURCE</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION DOSSIER */}
      <section className="py-16 mt-8">
        <CyberCard 
          glowColor="cyan"
          highlightHeader="CONNECT_CHANNEL // SECURE_INQUIRY"
          className="p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
              Ready to elevate your <span className="text-[#06B6D4]">brand and digital presence?</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
              Whether you need comprehensive visual branding, high-performing social media campaigns, content video editing, or a tailored modern web experience, let&apos;s build something exceptional.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#0B0F17] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2"
              >
                <span>INITIATE COLLABORATION</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cv"
                className="px-8 py-3.5 bg-[#111827] hover:bg-slate-800 text-white font-mono text-xs sm:text-sm font-medium tracking-wider rounded-lg border border-slate-700 hover:border-[#06B6D4] transition-all flex items-center gap-2"
              >
                <FileText size={16} className="text-[#06B6D4]" />
                <span>INSPECT CREDENTIALS</span>
              </Link>
            </div>
          </div>
        </CyberCard>
      </section>

    </div>
  );
}
