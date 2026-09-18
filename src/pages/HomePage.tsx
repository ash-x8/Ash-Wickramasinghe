import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Cloud, 
  Database, 
  Code2, 
  ArrowRight, 
  ExternalLink, 
  GitBranch, 
  Lock, 
  Radio, 
  Sparkles, 
  Layers, 
  Server, 
  FileText 
} from 'lucide-react';
import { TypewriterEffect } from '../components/TypewriterEffect';
import { CyberCard } from '../components/CyberCard';
import { getSiteSettings, getProjects } from '../lib/firebase';
import { SiteSettings, Project } from '../types';
import { defaultSiteSettings, defaultProjects } from '../data/defaultContent';

export const HomePage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [loading, setLoading] = useState(true);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedProjects] = await Promise.all([
          getSiteSettings(),
          getProjects()
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
      icon: <Layers className="text-[#06B6D4]" size={24} />,
      title: "Graphic Design & Branding",
      badge: "VISUAL_IDENTITY",
      desc: "Crafting distinctive brand identities, vector logos, marketing collateral, and high-impact visual design systems that command attention.",
      tech: ["Brand Systems", "Vector Art", "Photoshop", "Illustrator"]
    },
    {
      icon: <ShieldCheck className="text-[#10B981]" size={24} />,
      title: "Social Media Strategy & Growth",
      badge: "AUDIENCE_OPS",
      desc: "Executing organic social media campaigns, carousel layouts, engagement growth strategies, and multi-channel content scheduling.",
      tech: ["Instagram & X", "LinkedIn Growth", "Content Calendars", "Analytics"]
    },
    {
      icon: <Cpu className="text-[#3B82F6]" size={24} />,
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
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Professional Status Pill */}
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
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl font-sans">
              {settings.bio}
            </p>

            {/* Status & Availability Box */}
            <div className="p-4 bg-[#111827]/70 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#10B981] rounded-full animate-ping" />
                  <div className="absolute w-2 h-2 bg-[#10B981] rounded-full" />
                </div>
                <div>
                  <div className="text-[#10B981] font-bold">STATUS: ACTIVE &amp; AVAILABLE</div>
                  <div className="text-slate-400 text-[11px]">{settings.statusText}</div>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 bg-[#111827] text-slate-400 border border-slate-800 rounded-md text-[10px]">
                {settings.location}
              </span>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/projects"
                className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <Code2 size={16} />
                Explore Projects
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/cv"
                className="px-6 py-3 bg-[#111827] border border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:border-[#06B6D4] transition-all"
              >
                <FileText size={16} className="text-[#06B6D4]" />
                View CV / Resume
              </Link>
              <Link
                to="/contact"
                className="px-5 py-3 bg-transparent border border-slate-800 text-slate-300 font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:border-slate-600 hover:text-white transition-all flex items-center gap-2"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Hero Right Avatar Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 sm:w-80 h-96 group">
              {/* Outer corner accents */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#06B6D4] z-20 rounded-tl" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#06B6D4] z-20 rounded-tr" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#06B6D4] z-20 rounded-bl" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#06B6D4] z-20 rounded-br" />

              {/* Glowing back aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#06B6D4]/20 via-[#3B82F6]/20 to-[#10B981]/15 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />

              {/* Main Avatar Container */}
              <div className="relative w-full h-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-3 bg-[#0C121D] border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-white font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    Ash Wickramasinghe
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">Verified Portfolio</span>
                </div>

                <div className="relative flex-1 overflow-hidden bg-[#0A0E17]">
                  {/* Shimmer Skeleton Loader */}
                  {!avatarLoaded && (
                    <div className="absolute inset-0 bg-[#0F172A] flex flex-col items-center justify-center gap-3 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <div className="w-6 h-6 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 tracking-wider">LOADING PROFILE...</span>
                    </div>
                  )}

                  <img 
                    src={settings.avatarUrl || "/ash_cyber_portrait.jpg"}
                    alt="Ash Wickramasinghe" 
                    onLoad={() => setAvatarLoaded(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg";
                      setAvatarLoaded(true);
                    }}
                    className={`w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-all duration-700 ${
                      avatarLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0C121D] via-[#0C121D]/80 to-transparent p-4">
                    <div className="text-white font-sans font-bold text-sm">Ash Wickramasinghe</div>
                    <div className="text-[11px] font-mono text-[#06B6D4]">{settings.title}</div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0C121D] border-t border-slate-800 grid grid-cols-2 text-center text-[10px] font-mono text-slate-400">
                  <div className="border-r border-slate-800">
                    <span className="text-slate-500 block">EXPERIENCE</span>
                    <span className="text-[#10B981] font-bold">6+ YEARS</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">STACK</span>
                    <span className="text-[#06B6D4] font-bold">FULL-STACK WEB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS HUD BAND */}
      <section className="py-8 border-y border-[#00f0ff]/20 bg-[#0f1626]/60 backdrop-blur-sm rounded-lg mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {settings.metrics.map((metric, idx) => (
            <div key={idx} className="text-center font-mono">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#00f0ff] mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-white font-bold tracking-wider uppercase">
                {metric.label}
              </div>
              <div className="text-[10px] text-slate-500">
                {metric.subtext}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE EXPERTISE PILLARS */}
      <section className="py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[#00f0ff] font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <Cpu size={14} />
              // ARCHITECTURAL CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Core Technical Competencies
            </h2>
          </div>
          <Link to="/about" className="text-xs font-mono text-[#00f0ff] hover:underline flex items-center gap-1 mt-2 sm:mt-0">
            View Complete Skills Matrix &gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corePillars.map((pillar, idx) => (
            <CyberCard key={idx} highlightHeader={pillar.badge} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0b0f19] border border-slate-700 rounded-lg">
                  {pillar.icon}
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-white font-sans group-hover:text-[#00f0ff] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {pillar.tech.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#0b0f19] border border-slate-800 text-[#00f0ff] font-mono text-[10px] rounded">
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

      {/* FEATURED PROJECTS SHOWCASE */}
      <section className="py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[#00ff66] font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <Database size={14} />
              // DEPLOYED SYSTEMS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Featured Engineering Works
            </h2>
          </div>
          <Link to="/projects" className="text-xs font-mono text-[#00f0ff] hover:underline flex items-center gap-1 mt-2 sm:mt-0">
            Explore All Projects Database &gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <CyberCard 
              key={project.id} 
              highlightHeader={project.category.toUpperCase()} 
              className="overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-44 overflow-hidden bg-[#0c121d]">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#0b0f19]/90 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] rounded">
                  FEATURED
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-[#0b0f19] text-slate-300 rounded border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                    {project.liveUrl ? (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#00f0ff] hover:underline flex items-center gap-1"
                      >
                        Live Demo <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-600">INTERNAL_SPEC</span>
                    )}

                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        Source <GitBranch size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION TRANSMISSION BANNER */}
      <section className="my-12 p-8 sm:p-12 rounded-xl bg-gradient-to-r from-[#111827] via-[#0f1626] to-[#111827] border border-[#00f0ff]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-[#00ff66] font-mono text-xs uppercase tracking-widest">
              // INITIALIZE COLLABORATION
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to engineer your next mission-critical platform?
            </h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Available for full-stack architecture, defensive web audits, high-performance UI engineering, and contract engineering.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 font-mono text-xs">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all flex items-center justify-center gap-2"
            >
              Transmit Inquiry
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/cv"
              className="px-6 py-3 bg-[#111827] border border-slate-700 text-white font-bold uppercase tracking-wider rounded hover:border-[#00f0ff] transition-all flex items-center justify-center gap-2"
            >
              Verify Credentials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
