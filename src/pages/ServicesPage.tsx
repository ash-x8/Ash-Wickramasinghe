import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getServices, subscribeToServices } from '../lib/firebase';
import { ServiceItem } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { useSeo } from '../utils/useSeo';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(defaultSiteSettings.services || []);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Services — Ash Wickramasinghe',
    description: 'Graphic design, social media post & carousel design, brand identity, posters, certificates, and creative content writing services.',
    canonicalPath: '/services',
  });

  useEffect(() => {
    getServices()
      .then((loaded) => {
        if (loaded && loaded.length > 0) {
          setServices(loaded);
        }
      })
      .catch((err) => console.warn('Using default services:', err))
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
      <div className="max-w-3xl space-y-4 mb-20">
        <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
          Offerings &amp; Disciplines
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
          Services &amp; Capabilities
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-light">
          Disciplined visual solutions tailored for brands, creators, and institutions seeking clarity, high engagement, and lasting polish.
        </p>
      </div>

      {loading ? (
        <ContentSkeleton type="service" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="p-8 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 flex flex-col justify-between space-y-8 hover:border-[#C59B63]/50 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 dark:text-neutral-500">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  {service.badge && (
                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#9E6B24] dark:text-[#C59B63] font-semibold">
                      {service.badge}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                  {service.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-neutral-800/60">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Scope &amp; Deliverables
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#9E6B24] dark:text-[#C59B63]">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.techStack && service.techStack.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Tools &amp; Software
                    </div>
                    <p className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                      {service.techStack.join(' · ')}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-full border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 hover:bg-[#C59B63] hover:text-[#0A0D14] hover:border-[#C59B63] transition-all"
                  >
                    <span>Inquire About {service.title}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Engagement Workflow */}
      <section className="py-16 border-t border-slate-200 dark:border-neutral-800/60">
        <div className="max-w-2xl space-y-4 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
            Process &amp; Cadence
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
            How We Collaborate
          </h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            A structured, transparent workflow ensuring creative alignment, rapid feedback cycles, and polished final deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { phase: 'PHASE 01', title: 'Discovery & Brief', desc: 'Clarifying objectives, target audience, dimensional formats, and visual tone of voice.' },
            { phase: 'PHASE 02', title: 'Conceptual Direction', desc: 'Developing typographic hierarchy, references, and layout structures for early validation.' },
            { phase: 'PHASE 03', title: 'Design Refinement', desc: 'Executing high-fidelity artwork, vector precision, color balance, and layout variations.' },
            { phase: 'PHASE 04', title: 'Handover & Assets', desc: 'Delivering organized master files, print-ready outputs, and digital social media packages.' },
          ].map((step) => (
            <div key={step.phase} className="p-6 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/50 space-y-3 shadow-sm dark:shadow-none">
              <div className="text-xs font-mono text-[#9E6B24] dark:text-[#C59B63] font-semibold">{step.phase}</div>
              <div className="text-base font-semibold text-slate-900 dark:text-neutral-100">{step.title}</div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
