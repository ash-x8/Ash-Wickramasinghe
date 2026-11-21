import React, { useEffect } from 'react';
import { X, ExternalLink, ArrowUpRight } from 'lucide-react';
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
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 dark:bg-neutral-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              {project.category}
            </span>
            {project.year && (
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                &middot; {project.year}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Project Details"
            className="p-1.5 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/80">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
              {project.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200 dark:border-neutral-800/60 text-xs">
              {project.client && (
                <div>
                  <div className="text-slate-500 uppercase tracking-wider mb-1">Client</div>
                  <div className="font-medium text-slate-800 dark:text-neutral-200">{project.client}</div>
                </div>
              )}
              {project.year && (
                <div>
                  <div className="text-slate-500 uppercase tracking-wider mb-1">Year</div>
                  <div className="font-medium text-slate-800 dark:text-neutral-200">{project.year}</div>
                </div>
              )}
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Category</div>
                <div className="font-medium text-slate-800 dark:text-neutral-200">{project.category}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Role &amp; Focus</div>
                <div className="font-medium text-slate-800 dark:text-neutral-200">Design &amp; Direction</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Project Overview
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-neutral-300">
              {project.detailedDescription || project.description}
            </p>
          </div>

          {project.architectureNotes && project.architectureNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Design &amp; Execution Highlights
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-neutral-300">
                {project.architectureNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="text-[#9E6B24] dark:text-[#C59B63] mt-0.5">&bull;</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Tools &amp; Capabilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 font-mono">
              {(project.tools || project.tags).join(' · ')}
            </p>
          </div>

          {project.gallery && project.gallery.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Project Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.slice(1).map((imgUrl, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-950 aspect-video">
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

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-colors"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-full border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-slate-500 dark:hover:text-white transition-colors"
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
