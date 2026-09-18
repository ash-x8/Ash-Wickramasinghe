'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  ExternalLink, 
  GitBranch, 
  Search, 
  X, 
  Code2, 
  Shield 
} from 'lucide-react';
import { CyberCard } from '@/app/components/CyberCard';
import { getProjects } from '@/utils/firebase-service';
import { Project } from '@/lib/types';
import { defaultProjects } from '@/lib/defaultContent';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const loaded = await getProjects();
        if (loaded && loaded.length > 0) {
          setProjects(loaded);
        }
      } catch (err) {
        console.warn("Using fallback projects:", err);
      }
    }
    loadProjects();
  }, []);

  // Dynamically compute available categories from existing projects
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const tags = project.tags || project.technologies || [];
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      {/* PAGE HEADER */}
      <div className="mb-10 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#06B6D4]/40 text-xs font-mono text-[#06B6D4] mb-4">
          <Code2 size={14} />
          <span>// PORTFOLIO REPOSITORY // SELECTED WORKS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Featured Projects &amp; <span className="text-[#06B6D4]">Creative Works</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-mono">
          [INDEX: {projects.length} PROJECTS CATALOGED] // Curated brand systems, graphic design portfolios, social campaigns, and interactive web experiences.
        </p>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-10">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tags, tools, systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-slate-800 rounded text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00f0ff] transition-all"
          />
        </div>
      </div>

      {/* PROJECTS GRID */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl font-mono">
          <Terminal size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">NO MATCHING SYSTEMS FOUND IN ARCHIVE</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-[#111827] border border-[#00f0ff]/40 text-[#00f0ff] text-xs rounded hover:bg-[#00f0ff]/10"
          >
            RESET REPOSITORY FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const tags = project.tags || project.technologies || [];
            return (
              <CyberCard 
                key={project.id}
                highlightHeader={String(project.category).toUpperCase()}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Card Image Banner */}
                <div className="relative h-48 overflow-hidden bg-[#0c121d]">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent" />
                  
                  {project.featured && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#00f0ff] text-[#0b0f19] font-mono text-[10px] font-bold rounded shadow-[0_0_10px_#00f0ff]">
                      FEATURED
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#0b0f19] border border-slate-800 text-slate-300 font-mono text-[10px] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <button
                        onClick={() => setActiveModalProject(project)}
                        className="text-[#00f0ff] hover:underline flex items-center gap-1 font-semibold"
                      >
                        [INSPECT SPEC]
                      </button>

                      <div className="flex items-center gap-3">
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                            title="View Source Code"
                          >
                            <GitBranch size={15} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[#00ff66] hover:underline flex items-center gap-1"
                            title="Open Live Deployment"
                          >
                            Launch <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CyberCard>
            );
          })}
        </div>
      )}

      {/* PROJECT INSPECTION MODAL */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-[#00f0ff]/50 rounded-xl shadow-2xl p-6 sm:p-8 font-sans space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#0b0f19] border border-slate-800 rounded-lg hover:border-[#00f0ff]"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#0b0f19] border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs mb-2">
                SYSTEM SPEC: {String(activeModalProject.category).toUpperCase()}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {activeModalProject.title}
              </h2>
            </div>

            {/* Modal Image */}
            <div className="w-full h-56 sm:h-72 rounded-lg overflow-hidden border border-slate-800 bg-[#0c121d]">
              <img 
                src={activeModalProject.image} 
                alt={activeModalProject.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/ash_cyber_portrait.jpg";
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <h4 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider">
                // SYSTEM ARCHITECTURE OVERVIEW
              </h4>
              <p>
                {activeModalProject.detailedDescription || activeModalProject.description}
              </p>
            </div>

            {/* Architecture Highlights */}
            {activeModalProject.architectureNotes && activeModalProject.architectureNotes.length > 0 && (
              <div className="space-y-2 p-4 bg-[#0b0f19] border border-slate-800 rounded-lg">
                <h4 className="text-xs font-mono uppercase text-[#00ff66] tracking-wider flex items-center gap-1.5">
                  <Shield size={13} />
                  SECURITY & PERFORMANCE HIGHLIGHTS
                </h4>
                <ul className="space-y-1 text-xs font-mono text-slate-300">
                  {activeModalProject.architectureNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#00f0ff]">&gt;</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Tags */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                TECH STACK
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeModalProject.tags || activeModalProject.technologies || []).map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#0b0f19] border border-[#00f0ff]/20 text-[#00f0ff] font-mono text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Action Links */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3 font-mono text-xs">
              {activeModalProject.liveUrl && (
                <a
                  href={activeModalProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#00f0ff] text-[#0b0f19] font-bold rounded flex items-center gap-2 hover:bg-[#00f0ff]/90 transition-all"
                >
                  <ExternalLink size={14} />
                  Launch Live Deployment
                </a>
              )}
              {activeModalProject.githubUrl && (
                <a
                  href={activeModalProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#0b0f19] border border-slate-700 text-white rounded flex items-center gap-2 hover:border-slate-500 transition-all"
                >
                  <GitBranch size={14} />
                  View GitHub Source
                </a>
              )}
              <button
                onClick={() => setActiveModalProject(null)}
                className="px-4 py-2.5 bg-transparent border border-slate-800 text-slate-400 rounded hover:text-white"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
