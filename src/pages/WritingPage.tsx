import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, X, ChevronRight, ExternalLink } from 'lucide-react';
import { getArticles, subscribeToArticles, trackArticleView } from '../lib/firebase';
import { Article } from '../types';
import { defaultArticles } from '../data/defaultContent';
import { calculateReadingTime } from '../utils/readingTime';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { ReadingProgressBar } from '../components/ReadingProgressBar';
import { useSeo } from '../utils/useSeo';

export const WritingPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useSeo({
    title: 'Writing & Articles — Ash Wickramasinghe',
    description: 'Essays, creative reflections, and articles on visual design, social media content, and storytelling by Writer Ash & Writer Tizzy.',
    canonicalPath: '/writing',
  });

  useEffect(() => {
    getArticles()
      .then((loaded) => {
        const published = loaded.filter((a) => a.published);
        setArticles(published);
        if (location.hash) {
          const slug = location.hash.replace('#', '');
          const match = published.find((a) => a.slug === slug || a.id === slug);
          if (match) setSelectedArticle(match);
        }
      })
      .catch((err) => console.warn('Using default articles:', err))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToArticles((newArticles) => {
      const published = newArticles.filter((a) => a.published);
      setArticles(published);
      if (location.hash) {
        const slug = location.hash.replace('#', '');
        const match = published.find((a) => a.slug === slug || a.id === slug);
        if (match) setSelectedArticle(match);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.hash]);

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    const rt = calculateReadingTime(article.content, article.excerpt);
    trackArticleView(article.id, article.title, article.category, rt.text);
  };

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      <div className="max-w-3xl space-y-4 mb-16">
        <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold">
          Publications &amp; Notes
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
          Writing &amp; Perspectives
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-light">
          Observations on editorial design, creative writing, high-retention social content, and deliberate visual communication.
        </p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-slate-200 dark:border-neutral-800/80">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-[#0A0D14] font-semibold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <ContentSkeleton type="article" count={4} />
      ) : (
        <div className="space-y-8">
          {filteredArticles.map((article, idx) => {
            const readingInfo = calculateReadingTime(article.content, article.excerpt);
            const displayReadTime = readingInfo.text;

            return (
              <motion.article
                key={article.id}
                id={article.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.08, 0.4) }}
                whileHover={{ y: -5, transition: { duration: 0.22, ease: 'easeOut' } }}
                onClick={() => handleSelectArticle(article)}
                className="group cursor-pointer p-8 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 hover:border-[#C59B63]/60 shadow-sm dark:shadow-none transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-wider font-semibold text-[11px]">
                      {article.category}
                    </span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-400">
                      <User size={12} />
                      By {article.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                    <span>{article.publishedAt}</span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1 text-[#9E6B24] dark:text-[#C59B63]">
                      <Clock size={12} />
                      <span>{displayReadTime}</span>
                    </span>
                    <span className="hidden sm:inline text-slate-400 dark:text-neutral-500">
                      ({readingInfo.wordCount} words)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800/60 text-xs">
                  <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                    {article.tags.join(' · ')}
                  </p>

                  <Link
                    to={`/writing/${article.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-semibold text-slate-700 dark:text-neutral-300 group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] group-hover:translate-x-1 transition-all shrink-0 ml-4"
                  >
                    <span>Read Full Essay</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {selectedArticle && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/65 dark:bg-neutral-950/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950/60">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 font-mono">
                <span className="text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-widest font-semibold">
                  {selectedArticle.category}
                </span>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1 text-[#9E6B24] dark:text-[#C59B63]">
                  <Clock size={12} />
                  <span>{calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).text}</span>
                </span>
                <span>&middot;</span>
                <span>{calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).wordCount} words</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/writing/${selectedArticle.slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#9E6B24] dark:text-[#C59B63] hover:underline"
                >
                  <span>Open Full Page</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="Close article"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <ReadingProgressBar
              containerRef={modalScrollRef}
              totalMinutes={calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).minutes}
              title={selectedArticle.title}
              showFloatingIndicator={false}
            />

            <div ref={modalScrollRef} className="p-6 sm:p-10 overflow-y-auto space-y-8">
              {selectedArticle.coverImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
                  {selectedArticle.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 pb-4 border-b border-slate-200 dark:border-neutral-800">
                  <span>Author: <strong className="text-slate-900 dark:text-neutral-200">{selectedArticle.author}</strong></span>
                  <span>&middot;</span>
                  <span>Date: {selectedArticle.publishedAt}</span>
                </div>
              </div>

              <div className="text-slate-700 dark:text-neutral-300 leading-relaxed space-y-6 text-sm sm:text-base whitespace-pre-line font-sans">
                {selectedArticle.content}
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-neutral-800">
                <p className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                  {selectedArticle.tags.join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
