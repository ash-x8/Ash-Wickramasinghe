import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';

export const CvPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn("Using fallback settings for CV:", err));

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-5xl mx-auto font-sans">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 print:hidden">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print CV</span>
          </button>
          {settings.cvUrl && (
            <a
              href={settings.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-opacity"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Printable CV Dossier Canvas */}
      <div className="p-8 sm:p-14 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white space-y-12 shadow-sm print:p-0 print:border-none print:bg-white print:text-black">
        {/* CV Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black">
              Ash Wickramasinghe
            </h1>
            <p className="text-sm uppercase tracking-widest text-accent font-medium">
              Graphic Designer &bull; Social Media Strategist &bull; Content Editor
            </p>
            <p className="text-xs text-neutral-400 print:text-neutral-600">
              {settings.location} &bull; {settings.email}
            </p>
          </div>

          <div className="text-xs text-neutral-400 space-y-1 text-left sm:text-right print:text-neutral-600">
            <div>Portfolio: ash-wickramasinghe.site</div>
            <div>GitHub: github.com/ash-wickramasinghe</div>
            <div>LinkedIn: linkedin.com/in/ash-wickramasinghe</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-accent font-semibold">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800">
            {settings.aboutBio || settings.bio}
          </p>
        </div>

        {/* Professional Experience */}
        <div className="space-y-6">
          <h2 className="text-xs uppercase tracking-widest text-accent font-semibold">
            Professional Experience
          </h2>

          <div className="space-y-8">
            {settings.timeline.filter(t => t.type === 'work').map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black">
                    {item.role}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 print:text-neutral-600">
                    {item.period}
                  </span>
                </div>
                <div className="text-xs text-accent font-medium">
                  {item.organization}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 print:bg-neutral-100 text-neutral-400 print:text-neutral-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Background */}
        <div className="space-y-6">
          <h2 className="text-xs uppercase tracking-widest text-accent font-semibold">
            Education &amp; Qualifications
          </h2>

          <div className="space-y-6">
            {settings.timeline.filter(t => t.type === 'education').map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900 print:text-black">
                    {item.role}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 print:text-neutral-600">
                    {item.period}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 print:text-neutral-600">
                  {item.organization}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 print:text-neutral-800 pt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Competencies & Software Matrix */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-accent font-semibold">
            Core Competencies &amp; Toolkit
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {settings.skills.map((skill, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-neutral-950/40 dark:bg-neutral-950/40 light:bg-neutral-50 print:bg-neutral-50 border border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 print:border-neutral-300 text-xs"
              >
                <div className="font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800 print:text-black">
                  {skill.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {skill.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
