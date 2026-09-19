import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Share2,
  Check,
  Eye
} from 'lucide-react';
import { getProjectBySlug, getProjects } from '../lib/firebase';
import { Project } from '../types';
import { defaultProjects } from '../data/defaultContent';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const found = await getProjectBySlug(slug);
        if (found) {
          setProject(found);
          setActiveImage(found.image);
        } else {
          const fallback = defaultProjects.find(p => p.slug === slug || p.id === slug);
          setProject(fallback || null);
          if (fallback) setActiveImage(fallback.image);
        }

        const list = await getProjects();
        setAllProjects(list.length > 0 ? list : defaultProjects);
      } catch (e) {
        console.warn("Could not load project:", e);
        const fallback = defaultProjects.find(p => p.slug === slug || p.id === slug);
        setProject(fallback || null);
        if (fallback) setActiveImage(fallback.image);
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
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#C59B63] animate-ping" />
          <span>LOADING CASE STUDY...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center font-mono">
        <Layers size={48} className="mx-auto text-slate-600 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The requested project record could not be located in the current showcase.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111622] border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Return to Projects Catalog</span>
        </Link>
      </div>
    );
  }

  // Next project finder
  const currentIndex = allProjects.findIndex(p => p.slug === project.slug || p.id === project.id);
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 
    ? allProjects[currentIndex + 1] 
    : allProjects[0];

  const galleryImages = project.gallery && project.gallery.length > 0 
    ? project.gallery 
    : [project.image];

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans relative z-10">
      {/* Top Navigation & Share */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-[#C59B63] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ALL PROJECTS</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111622] hover:bg-[#1A2234] border border-slate-800 rounded text-slate-300 font-mono text-xs transition-colors"
          title="Share Case Study"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#10B981]" />
              <span className="text-[#10B981]">Copied Link!</span>
            </>
          ) : (
            <>
              <Share2 size={13} className="text-[#C59B63]" />
              <span>Share Case Study</span>
            </>
          )}
        </button>
      </div>

      {/* Case Study Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-mono text-xs mb-4">
          <span className="px-2.5 py-0.5 rounded bg-[#111622] border border-[#C59B63]/30 text-[#C59B63] font-bold uppercase tracking-wider">
            {project.category}
          </span>
          {project.year && (
            <>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar size={13} />
                <span>{project.year}</span>
              </span>
            </>
          )}
          {project.client && (
            <>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <User size={13} />
                <span>{project.client}</span>
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 font-serif">
          {project.title}
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl font-sans leading-relaxed max-w-3xl">
          {project.description}
        </p>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(197,155,99,0.2)]"
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
              className="px-5 py-2.5 bg-[#111622] hover:bg-[#1A2234] border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <GitBranch size={13} className="text-[#C59B63]" />
              <span>Repository / Source</span>
            </a>
          )}
          <Link
            to={`/contact?project=${encodeURIComponent(project.title)}`}
            className="px-5 py-2.5 bg-[#111622] hover:bg-[#1A2234] border border-[#C59B63]/30 text-[#C59B63] hover:text-white font-mono text-xs font-semibold rounded-lg transition-all"
          >
            Request Similar Project
          </Link>
        </div>
      </header>

      {/* Main Image Showcase */}
      <div className="mb-8">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 bg-[#111622] shadow-2xl">
          <img
            src={activeImage || project.image}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Gallery Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border transition-all ${
                  activeImage === img
                    ? 'border-[#C59B63] ring-2 ring-[#C59B63]/40'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Project Meta Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#0D111A] border border-slate-800 rounded-xl mb-12">
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">CLIENT</div>
          <div className="font-sans text-sm font-semibold text-white">{project.client || 'Confidential Client'}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">YEAR</div>
          <div className="font-sans text-sm font-semibold text-white">{project.year || '2024'}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">DISCIPLINE</div>
          <div className="font-sans text-sm font-semibold text-[#C59B63]">{project.category}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">STATUS</div>
          <div className="font-sans text-sm font-semibold text-[#10B981] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Delivered &amp; Active</span>
          </div>
        </div>
      </div>

      {/* Detailed Narrative & Case Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-serif mb-4">
              Project Overview &amp; Objective
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              {project.detailedDescription || project.description}
            </p>
          </div>

          {project.architectureNotes && project.architectureNotes.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xl font-bold text-white font-serif mb-4">
                Creative Direction &amp; Specifications
              </h3>
              <ul className="space-y-3">
                {project.architectureNotes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-[#C59B63] mt-0.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar Column: Tools & Tags */}
        <div className="space-y-6">
          {project.tools && project.tools.length > 0 && (
            <div className="p-6 bg-[#0D111A] border border-slate-800 rounded-xl">
              <div className="font-mono text-xs uppercase tracking-wider text-[#C59B63] font-bold mb-3 flex items-center gap-2">
                <Layers size={14} />
                <span>Tools &amp; Software</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 bg-[#111622] border border-slate-800 rounded font-mono text-xs text-slate-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="p-6 bg-[#0D111A] border border-slate-800 rounded-xl">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                <Tag size={14} />
                <span>Scope &amp; Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-0.5 bg-[#111622] border border-slate-800/80 rounded font-mono text-[11px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-gradient-to-b from-[#111622] to-[#0D111A] border border-[#C59B63]/30 rounded-xl text-center">
            <h4 className="text-base font-bold text-white mb-2 font-sans">
              Need Something Similar?
            </h4>
            <p className="text-slate-400 text-xs mb-4">
              I can collaborate on your brand identity, social system, or layout publication.
            </p>
            <Link
              to={`/contact?service=${encodeURIComponent(project.category)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] font-mono text-xs font-bold rounded-lg transition-all"
            >
              <span>Inquire About This Work</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Next Project Footer */}
      {nextProject && nextProject.slug !== project.slug && (
        <div className="pt-12 border-t border-slate-800 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            NEXT CASE STUDY
          </span>
          <Link
            to={`/projects/${nextProject.slug}`}
            className="group flex items-center gap-3 text-right"
          >
            <div>
              <div className="font-mono text-[10px] text-[#C59B63] uppercase tracking-wider">
                {nextProject.category}
              </div>
              <div className="text-base sm:text-lg font-bold text-white group-hover:text-[#C59B63] transition-colors font-sans">
                {nextProject.title}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#111622] border border-slate-800 group-hover:border-[#C59B63] flex items-center justify-center text-slate-400 group-hover:text-[#C59B63] transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
