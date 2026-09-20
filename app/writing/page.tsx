'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  Sparkles,
  Search,
  Tag
} from 'lucide-react';
import { CyberCard } from '@/app/components/CyberCard';
import { getArticles } from '@/utils/firebase-service';
import type { WritingArticle } from '@/lib/types';
import { defaultArticles } from '@/lib/defaultContent';

export default function WritingPage() {
  const [articles, setArticles] = useState<WritingArticle[]>(defaultArticles);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await getArticles();
        if (loaded && loaded.length > 0) {
          setArticles(loaded);
        }
      } catch (err) {
        console.warn("Using default articles fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category || 'Editorial')))];

  const filteredArticles = articles.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesQuery = searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery && article.published !== false;
  });

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans">
      {/* PAGE HEADER */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#06B6D4]/30 text-xs font-mono text-[#06B6D4] mb-4">
          <BookOpen size={14} />
          <span>EDITORIAL &amp; CREATIVE INSIGHTS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Writing &amp; <span className="text-[#06B6D4]">Creative Reflections</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-mono">
          Essays and technical retrospectives on design systems, visual pacing, short-form motion content, and brand architecture.
        </p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#06B6D4] font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-[#06B6D4] outline-none"
          />
        </div>
      </div>

      {/* ARTICLES LIST / EDITORIAL ESSAYS */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#111827]/50 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <CyberCard className="p-12 text-center text-slate-400 font-mono text-xs">
          NO MATCHING EDITORIAL ESSAYS FOUND.
        </CyberCard>
      ) : (
        <div className="space-y-8 mb-16">
          {filteredArticles.map((article) => (
            <article key={article.id}>
              <CyberCard
                highlightHeader={`ARTICLE // ${article.category.toUpperCase()}`}
                className="p-6 sm:p-8 space-y-5 hover:border-[#06B6D4]/50 transition-all"
              >
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3">
                  <span className="flex items-center gap-1.5 text-[#06B6D4]">
                    <User size={13} />
                    <strong className="text-white">{article.author}</strong>
                  </span>
                  <span className="text-slate-600">//</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {article.date}
                  </span>
                  <span className="text-slate-600">//</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {article.readTime}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {article.title}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                    {article.summary}
                  </p>
                </div>

                {/* Editorial Body Segment */}
                <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {article.content}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="px-2.5 py-1 rounded bg-[#070A10] border border-slate-800 text-[10px] font-mono text-slate-400">
                    {article.category}
                  </span>
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Inquiry regarding article: ${article.title}`)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#06B6D4] hover:underline"
                  >
                    <span>DISCUSS ESSAY</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </CyberCard>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
