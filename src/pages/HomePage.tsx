import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { 
  getProjects, 
  getSiteSettings, 
  getArticles, 
  getServices,
  subscribeToSiteSettings,
  subscribeToProjects,
  subscribeToArticles,
  subscribeToServices,
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

export const HomePage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch to ensure instant display
    Promise.all([getSiteSettings(), getProjects(), getArticles(), getServices()])
      .then(([loadedSettings, loadedProjects, loadedArticles, loadedServices]) => {
        setSettings(loadedSettings);
        setProjects(loadedProjects.filter(p => p.visibility !== 'draft'));
        setArticles(loadedArticles.filter(a => a.published));
        setServices(loadedServices);
      })
      .catch((err) => console.warn("Initial homepage data fetch:", err))
      .finally(() => setLoading(false));

    // Real-time synchronization
    const unsubSettings = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
      if (newSettings.services && newSettings.services.length > 0) {
        setServices(newSettings.services);
      }
    });

    const unsubProjects = subscribeToProjects((newProjects) => {
      setProjects(newProjects.filter(p => p.visibility !== 'draft'));
    });

    const unsubArticles = subscribeToArticles((newArticles) => {
      setArticles(newArticles.filter(a => a.published));
    });

    return () => {
      unsubSettings();
      unsubProjects();
      unsubArticles();
    };
  }, []);

  const featuredProjects = projects.filter(p => p.featured).slice(0, 4);
  const recentArticles = articles.slice(0, 3);
  const coreServices = services.slice(0, 4);

  return (
    <div className="min-h-screen font-sans">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-7">
            {/* Availability pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-800 bg-[#111622]/80 text-xs text-slate-300 shadow-sm font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>{settings.statusText || 'Available for freelance commissions & retainers'}</span>
            </div>

            {/* Large Headline with staggered text reveal animation */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C59B63] font-mono font-semibold block">
                DIGITAL ARCHIVE &bull; VOL. 2026
              </span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="editorial-hero-title font-bold tracking-tight text-white font-sans"
              >
                <span className="inline-block bg-gradient-to-r from-white via-slate-100 to-[#C59B63] bg-clip-text text-transparent">
                  Ash Wickramasinghe
                </span>
              </motion.h1>
            </div>

            {/* Subtitle / Focus with entrance reveal */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-slate-300 font-light tracking-tight max-w-2xl leading-relaxed"
            >
              Graphic Designer, Social Media Strategist &amp; Creative Content Editor. 
              Crafting minimal brand identities, high-conversion visual carousels, and editorial publications.
            </motion.p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-mono uppercase tracking-widest font-semibold rounded-full bg-gradient-to-r from-[#C59B63] to-[#E5C392] text-[#0A0D14] hover:opacity-95 transition-all shadow-[0_0_20px_rgba(197,155,99,0.3)] hover:shadow-[0_0_25px_rgba(197,155,99,0.5)]"
              >
                <span>Explore Selected Works</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-mono uppercase tracking-widest font-medium rounded-full border border-slate-700/80 text-slate-200 hover:bg-slate-800/60 hover:border-[#C59B63]/60 transition-all"
              >
                <span>Let's Work Together</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Prominent Cyber Portrait in Hero */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <ProfilePhotoFrame
                src={settings.avatarUrl || '/ash_cyber_portrait.jpg'}
                statusText={settings.statusText}
              />
            </div>
          </div>
        </div>

        {/* Subtle metrics counter strip */}
        {settings.metrics && settings.metrics.length > 0 && (
          <div className="mt-20 pt-10 border-t border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-8">
            {settings.metrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-sans">
                  {metric.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  {metric.label}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {metric.subtext}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. FEATURED PROJECTS SHOWCASE */}
      <section className="py-20 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal direction="up" distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                Selected Portfolio
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                Featured Works
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
            >
              <span>View All Projects ({projects.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Projects Grid */}
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
                  {/* Image Canvas with smooth loading */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
                    <ImageWithLoading
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors pointer-events-none" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-sm text-[11px] font-medium tracking-wider uppercase text-neutral-200 z-20 pointer-events-none">
                      {project.category}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-white group-hover:border-neutral-400 transition-colors">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* 3. CORE SERVICES & DISCIPLINES */}
      <section className="py-20 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal direction="up" distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                Capabilities
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                Services &amp; Disciplines
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
            >
              <span>Explore All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreServices.map((service, index) => (
            <ScrollReveal key={service.id} delay={index * 0.08} direction="up" distance={24}>
              <div
                className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white flex flex-col justify-between space-y-6 hover:border-neutral-700 transition-colors h-full"
              >
                <div className="space-y-3">
                  {service.badge && (
                    <span className="text-[10px] tracking-widest font-mono uppercase text-accent font-semibold">
                      {service.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                    {service.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Key Deliverables
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                    {service.deliverables.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent" />
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

      {/* 4. EDITORIAL BIOGRAPHY & PHILOSOPHY */}
      <section className="py-20 border-t border-slate-800/60 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <ScrollReveal direction="left" distance={30}>
              {/* Cyber Philosophy Telemetry Card */}
              <div className="p-8 rounded-2xl bg-[#111622]/90 border border-slate-800 relative overflow-hidden space-y-6 shadow-2xl">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, rgba(197, 155, 99, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C59B63] shadow-[0_0_8px_rgba(197,155,99,0.8)]" />
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-widest font-semibold">
                      Core Philosophy
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C59B63] bg-[#C59B63]/10 px-2 py-0.5 rounded border border-[#C59B63]/30">
                    SYSTEM ACTIVE
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-[#0A0D14]/70 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] uppercase text-[#C59B63] tracking-wider font-bold">01 / Visual Restraint</div>
                    <div className="text-slate-400 text-xs">Eliminate extraneous decorative noise. Every pixel and margin serves purpose and intent.</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0D14]/70 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] uppercase text-[#C59B63] tracking-wider font-bold">02 / Mathematical Rhythm</div>
                    <div className="text-slate-400 text-xs">Strict typographic hierarchies, harmonic scales, and precise grid constraints.</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0D14]/70 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] uppercase text-[#C59B63] tracking-wider font-bold">03 / Archival Permanence</div>
                    <div className="text-slate-400 text-xs">Designs structured to endure beyond transient seasonal fads.</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Location: Sri Lanka</span>
                  <span>Reach: Worldwide</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-7 space-y-6">
            <ScrollReveal direction="right" distance={30}>
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C59B63] font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
                  Biography &amp; Philosophy
                </span>
                <h2 className="editorial-section-title font-semibold tracking-tight text-white">
                  Discipline, restraint, and visual clarity.
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-slate-300">
                  {settings.aboutBio || settings.bio}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 font-mono">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-full bg-white text-[#0A0D14] hover:bg-[#C59B63] hover:text-white transition-colors shadow-sm"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/cv"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-medium rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-[#C59B63] transition-colors"
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

      {/* 5. WRITING & ARTICLES PREVIEW */}
      {recentArticles.length > 0 && (
        <section className="py-20 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <ScrollReveal direction="up" distance={20}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
                  Publications &amp; Notes
                </span>
                <h2 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  Writing &amp; Perspectives
                </h2>
              </div>
              <Link
                to="/writing"
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
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
                        to={`/writing#${article.slug}`}
                        onClick={() => trackArticleView(article.id, article.title, article.category, readingTime.text)}
                        className="group flex flex-col justify-between p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white hover:border-[#C59B63]/40 transition-colors w-full"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs text-neutral-400">
                            <span className="text-accent uppercase tracking-wider text-[11px] font-medium">
                              {article.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-neutral-400">
                              <Clock size={11} className="text-[#C59B63]" />
                              {readingTime.text}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 group-hover:text-accent transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-3 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                          <span>By {article.author}</span>
                          <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-neutral-300">
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

      {/* 6. CLIENT TESTIMONIALS */}
      {settings.testimonials && settings.testimonials.length > 0 && (
        <section className="py-20 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-2 mb-12">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                Endorsements
              </span>
              <h2 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                Client Testimonials
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.testimonials.map((t, index) => (
              <ScrollReveal key={t.id} delay={index * 0.1} direction="up" distance={24}>
                <div
                  className="p-8 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/20 dark:bg-neutral-900/20 light:bg-white space-y-6 flex flex-col justify-between h-full"
                >
                  <p className="text-sm leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-700 italic">
                    "{t.content}"
                  </p>
                  <div className="pt-4 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
                    <div className="font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm">
                      {t.clientName}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* 7. CONTACT BANNER CTA */}
      <section className="py-24 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
        <ScrollReveal direction="up" distance={30}>
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              Inquiries &amp; Collaboration
            </span>
            <h2 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              Have a project in mind? Let's craft something timeless.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Currently booking brand identity systems, social media retainers, and editorial design projects.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-all shadow-md"
              >
                <span>Start a Conversation</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Project Detail Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
