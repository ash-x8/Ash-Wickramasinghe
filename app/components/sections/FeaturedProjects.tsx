'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFeaturedProjects } from '@/utils/firebase-service';
import type { Project } from '@/lib/types';
import { defaultProjects } from '@/lib/defaultContent';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects.filter((project) => project.featured).slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFeaturedProjects()
      .then((data) => { if (active) setProjects(data); })
      .catch((error) => console.error('Error loading featured projects:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="glass h-80 animate-shimmer" />)}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <motion.article key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -8 }} className="glass glass-hover group overflow-hidden">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-accent to-brand-cyan">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${project.image})` }} role="img" aria-label={project.title} />
            <div className="absolute inset-0 bg-black/40 transition-all group-hover:bg-black/20" />
          </div>
          <div className="p-6">
            <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-brand-cyan">{project.title}</h3>
            <p className="mb-4 line-clamp-2 text-sm text-gray-300">{project.description}</p>
            <div className="mb-4 flex flex-wrap gap-2">{(project.technologies ?? project.tags ?? []).slice(0, 3).map((tech) => <span key={tech} className="rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-xs text-brand-accent">{tech}</span>)}</div>
            <div className="flex gap-3">
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-brand-cyan hover:text-brand-accent"><FiExternalLink size={16} />Live</a>}
              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-brand-cyan hover:text-brand-accent"><FiGithub size={16} />Code</a>}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
