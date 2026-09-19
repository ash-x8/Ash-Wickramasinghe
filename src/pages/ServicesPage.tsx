import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Layers, Sparkles } from 'lucide-react';
import { getServices, subscribeToServices } from '../lib/firebase';
import { ServiceItem } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((loaded) => {
        if (loaded && loaded.length > 0) {
          setServices(loaded);
        }
      })
      .catch((err) => console.warn("Using default services:", err))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToServices((newServices) => {
      if (newServices && newServices.length > 0) {
        setServices(newServices);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 mb-20">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Offerings &amp; Disciplines
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          Services &amp; Capabilities
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          Disciplined visual solutions tailored for brands, creators, and institutions seeking clarity, high conversion, and lasting prestige.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="p-8 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white flex flex-col justify-between space-y-8 hover:border-neutral-700 dark:hover:border-neutral-700 light:hover:border-neutral-300 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                {service.badge && (
                  <span className="text-[10px] uppercase tracking-widest font-mono text-accent font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
                    {service.badge}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                {service.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
              {/* Deliverables */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Scope &amp; Deliverables
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools & Stack */}
              {service.techStack && service.techStack.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Tools &amp; Software
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.techStack.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400 border border-neutral-800 dark:border-neutral-800 light:border-neutral-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Inquiry Button */}
              <div className="pt-2">
                <Link
                  to={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium uppercase tracking-wider rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-100 dark:hover:text-neutral-950 light:hover:bg-neutral-900 light:hover:text-white transition-all"
                >
                  <span>Inquire About {service.title}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Workflow Section */}
      <section className="py-16 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
        <div className="max-w-2xl space-y-4 mb-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            Process &amp; Cadence
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
            How We Collaborate
          </h2>
          <p className="text-sm text-neutral-400">
            A structured, transparent workflow ensuring creative alignment, rapid feedback cycles, and flawless final deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/20 space-y-3">
            <div className="text-xs font-mono text-accent font-semibold">PHASE 01</div>
            <div className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">Discovery &amp; Brief</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clarifying objectives, audience psychology, dimensional requirements, and stylistic tone of voice.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/20 space-y-3">
            <div className="text-xs font-mono text-accent font-semibold">PHASE 02</div>
            <div className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">Conceptual Direction</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Developing typographic scales, moodboards, and rough layout frameworks for early validation.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/20 space-y-3">
            <div className="text-xs font-mono text-accent font-semibold">PHASE 03</div>
            <div className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">Design Refinement</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Executing high-fidelity art, vector precision, color grading, and comprehensive slide variations.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/20 space-y-3">
            <div className="text-xs font-mono text-accent font-semibold">PHASE 04</div>
            <div className="text-base font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">Handover &amp; Assets</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Exporting organized master files, vector archives, print bleeds, and editable templates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
