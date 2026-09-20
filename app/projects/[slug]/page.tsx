import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, GitBranch, Sparkles, Layers, ShieldCheck, Tag } from 'lucide-react';
import { getProjectBySlugOrId } from '@/utils/firebase-service';
import { CyberCard } from '@/app/components/CyberCard';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlugOrId(slug);

  if (!project) {
    notFound();
  }

  const tags = project.tags || project.technologies || [];

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 font-sans">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#06B6D4] hover:underline"
        >
          <ArrowLeft size={14} />
          <span>RETURN TO PROJECT ARCHIVE</span>
        </Link>
      </div>

      {/* Project Card Header */}
      <CyberCard highlightHeader={`PROJECT // ${project.category.toUpperCase()}`} className="p-6 sm:p-10 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#070A10] border border-[#06B6D4]/30 text-xs font-mono text-[#06B6D4]">
            <Sparkles size={13} />
            <span>{project.category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-400 border-y border-slate-800/80 py-3">
            {project.client && (
              <div>
                <span className="text-slate-500 uppercase">CLIENT:</span>{' '}
                <strong className="text-white">{project.client}</strong>
              </div>
            )}
            {project.year && (
              <div>
                <span className="text-slate-500 uppercase">YEAR:</span>{' '}
                <strong className="text-white">{project.year}</strong>
              </div>
            )}
            <div>
              <span className="text-slate-500 uppercase">CATEGORY:</span>{' '}
              <strong className="text-[#06B6D4]">{project.category}</strong>
            </div>
          </div>
        </div>

        {/* Poster Cover Image */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-[#070A10]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gallery Images if available */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#06B6D4] tracking-wider">
              PROJECT GALLERY &amp; VISUAL ASSETS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.gallery.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-[#070A10]">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview Narrative */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white font-sans border-b border-slate-800 pb-2">
            Project Overview &amp; Execution
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap">
            {project.detailedDescription || project.description}
          </p>
        </div>

        {/* Architecture & Engineering Notes */}
        {project.architectureNotes && project.architectureNotes.length > 0 && (
          <div className="p-5 rounded-xl bg-[#070A10] border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono text-[#10B981] font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} />
              HIGHLIGHTS &amp; DESIGN NOTES
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {project.architectureNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#06B6D4]">&gt;</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags and Tools */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            TOOLS &amp; TECHNOLOGIES
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-[#070A10] border border-slate-800 text-[#06B6D4] font-mono text-xs rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap gap-4 font-mono text-xs">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2"
            >
              <span>LAUNCH DEPLOYMENT / LIVE LINK</span>
              <ExternalLink size={14} />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#111827] text-white hover:text-[#06B6D4] font-medium tracking-wider rounded-lg border border-slate-700 flex items-center gap-2"
            >
              <GitBranch size={14} />
              <span>SOURCE REPOSITORY</span>
            </a>
          )}
        </div>
      </CyberCard>
    </div>
  );
}
