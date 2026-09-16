'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getFeaturedProjects } from '@/utils/firebase-service';
import { Project } from '@/lib/types';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getFeaturedProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass h-80 animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -10 }}
          className="glass glass-hover group cursor-pointer overflow-hidden"
        >
          {/* Project Image */}
          <div className="relative h-48 bg-gradient-to-br from-brand-accent to-brand-cyan overflow-hidden">
            <div className="w-full h-full bg-cover bg-center" style={{
              backgroundImage: `url(${project.image})`,
            }} />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300" />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(project.technologies || project.tags || []).slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-brand-accent bg-opacity-10 text-brand-accent text-xs rounded-full border border-brand-accent border-opacity-20"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-cyan hover:text-brand-accent transition-colors text-sm font-medium"
              >
                <FiExternalLink size={16} /> Live
              </a>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-cyan hover:text-brand-accent transition-colors text-sm font-medium"
                >
                  <FiGithub size={16} /> Code
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
