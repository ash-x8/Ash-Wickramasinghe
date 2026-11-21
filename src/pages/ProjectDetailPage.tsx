import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Layers,
  ArrowRight,
  Share2,
  Check
} from 'lucide-react';
import { getProjectBySlug, getProjects, trackProjectClick } from '../lib/firebase';
import { Project } from '../types';
import { defaultProjects } from '../data/defaultContent';
import { useSeo } from '../utils/useSeo';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: project ? `${project.title} — Ash Wickramasinghe` : 'Case Study — Ash Wickramasinghe',
    description: project?.description || 'Portfolio project case study by Ash Wickramasinghe.',
    canonicalPath: slug ? `/projects/${slug}` : '/projects',
  });

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const found = await getProjectBySlug(slug);
        const resolved = found || defaultProjects.find((p) => p.slug === slug || p.id === slug) || null;
        setProject(resolved);
        if (resolved) {
          setActiveImage(resolved.image);
          trackProjectClick(resolved.id, resolved.title, resolved.category);
        }

        const list = await getProjects();
        setAllProjects(list.length > 0 ? list : defaultProjects);
      } catch (e) {
        console.warn('Could not load project:', e);
        const fallback = defaultProjects.find((p) => p.slug === slug || p.id === slug);
        setProject(fallback || null);
        if (fallback) {
          setActiveImage(fallback.image);
          trackProjectClick(fallback.id, fallback.title, fallback.category);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center font-mono text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full border-2 border-[#C59B63] border-t-transparent animate-spin" />
          <span>LOADING CASE STUDY...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center">
        <Layers size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Project Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
          The requested project record could not be located in the current showcase.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111622] border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-[#C59B63] rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Return to Projects Catalog</span>
        </Link>
      </div>
    );
  }

  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug || p.id === project.id);
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1
    ? allProjects[currentIndex + 1]
    : allProjects[0];

  const galleryImages = project.gallery && project.gallery.length > 0
    ? project.gallery
    : [project.image];

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans relative z-10">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ALL PROJECTS</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111622] hover:bg-slate-100 dark:hover:bg-[#1A2234] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors cursor-pointer"
          title="Share Case Study"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600 dark:text-[#10B981]" />
              <span className="text-emerald-600 dark:text-[#10B981]">Copied Link</span>
            </>
          ) : (
            <>
              <Share2 size={13} className="text-[#9E6B24] dark:text-[#C59B63]" />
              <span>Share Case Study</span>
            </>
          )}
        </button>
      </div>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-mono text-xs mb-4">
          <span className="text-[#9E6B24] dark:text-[#C59B63] font-bold uppercase tracking-wider">
            {project.category}
          </span>
          {project.year && (
            <>
              <span>&middot;</span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Calendar size={13} />
                <span>{project.year}</span>
              </span>
            </>
          )}
          {project.client && (
            <>
              <span>&middot;</span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <User size={13} />
                <span>{project.client}</span>
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-serif">
          {project.title}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl font-sans leading-relaxed max-w-3xl">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <span>View Live Case Study</span>
              <ExternalLink size={13} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-white dark:bg-[#111622] hover:bg-slate-100 dark:hover:bg-[#1A2234] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <GitBranch size={13} className="text-[#9E6B24] dark:text-[#C59B63]" />
              <span>Repository / Source</span>
            </a>
          )}
          <Link
            to={`/contact?service=${encodeURIComponent(project.category)}`}
            className="px-5 py-2.5 bg-white dark:bg-[#111622] hover:bg-slate-100 dark:hover:bg-[#1A2234] border border-[#C59B63]/40 text-[#9E6B24] dark:text-[#C59B63] text-xs font-semibold rounded-lg transition-all"
          >
            Request Similar Project
          </Link>
        </div>
      </header>

      <div className="mb-8">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111622] shadow-xl">
          <img
            src={activeImage || project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {galleryImages.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                  activeImage === img
                    ? 'border-[#C59B63] ring-2 ring-[#C59B63]/40'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl mb-12 shadow-sm dark:shadow-none">
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">CLIENT</div>
          <div className="font-sans text-sm font-semibold text-slate-900 dark:text-white">{project.client || 'Selected Work'}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">YEAR</div>
          <div className="font-sans text-sm font-semibold text-slate-900 dark:text-white">{project.year || '2025'}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">DISCIPLINE</div>
          <div className="font-sans text-sm font-semibold text-[#9E6B24] dark:text-[#C59B63]">{project.category}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">STATUS</div>
          <div className="font-sans text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Delivered
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif mb-4">
              Project Overview &amp; Objective
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
              {project.detailedDescription || project.description}
            </p>
          </div>

          {project.architectureNotes && project.architectureNotes.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif mb-4">
                Creative Direction &amp; Specifications
              </h3>
              <ul className="space-y-3">
                {project.architectureNotes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-[#9E6B24] dark:text-[#C59B63] mt-0.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {project.tools && project.tools.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
              <div className="font-mono text-xs uppercase tracking-wider text-[#9E6B24] dark:text-[#C59B63] font-bold mb-3 flex items-center gap-2">
                <Layers size={14} />
                <span>Tools &amp; Software</span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.tools.join(' · ')}
              </p>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3 flex items-center gap-2">
                <Tag size={14} />
                <span>Scope &amp; Focus</span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                {project.tags.join(' · ')}
              </p>
            </div>
          )}

          <div className="p-6 bg-white dark:bg-[#111622] border border-[#C59B63]/40 rounded-xl text-center shadow-sm dark:shadow-none">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-sans">
              Need Something Similar?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-4">
              I collaborate on brand identities, social media design systems, and publication layouts.
            </p>
            <Link
              to={`/contact?service=${encodeURIComponent(project.category)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] text-xs font-bold rounded-lg transition-all"
            >
              <span>Inquire About This Work</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {nextProject && nextProject.slug !== project.slug && (
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            NEXT CASE STUDY
          </span>
          <Link to={`/projects/${nextProject.slug}`} className="group flex items-center gap-3 text-right">
            <div>
              <div className="font-mono text-[10px] text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-wider">
                {nextProject.category}
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors font-sans">
                {nextProject.title}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 group-hover:border-[#C59B63] flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-[#C59B63] transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
