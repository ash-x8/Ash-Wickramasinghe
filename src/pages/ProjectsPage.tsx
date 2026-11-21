import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import { getProjects, subscribeToProjects, trackProjectClick } from '../lib/firebase';
import { Project } from '../types';
import { defaultProjects } from '../data/defaultContent';
import { ProjectModal } from '../components/ProjectModal';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { ScrollReveal } from '../components/ScrollReveal';
import { useSeo } from '../utils/useSeo';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Projects — Ash Wickramasinghe',
    description: 'Portfolio case studies spanning graphic design, social media content, branding, posters, and web projects.',
    canonicalPath: '/projects',
  });

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    trackProjectClick(project.id, project.title, project.category);
  };

  useEffect(() => {
    getProjects()
      .then((loaded) => {
        setProjects(loaded.filter((p) => p.visibility !== 'draft'));
      })
      .catch((err) => console.warn('Using fallback projects:', err))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToProjects((newProjects) => {
      setProjects(newProjects.filter((p) => p.visibility !== 'draft'));
    });

    return () => unsubscribe();
  }, []);

  const categories: string[] = [
    'All',
    'Graphic Design',
    'Branding',
    'Social Media',
    'Posters',
    'Creative Projects',
    'Web Projects',
    'Other'
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = activeCategory === 'All' || project.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((t) => t.toLowerCase().includes(query)) ||
      (project.tools && project.tools.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      <ScrollReveal direction="up" distance={20}>
        <div className="max-w-3xl space-y-4 mb-16">
          <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
            Portfolio Archive
          </span>
          <h1 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
            Selected Works &amp; Case Studies
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-light">
            A curated collection of graphic design deliverables, visual identity systems, editorial layouts, and high-engagement social media work.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" distance={15} delay={0.08}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-12 pb-6 border-b border-slate-200 dark:border-neutral-800/80">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-[#0A0D14] font-semibold'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search projects or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-white dark:bg-[#111622] border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#C59B63] transition-colors"
            />
          </div>
        </div>
      </ScrollReveal>

      {loading ? (
        <ContentSkeleton type="project" count={6} />
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-slate-200 dark:border-neutral-800/60 rounded-2xl bg-white dark:bg-[#111622]/40">
          <p className="text-sm text-slate-600 dark:text-neutral-400">No projects found matching your criteria.</p>
          <button
            type="button"
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#9E6B24] dark:text-[#C59B63] underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.35) }}
              whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
              onClick={() => handleSelectProject(project)}
              className="group cursor-pointer flex flex-col justify-between space-y-4 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 hover:border-[#C59B63]/50 transition-all shadow-sm dark:shadow-none"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-white/90 dark:bg-neutral-950/85 backdrop-blur-sm text-[10px] font-semibold tracking-wider uppercase text-slate-900 dark:text-neutral-200">
                    {project.category}
                  </div>
                  {project.year && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-white/90 dark:bg-neutral-950/85 backdrop-blur-sm text-[10px] font-mono text-slate-700 dark:text-neutral-300">
                      {project.year}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-neutral-100 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors">
                      {project.title}
                    </h3>
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-neutral-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-neutral-400 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] group-hover:border-[#C59B63]/60 transition-colors">
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/60">
                <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 truncate">
                  {project.tags.slice(0, 3).join(' · ')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
