'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  Megaphone,
  FileText,
  Layers,
  Code2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Film
} from 'lucide-react';
import { CyberCard } from '@/app/components/CyberCard';
import { getServices } from '@/utils/firebase-service';
import type { ServiceItem } from '@/lib/types';
import { defaultServices } from '@/lib/defaultContent';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await getServices();
        if (loaded && loaded.length > 0) {
          setServices(loaded);
        }
      } catch (err) {
        console.warn("Using default services fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category || 'General')))];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => (s.category || 'General') === selectedCategory);

  const getServiceIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('social') || lower.includes('media')) return <Megaphone className="text-[#10B981]" size={24} />;
    if (lower.includes('writing') || lower.includes('content')) return <FileText className="text-[#3B82F6]" size={24} />;
    if (lower.includes('photo') || lower.includes('editing')) return <Film className="text-[#A855F7]" size={24} />;
    if (lower.includes('web') || lower.includes('digital')) return <Code2 className="text-[#06B6D4]" size={24} />;
    return <Palette className="text-[#06B6D4]" size={24} />;
  };

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      {/* PAGE HEADER */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#06B6D4]/30 text-xs font-mono text-[#06B6D4] mb-4">
          <Sparkles size={14} />
          <span>CAPABILITIES &amp; SPECIALIZATIONS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Creative <span className="text-[#06B6D4]">Services &amp; Offerings</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-mono">
          High-impact graphic design, strategic social media management, content video editing, and modern web presences.
        </p>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap gap-2 mb-10 font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedCategory === cat
                ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#06B6D4] font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SERVICES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-[#111827]/50 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredServices.map((service) => (
            <CyberCard
              key={service.id}
              highlightHeader={service.category || 'CREATIVE_SERVICE'}
              className="p-6 flex flex-col justify-between space-y-6 hover:border-[#06B6D4]/50 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#070A10] border border-slate-800 rounded-xl">
                    {getServiceIcon(service.title)}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {service.title}
                  </h3>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#070A10] border border-slate-800 text-slate-300 font-mono text-[11px] rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="w-full py-2.5 bg-[#111827] hover:bg-[#06B6D4] hover:text-[#070A10] text-slate-200 font-mono text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700 hover:border-[#06B6D4] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>REQUEST SERVICE</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CyberCard>
          ))}
        </div>
      )}

      {/* CTA SECTION */}
      <CyberCard glowColor="cyan" highlightHeader="CUSTOM_COMMISSION" className="p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Have a unique creative project in mind?
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          From full multi-channel brand rollouts to specialized content editing or bespoke web experiences, let&apos;s build something exceptional.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <span>INITIATE INQUIRY</span>
          <ArrowRight size={16} />
        </Link>
      </CyberCard>
    </div>
  );
}
