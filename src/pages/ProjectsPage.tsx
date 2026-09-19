import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, Filter } from 'lucide-react';
import { getProjects, subscribeToProjects } from '../lib/firebase';
import { Project, ProjectCategory } from '../types';
import { defaultProjects } from '../data/defaultContent';
import { ProjectModal } from '../components/ProjectModal';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((loaded) => {
        setProjects(loaded.filter(p => p.visibility !== 'draft'));
      })
      .catch((err) => console.warn("Using fallback projects:", err))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToProjects((newProjects) => {
      setProjects(newProjects.filter(p => p.visibility !== 'draft'));
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
      project.tags.some(t => t.toLowerCase().includes(query)) ||
      (project.tools && project.tools.some(t => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 mb-16">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Portfolio Archive
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          Selected Works &amp; Case Studies
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          A curated collection of graphic design deliverables, visual identity systems, editorial layouts, and high-conversion social media campaigns.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-12 pb-6 border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search projects or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 rounded-2xl bg-neutral-900/20">
          <p className="text-sm text-neutral-400">No projects found matching your criteria.</p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-4 text-xs font-medium uppercase tracking-wider text-accent underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-sm text-[10px] font-medium tracking-wider uppercase text-neutral-200">
                    {project.category}
                  </div>
                  {project.year && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-sm text-[10px] font-mono text-neutral-400">
                      {project.year}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <div className="w-6 h-6 rounded-full border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-white group-hover:border-neutral-500 transition-colors">
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Tags footer */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-100">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
