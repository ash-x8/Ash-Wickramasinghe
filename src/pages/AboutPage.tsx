import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, CheckCircle2, Download } from 'lucide-react';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { ImageWithLoading } from '../components/ImageWithLoading';
import { ProfilePhotoFrame } from '../components/ProfilePhotoFrame';
import { ScrollReveal } from '../components/ScrollReveal';

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
            src={settings.profileImage || settings.avatarUrl || ''}
            statusText={settings.statusText}
            effect={settings.profileImageEffect || 'grayscale'}
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

        {/* Right: Structured Editorial Story */}
        <div className="lg:col-span-7 space-y-10">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-8">
              
              {/* Executive Overview Highlight */}
              <div className="p-6 sm:p-7 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 border-l-4 border-l-[#C59B63] shadow-lg shadow-black/40 space-y-3">
                <div className="text-[11px] font-mono tracking-widest text-[#C59B63] uppercase font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
                  <span>01 // Core Creative Thesis</span>
                </div>
                <p className="text-base sm:text-lg text-white font-serif leading-relaxed italic">
                  "{settings.aboutBio}"
                </p>
              </div>

              {/* Trajectory & Philosophy Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-neutral-400">
                  <span className="text-[#C59B63] font-bold">02 //</span>
                  <span>Evolution &amp; Strategic Trajectory</span>
                  <span className="flex-1 h-px bg-neutral-800" />
                </div>
                <div className="text-sm sm:text-base text-neutral-300 leading-relaxed space-y-4 font-light">
                  <p>
                    {settings.careerTrajectory}
                  </p>
                </div>
              </div>

              {/* Focus Pillars Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                  <div className="text-[10px] font-mono text-[#C59B63] uppercase">Focus 01</div>
                  <div className="text-xs font-semibold text-white mt-0.5">Brand Identity</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Editorial systems &amp; visual guidelines</div>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                  <div className="text-[10px] font-mono text-[#C59B63] uppercase">Focus 02</div>
                  <div className="text-xs font-semibold text-white mt-0.5">Social Strategy</div>
                  <div className="text-[11px] text-neutral-400 mt-1">High-retention carousels &amp; growth</div>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono text-[#C59B63] uppercase">Focus 03</div>
                  <div className="text-xs font-semibold text-white mt-0.5">Content Editorial</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Thumbnails &amp; publication layout</div>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* Creative Principles */}
          <ScrollReveal direction="up" distance={20} delay={0.1}>
            <div className="pt-8 border-t border-neutral-800 space-y-6">
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#C59B63]">
                <span className="font-bold">03 //</span>
                <span>Guiding Design Principles</span>
                <span className="flex-1 h-px bg-neutral-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#C59B63] font-bold">
                    Principle 01
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Subtractive Clarity
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Removing non-essential elements until only the core message and visual elegance remain.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#C59B63] font-bold">
                    Principle 02
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Mathematical Harmony
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Relying on precise baseline grids, typography hierarchy, and deliberate optical balance.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/cv"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest font-semibold rounded-full bg-[#C59B63] text-black hover:bg-[#b08852] transition-colors shadow-lg"
            >
              <span>Review Curriculum Vitae</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest font-medium rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              <span>Explore Selected Works</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest font-medium rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <span>Initiate Collaboration</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Skills & Capabilities Matrix */}
      <section className="py-16 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
        <ScrollReveal direction="up" distance={20}>
          <div className="space-y-4 mb-10">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              Technical &amp; Creative Proficiency
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              Skills &amp; Capabilities
            </h2>
          </div>
        </ScrollReveal>

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
            <ScrollReveal key={idx} delay={idx * 0.05} direction="up" distance={15}>
              <div
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
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Career & Academic Timeline */}
      {settings.timeline && settings.timeline.length > 0 && (
        <section className="py-16 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
          <ScrollReveal direction="up" distance={20}>
            <div className="space-y-4 mb-12">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                Trajectory
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                Experience &amp; Education
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {settings.timeline.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 0.08} direction="up" distance={20}>
                <div
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
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
