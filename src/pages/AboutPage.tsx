import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { ProfilePhotoFrame } from '../components/ProfilePhotoFrame';
import { ScrollReveal } from '../components/ScrollReveal';
import { useSeo } from '../utils/useSeo';

export const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useSeo({
    title: 'About — Ash Wickramasinghe',
    description: 'Biography, creative philosophy, and multidisciplinary skills of Kushan A Wickramasinghe (Ash Wickramasinghe).',
    canonicalPath: '/about',
  });

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn('Using fallback settings for about page:', err));

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Design & Branding', 'Social & Growth', 'Content & Video', 'Web & Digital'];

  const filteredSkills = activeCategory === 'All'
    ? settings.skills
    : settings.skills.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-20">
        <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
          Biography &amp; Background
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
          About Ash Wickramasinghe
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-light">
          A graphic designer, social media strategist, and author working at the intersection of visual restraint and purposeful digital communication.
        </p>
      </div>

      {/* Main Narrative & Portrait Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 space-y-8"
        >
          <ProfilePhotoFrame
            src={settings.profileImage || settings.avatarUrl || ''}
            statusText={settings.statusText}
            effect={settings.profileImageEffect || 'grayscale'}
          />

          <div className="p-6 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/60 space-y-4 text-xs shadow-sm dark:shadow-none">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-slate-500 uppercase tracking-wider">Location</span>
              <span className="font-medium text-slate-900 dark:text-neutral-200">{settings.location}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-slate-500 uppercase tracking-wider">Discipline</span>
              <span className="font-medium text-slate-900 dark:text-neutral-200">Design &amp; Social Strategy</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-slate-500 uppercase tracking-wider">Inquiries</span>
              <span className="font-medium text-slate-900 dark:text-neutral-200 truncate ml-4">{settings.email}</span>
            </div>
            <div className="flex justify-between py-2 gap-4">
              <span className="text-slate-500 uppercase tracking-wider shrink-0">Availability</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400 text-right">
                {settings.statusText || 'Open for Select Projects'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-7 space-y-10">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-8">
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111622]/80 border border-slate-200 dark:border-neutral-800/80 shadow-sm space-y-3">
                <div className="text-[11px] font-mono tracking-widest text-[#9E6B24] dark:text-[#C59B63] uppercase font-bold">
                  01 &middot; Core Creative Thesis
                </div>
                <p className="text-base sm:text-lg text-slate-900 dark:text-white font-serif leading-relaxed italic">
                  &ldquo;{settings.aboutBio}&rdquo;
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-neutral-400">
                  <span className="text-[#9E6B24] dark:text-[#C59B63] font-bold">02 &middot;</span>
                  <span>Evolution &amp; Strategic Trajectory</span>
                  <span className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
                </div>
                <div className="text-sm sm:text-base text-slate-700 dark:text-neutral-300 leading-relaxed space-y-4 font-light">
                  <p>{settings.careerTrajectory}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-[#111622]/60 border border-slate-200 dark:border-neutral-800/60 shadow-sm dark:shadow-none">
                  <div className="text-[10px] font-mono text-[#9E6B24] dark:text-[#C59B63] uppercase">Focus 01</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Brand Identity</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1">Editorial systems &amp; visual guidelines</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#111622]/60 border border-slate-200 dark:border-neutral-800/60 shadow-sm dark:shadow-none">
                  <div className="text-[10px] font-mono text-[#9E6B24] dark:text-[#C59B63] uppercase">Focus 02</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Social Strategy</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1">High-retention carousels &amp; growth</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#111622]/60 border border-slate-200 dark:border-neutral-800/60 shadow-sm dark:shadow-none">
                  <div className="text-[10px] font-mono text-[#9E6B24] dark:text-[#C59B63] uppercase">Focus 03</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Content Editorial</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1">Publications &amp; creative writing</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={20} delay={0.1}>
            <div className="pt-8 border-t border-slate-200 dark:border-neutral-800 space-y-6">
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63]">
                <span className="font-bold">03 &middot;</span>
                <span>Guiding Design Principles</span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-neutral-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#111622]/60 space-y-2 shadow-sm dark:shadow-none">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#9E6B24] dark:text-[#C59B63] font-bold">
                    Principle 01
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Subtractive Clarity
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Removing non-essential elements until only the core message and visual elegance remain.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#111622]/60 space-y-2 shadow-sm dark:shadow-none">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#9E6B24] dark:text-[#C59B63] font-bold">
                    Principle 02
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Proportional Harmony
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Relying on disciplined grids, typography hierarchy, and deliberate optical balance.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/cv"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-semibold rounded-full bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-colors shadow-sm"
            >
              <span>Review Curriculum Vitae</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <span>Explore Selected Works</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <span>Initiate Collaboration</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Skills & Capabilities Matrix */}
      <section className="py-16 border-t border-slate-200 dark:border-neutral-800/60">
        <ScrollReveal direction="up" distance={20}>
          <div className="space-y-4 mb-10">
            <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
              Technical &amp; Creative Proficiency
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
              Skills &amp; Capabilities
            </h2>
          </div>
        </ScrollReveal>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-neutral-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-[#0A0D14] font-semibold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.04} direction="up" distance={15}>
              <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/60 space-y-3 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-neutral-200">
                    {skill.name}
                  </span>
                  <span className="text-[#9E6B24] dark:text-[#C59B63] font-mono text-[11px] font-semibold">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C59B63] transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  {skill.category}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {settings.timeline && settings.timeline.length > 0 && (
        <section className="py-16 border-t border-slate-200 dark:border-neutral-800/60">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-4 mb-12">
              <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                Trajectory
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                Experience &amp; Education
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {settings.timeline.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 0.08} direction="up" distance={20}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-8 border-b border-slate-200 dark:border-neutral-800/60">
                  <div className="md:col-span-3 text-xs uppercase tracking-wider font-mono text-[#9E6B24] dark:text-[#C59B63]">
                    {item.period}
                  </div>
                  <div className="md:col-span-9 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
                        {item.role}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-neutral-400">
                        {item.organization}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 pt-1">
                      {item.skills.join(' · ')}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
