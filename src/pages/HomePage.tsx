import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ChevronRight, Clock } from 'lucide-react';
import {
  getProjects,
  getSiteSettings,
  getArticles,
  getServices,
  subscribeToSiteSettings,
  subscribeToProjects,
  subscribeToArticles,
  trackProjectClick,
  trackArticleView
} from '../lib/firebase';
import { Project, SiteSettings, Article, ServiceItem } from '../types';
import { defaultSiteSettings, defaultProjects, defaultArticles } from '../data/defaultContent';
import { ProjectModal } from '../components/ProjectModal';
import { ImageWithLoading } from '../components/ImageWithLoading';
import { ProfilePhotoFrame } from '../components/ProfilePhotoFrame';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { calculateReadingTime } from '../utils/readingTime';
import { ScrollReveal } from '../components/ScrollReveal';
import { useSeo } from '../utils/useSeo';

export const HomePage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: settings.metaTitle || 'Ash Wickramasinghe — Graphic Designer, Social Media Manager & Author',
    description: settings.metaDescription || defaultSiteSettings.metaDescription,
    canonicalPath: '/',
  });

  useEffect(() => {
    Promise.all([getSiteSettings(), getProjects(), getArticles(), getServices()])
      .then(([loadedSettings, loadedProjects, loadedArticles, loadedServices]) => {
        setSettings(loadedSettings);
        setProjects(loadedProjects.filter((p) => p.visibility !== 'draft'));
        setArticles(loadedArticles.filter((a) => a.published));
        setServices(loadedServices);
      })
      .catch((err) => console.warn('Initial homepage data fetch:', err))
      .finally(() => setLoading(false));

    const unsubSettings = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
      if (newSettings.services && newSettings.services.length > 0) {
        setServices(newSettings.services);
      }
    });

    const unsubProjects = subscribeToProjects((newProjects) => {
      setProjects(newProjects.filter((p) => p.visibility !== 'draft'));
    });

    const unsubArticles = subscribeToArticles((newArticles) => {
      setArticles(newArticles.filter((a) => a.published));
    });

    return () => {
      unsubSettings();
      unsubProjects();
      unsubArticles();
    };
  }, []);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);
  const recentArticles = articles.slice(0, 3);
  const coreServices = services.slice(0, 4);

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-7">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              {settings.location || 'Sri Lanka'} &middot; {settings.statusText || 'Available for commissions & retainers'}
            </p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="editorial-hero-title font-bold tracking-tight text-slate-900 dark:text-white font-sans"
            >
              {settings.creativeName || 'Ash Wickramasinghe'}
            </motion.h1>

            <div className="space-y-4 max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-light tracking-tight leading-relaxed"
              >
                <span className="font-semibold text-slate-900 dark:text-white">Graphic Designer</span>,{' '}
                <span className="font-semibold text-slate-900 dark:text-white">Social Media Strategist</span> &amp;{' '}
                <span className="font-semibold text-slate-900 dark:text-white">Author</span>. Shaping refined visual identities, high-retention social assets, and deliberate editorial narratives.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wide"
              >
                Brand Systems &middot; Carousel Design &middot; Content Strategy &middot; Editorial Direction
              </motion.p>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] transition-all shadow-md"
              >
                <span>Explore Selected Works</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/cv"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest rounded-full border border-[#9E6B24]/50 dark:border-[#C59B63]/60 text-[#9E6B24] dark:text-[#C59B63] hover:bg-[#C59B63]/10 transition-all"
              >
                <span>Curriculum Vitae</span>
                <ArrowUpRight size={14} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-medium uppercase tracking-widest rounded-full border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white transition-all"
              >
                <span>Let&apos;s Collaborate</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <ProfilePhotoFrame
                src={settings.profileImage || settings.avatarUrl || ''}
                statusText={settings.statusText}
                effect={settings.profileImageEffect || 'grayscale'}
              />
            </div>
          </div>
        </div>

        {settings.metrics && settings.metrics.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200 dark:border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-8">
            {settings.metrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100 font-sans">
                  {metric.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-medium">
                  {metric.label}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                  {metric.subtext}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Projects */}
      <section className="py-20 border-t border-slate-200 dark:border-neutral-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal direction="up" distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Selected Portfolio
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                Featured Works
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <span>View All Projects ({projects.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <ContentSkeleton type="project" count={2} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.1} direction="up" distance={24}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={() => {
                    trackProjectClick(project.id, project.title, project.category);
                    setSelectedProject(project);
                  }}
                  className="group cursor-pointer space-y-4"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                    <ImageWithLoading
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-white/90 dark:bg-neutral-950/85 backdrop-blur-sm text-[11px] font-medium tracking-wider uppercase text-slate-900 dark:text-neutral-200 z-20 pointer-events-none">
                      {project.category}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-neutral-700 flex items-center justify-center shrink-0 text-slate-500 dark:text-neutral-400 group-hover:text-slate-950 dark:group-hover:text-white group-hover:border-[#C59B63] transition-colors">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                    {project.tags.slice(0, 3).join(' · ')}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Core Services & Disciplines */}
      <section className="py-20 border-t border-slate-200 dark:border-neutral-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal direction="up" distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Capabilities
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                Services &amp; Disciplines
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <span>Explore All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreServices.map((service, index) => (
            <ScrollReveal key={service.id} delay={index * 0.08} direction="up" distance={24}>
              <div className="p-6 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 flex flex-col justify-between space-y-6 hover:border-[#C59B63]/50 transition-colors h-full shadow-sm dark:shadow-none">
                <div className="space-y-3">
                  {service.badge && (
                    <span className="text-[10px] tracking-widest font-mono uppercase text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                      {service.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                    {service.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-neutral-400">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-neutral-800/60">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Key Deliverables
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                    {service.deliverables.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#9E6B24] dark:text-[#C59B63]">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Biography & Philosophy */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <ScrollReveal direction="left" distance={30}>
              <div className="p-8 rounded-2xl bg-white dark:bg-[#111622]/90 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm dark:shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest font-semibold">
                    Core Philosophy
                  </span>
                  <span className="font-mono text-[11px] text-[#9E6B24] dark:text-[#C59B63] font-medium">
                    Design Ethos
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-mono uppercase text-[#9E6B24] dark:text-[#C59B63] tracking-wider font-bold">
                      01 &middot; Visual Restraint
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Eliminate extraneous decorative noise. Every pixel and margin serves purpose and intent.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-mono uppercase text-[#9E6B24] dark:text-[#C59B63] tracking-wider font-bold">
                      02 &middot; Typographic Rhythm
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Clear hierarchy, harmonic proportions, and structured visual clarity across screens and print.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-mono uppercase text-[#9E6B24] dark:text-[#C59B63] tracking-wider font-bold">
                      03 &middot; Archival Permanence
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Visual systems and written works structured to endure beyond short-lived trends.
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Location: {settings.location || 'Sri Lanka'}</span>
                  <span>Reach: Worldwide</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-7 space-y-6">
            <ScrollReveal direction="right" distance={30}>
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#9E6B24] dark:text-[#C59B63] font-semibold block">
                  Biography &amp; Philosophy
                </span>
                <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-white">
                  Discipline, restraint, and visual clarity.
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  {settings.aboutBio || settings.bio}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#0A0D14] hover:bg-[#C59B63] hover:text-[#0A0D14] transition-colors shadow-sm"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/cv"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-medium rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-[#C59B63] transition-colors"
                  >
                    <span>Inspect CV / Resume</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Writing & Articles Preview */}
      {recentArticles.length > 0 && (
        <section className="py-20 border-t border-slate-200 dark:border-neutral-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <ScrollReveal direction="up" distance={20}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                  Publications &amp; Notes
                </span>
                <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                  Writing &amp; Perspectives
                </h2>
              </div>
              <Link
                to="/writing"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <span>All Articles ({articles.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

          {loading ? (
            <ContentSkeleton type="article" count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentArticles.map((article, index) => {
                const readingTime = calculateReadingTime(article.content, article.excerpt);
                return (
                  <ScrollReveal key={article.id} delay={index * 0.1} direction="up" distance={24}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="flex h-full"
                    >
                      <Link
                        to={`/writing/${article.slug}`}
                        onClick={() => trackArticleView(article.id, article.title, article.category, readingTime.text)}
                        className="group flex flex-col justify-between p-6 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 hover:border-[#C59B63]/50 transition-colors w-full shadow-sm dark:shadow-none"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
                            <span className="text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-wider text-[11px] font-semibold">
                              {article.category}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} className="text-[#9E6B24] dark:text-[#C59B63]" />
                              {readingTime.text}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-neutral-100 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-slate-500">
                          <span>By {article.author}</span>
                          <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-slate-700 dark:text-neutral-300 font-medium">
                            Read Article <ChevronRight size={13} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Client Testimonials */}
      {settings.testimonials && settings.testimonials.length > 0 && (
        <section className="py-20 border-t border-slate-200 dark:border-neutral-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-2 mb-12">
              <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Endorsements
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                Client Testimonials
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.testimonials.map((t, index) => (
              <ScrollReveal key={t.id} delay={index * 0.1} direction="up" distance={24}>
                <div className="p-8 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/50 space-y-6 flex flex-col justify-between h-full shadow-sm dark:shadow-none">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-neutral-300 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-slate-100 dark:border-neutral-800/60">
                    <div className="font-semibold text-slate-900 dark:text-neutral-100 text-sm">
                      {t.clientName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Contact Banner CTA */}
      <section className="py-24 border-t border-slate-200 dark:border-neutral-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
        <ScrollReveal direction="up" distance={30}>
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              Inquiries &amp; Collaboration
            </span>
            <h2 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
              Have a project in mind? Let&apos;s craft something timeless.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400">
              Currently booking brand identity systems, social media retainers, and editorial design projects.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-xs uppercase tracking-widest font-bold rounded-full bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] transition-all shadow-md"
              >
                <span>Start a Conversation</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
