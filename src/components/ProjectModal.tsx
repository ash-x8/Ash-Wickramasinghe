import React, { useEffect } from 'react';
import { X, ExternalLink, ArrowUpRight, Calendar, User, Layers } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-neutral-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 bg-neutral-950/50 dark:bg-neutral-950/50 light:bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              {project.category}
            </span>
            {project.year && (
              <span className="text-xs text-neutral-500 font-mono">
                &bull; {project.year}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close Project Details"
            className="p-1.5 rounded-full text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-neutral-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Main Visual */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          {/* Project Title & Metadata Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              {project.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 text-xs">
              {project.client && (
                <div>
                  <div className="text-neutral-500 uppercase tracking-wider mb-1">Client</div>
                  <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{project.client}</div>
                </div>
              )}
              {project.year && (
                <div>
                  <div className="text-neutral-500 uppercase tracking-wider mb-1">Year</div>
                  <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{project.year}</div>
                </div>
              )}
              <div>
                <div className="text-neutral-500 uppercase tracking-wider mb-1">Category</div>
                <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{project.category}</div>
              </div>
              <div>
                <div className="text-neutral-500 uppercase tracking-wider mb-1">Role &amp; Focus</div>
                <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">Design &amp; Direction</div>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Project Overview
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
              {project.detailedDescription || project.description}
            </p>
          </div>

          {/* Architecture / Craft Highlights */}
          {project.architectureNotes && project.architectureNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Design &amp; Execution Highlights
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                {project.architectureNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&bull;</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tools & Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Tools &amp; Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {(project.tools || project.tags).map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800/80 dark:bg-neutral-800/80 light:bg-neutral-100 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 border border-neutral-700/50 dark:border-neutral-700/50 light:border-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Gallery Images */}
          {project.gallery && project.gallery.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Project Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.slice(1).map((imgUrl, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video">
                    <img 
                      src={imgUrl} 
                      alt={`${project.title} gallery asset ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions & External Links */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-opacity"
              >
                <span>View Live Work</span>
                <ArrowUpRight size={14} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
              >
                <span>Code Repository</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
