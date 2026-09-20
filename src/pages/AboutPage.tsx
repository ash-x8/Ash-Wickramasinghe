import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, CheckCircle2, Download } from 'lucide-react';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { ImageWithLoading } from '../components/ImageWithLoading';
import { ProfilePhotoFrame } from '../components/ProfilePhotoFrame';

export const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch(err => console.warn("Using fallback settings for about page:", err));

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Design & Branding', 'Social & Growth', 'Content & Video', 'Web & Digital'];

  const filteredSkills = activeCategory === 'All'
    ? settings.skills
    : settings.skills.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      {/* Editorial Page Header */}
      <div className="max-w-3xl space-y-4 mb-20">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Biography &amp; Background
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          About Ash Wickramasinghe
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          A graphic designer, social media strategist, and creative content editor working at the intersection of aesthetic restraint and high-retention digital media.
        </p>
      </div>

      {/* Main Narrative & Portrait Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
        {/* Left: Portrait and Quick Facts */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 space-y-8"
        >
          <ProfilePhotoFrame
            src={settings.avatarUrl || '/ash_cyber_portrait.jpg'}
            statusText={settings.statusText}
          />

          <div className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-100">
              <span className="text-neutral-500 uppercase tracking-wider">Location</span>
              <span className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{settings.location}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-100">
              <span className="text-neutral-500 uppercase tracking-wider">Discipline</span>
              <span className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">Design &amp; Social Strategy</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-100">
              <span className="text-neutral-500 uppercase tracking-wider">Inquiries</span>
              <span className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{settings.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-neutral-500 uppercase tracking-wider">Availability</span>
              <span className="font-medium text-emerald-400">{settings.statusText || "Open for Select Projects"}</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Narrative Story */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-6 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed text-base sm:text-lg">
            <p>
              {settings.aboutBio}
            </p>
            <p>
              {settings.careerTrajectory}
            </p>
          </div>

          {/* Creative Principles */}
          <div className="pt-6 border-t border-neutral-800 dark:border-neutral-800 light:border-neutral-200 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-accent font-semibold">
              Guiding Principles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-neutral-800 dark:border-neutral-800 light:border-neutral-200 bg-neutral-900/20 dark:bg-neutral-900/20 light:bg-white space-y-2">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  01. Deliberate Restraint
                </div>
                <div className="text-sm font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  Subtractive Clarity
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                  Removing non-essential elements until only the core message and visual elegance remain.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-neutral-800 dark:border-neutral-800 light:border-neutral-200 bg-neutral-900/20 dark:bg-neutral-900/20 light:bg-white space-y-2">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  02. Typographic Gravity
                </div>
                <div className="text-sm font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  Mathematical Harmony
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                  Relying on precise baseline grids and thoughtful hierarchy rather than loud ornamentation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/cv"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-opacity"
            >
              <span>View Curriculum Vitae</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <span>Initiate Collaboration</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Skills & Capabilities Matrix */}
      <section className="py-16 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
        <div className="space-y-4 mb-10">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            Technical &amp; Creative Proficiency
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
            Skills &amp; Capabilities
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Bars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800">
                  {skill.name}
                </span>
                <span className="text-accent font-mono text-[11px]">
                  {skill.level}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                {skill.category}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career & Academic Timeline */}
      {settings.timeline && settings.timeline.length > 0 && (
        <section className="py-16 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
          <div className="space-y-4 mb-12">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              Trajectory
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              Experience &amp; Education
            </h2>
          </div>

          <div className="space-y-8">
            {settings.timeline.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-8 border-b border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200"
              >
                <div className="md:col-span-3 text-xs uppercase tracking-wider font-mono text-accent">
                  {item.period}
                </div>
                <div className="md:col-span-9 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-lg font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                      {item.role}
                    </h3>
                    <span className="text-xs text-neutral-400">
                      {item.organization}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
