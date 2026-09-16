'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Briefcase, 
  FileText 
} from 'lucide-react';
import { CyberCard } from '@/app/components/CyberCard';
import { getSiteSettings } from '@/utils/firebase-service';
import { SiteSettings } from '@/lib/types';
import { defaultSiteSettings } from '@/lib/defaultContent';

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('All');
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await getSiteSettings();
        if (loaded) setSettings(loaded);
      } catch (err) {
        console.warn("Using fallback settings for about page:", err);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Frontend & UI', 'Backend & APIs', 'Cyber & Security', 'Cloud & DevOps', 'Databases & Tools'];

  const filteredSkills = activeSkillCategory === 'All' 
    ? settings.skills 
    : settings.skills.filter(s => s.category === activeSkillCategory);

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* PAGE HEADER */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] mb-4">
          <Terminal size={14} />
          <span>// DOSSIER // ASH_WICKRAMASINGHE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Specialist Profile & <span className="text-[#00f0ff]">Career Trajectory</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-mono">
          [IDENTITY: FULL-STACK ENGINEER] // [SPEC: CYBER DEFENSE & HIGH-PERFORMANCE WEB ARCHITECTURE]
        </p>
      </div>

      {/* BIO & DOSSIER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Comprehensive Bio */}
        <div className="lg:col-span-8 space-y-6">
          <CyberCard highlightHeader="EXECUTIVE_SUMMARY" className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-[#00ff66]" size={20} />
              Mission-Driven Engineering Rigor
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {settings.aboutBio}
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {settings.careerTrajectory}
            </p>
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded">
                <span className="text-slate-500 block">PRIMARY FOCUS</span>
                <span className="text-[#00f0ff] font-bold">Full-Stack & Cyber</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded">
                <span className="text-slate-500 block">BASE COORDINATES</span>
                <span className="text-white font-bold">{settings.location}</span>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded">
                <span className="text-slate-500 block">DISPATCH STATUS</span>
                <span className="text-[#00ff66] font-bold">Ready for Contracts</span>
              </div>
            </div>
          </CyberCard>

          {/* Philosophy / Guiding Principles */}
          <CyberCard highlightHeader="ARCHITECTURAL_PRINCIPLES" className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0b0f19]/80 border border-slate-800/80 rounded-lg space-y-1">
                <div className="text-[#00f0ff] font-mono text-xs font-bold">01. ZERO TRUST BY DEFAULT</div>
                <p className="text-slate-400 text-xs">
                  Every endpoint, incoming packet, and client parameter is untrusted until cryptographically validated.
                </p>
              </div>
              <div className="p-4 bg-[#0b0f19]/80 border border-slate-800/80 rounded-lg space-y-1">
                <div className="text-[#00ff66] font-mono text-xs font-bold">02. SUB-100MS LATENCY BUDGET</div>
                <p className="text-slate-400 text-xs">
                  Applications must render smoothly, optimize render cycles, minimize bundle footprints, and eliminate hydration lag.
                </p>
              </div>
              <div className="p-4 bg-[#0b0f19]/80 border border-slate-800/80 rounded-lg space-y-1">
                <div className="text-[#3b82f6] font-mono text-xs font-bold">03. RESILIENT FAILOVER LOOPS</div>
                <p className="text-slate-400 text-xs">
                  Designing microservices with graceful degradation so system failures are contained and self-healing.
                </p>
              </div>
              <div className="p-4 bg-[#0b0f19]/80 border border-slate-800/80 rounded-lg space-y-1">
                <div className="text-[#a855f7] font-mono text-xs font-bold">04. IMMERSIVE ERGONOMICS</div>
                <p className="text-slate-400 text-xs">
                  A high-tech cyberpunk visual identity should never compromise cognitive clarity, accessibility, and utility.
                </p>
              </div>
            </div>
          </CyberCard>
        </div>

        {/* Right Column: Identity Specs & Quick Badges */}
        <div className="lg:col-span-4 space-y-6">
          <CyberCard highlightHeader="OPERATOR_IDENTITY" className="p-6 space-y-4">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-800 bg-[#0A0E17]">
              {!avatarLoaded && (
                <div className="absolute inset-0 bg-[#0F172A] flex flex-col items-center justify-center gap-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-[#06B6D4] border-t-transparent animate-spin" />
                  <span className="text-[10px] font-mono text-slate-500">LOADING AVATAR...</span>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={settings.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"} 
                alt="Ash Wickramasinghe"
                onLoad={() => setAvatarLoaded(true)}
                className={`w-full h-full object-cover object-top filter contrast-105 transition-all duration-700 ${
                  avatarLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="text-white font-bold text-sm">ASH WICKRAMASINGHE</div>
              <div className="text-[#06B6D4]">{settings.title}</div>
              <div className="text-slate-400 text-[11px] pt-1">
                Verified Cryptographic Signature: <span className="text-[#10B981]">VALID</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                href="/cv"
                className="w-full py-2.5 px-4 bg-[#00f0ff] text-[#0b0f19] font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-[#00f0ff]/90 transition-all"
              >
                <FileText size={15} />
                Access Read-Only CV
              </Link>
              <Link
                href="/contact"
                className="w-full py-2.5 px-4 bg-[#111827] border border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:border-[#00f0ff] transition-all"
              >
                Direct Contact Channel
              </Link>
            </div>
          </CyberCard>

          {/* Quick Technical Specs */}
          <CyberCard highlightHeader="SECURITY_CLEARANCE" className="p-5 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>CLEARANCE:</span>
              <span className="text-[#00ff66] font-bold">LEVEL 4 // TOP SECRET</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>PROTOCOL:</span>
              <span className="text-[#00f0ff]">TLS 1.3 / AES-GCM</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>HOST NODE:</span>
              <span className="text-white">CLOUD RUN // ASIA-EAST</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>FIREBASE CMS:</span>
              <span className="text-[#00ff66]">LIVE FIRESTORE</span>
            </div>
          </CyberCard>
        </div>
      </div>

      {/* SKILLS MATRIX SECTION */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[#00f0ff] font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <Cpu size={14} />
              // HARDWARE & SOFTWARE PROFICIENCY
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Technical Skills Matrix
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-2 sm:mt-0">
            {filteredSkills.length} MODULES DISPLAYED
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSkillCategory(cat)}
              className={`px-3 py-1.5 rounded border transition-all ${
                activeSkillCategory === cat
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid with Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill, idx) => (
            <div 
              key={idx}
              className="p-4 bg-[#111827]/70 border border-slate-800/80 rounded-lg hover:border-[#00f0ff]/40 transition-all font-mono"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                  {skill.name}
                </span>
                <span className="text-[#00f0ff] text-xs font-bold">{skill.level}%</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden p-[1px] border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded-full transition-all duration-700"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500">
                <span>SECTOR: {skill.category}</span>
                <span>EFFICIENCY: OPTIMAL</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE / EXPERIENCE & EDUCATION */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[#00ff66] font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <Briefcase size={14} />
              // CHRONOLOGICAL ARCHIVE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Experience & Academic Trajectory
            </h2>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-[2px] before:bg-gradient-to-b before:from-[#00f0ff] before:via-[#3b82f6] before:to-transparent">
          {settings.timeline.map((item) => (
            <div key={item.id} className="relative pl-8 sm:pl-12">
              {/* Timeline Bullet */}
              <div className="absolute left-1 sm:left-2 top-1.5 w-4 h-4 rounded-full bg-[#0b0f19] border-2 border-[#00f0ff] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
              </div>

              <CyberCard className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono text-[#00f0ff] font-semibold tracking-wider">
                      {item.period}
                    </span>
                    <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                      {item.role}
                    </h3>
                    <div className="text-sm font-medium text-[#00ff66]">
                      {item.organization}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#0b0f19] border border-slate-800 font-mono text-[11px] text-slate-400 self-start sm:self-auto">
                    {item.type === 'work' ? 'PROFESSIONAL ROLE' : 'ACADEMIC CREDENTIAL'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {item.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#0b0f19] border border-slate-800 text-slate-300 font-mono text-[10px] rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </CyberCard>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
