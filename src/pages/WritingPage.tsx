import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowUpRight, X, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { getArticles, subscribeToArticles, trackArticleView } from '../lib/firebase';
import { Article } from '../types';
import { defaultArticles } from '../data/defaultContent';
import { calculateReadingTime } from '../utils/readingTime';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { ReadingProgressBar } from '../components/ReadingProgressBar';

export const WritingPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getArticles()
      .then((loaded) => {
        const published = loaded.filter(a => a.published);
        setArticles(published);
        if (location.hash) {
          const slug = location.hash.replace('#', '');
          const match = published.find(a => a.slug === slug || a.id === slug);
          if (match) setSelectedArticle(match);
        }
      })
      .catch((err) => console.warn("Using default articles:", err))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeToArticles((newArticles) => {
      const published = newArticles.filter(a => a.published);
      setArticles(published);
      if (location.hash) {
        const slug = location.hash.replace('#', '');
        const match = published.find(a => a.slug === slug || a.id === slug);
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

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-16">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Publications &amp; Notes
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          Writing &amp; Perspectives
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          Observations on editorial design, typographic restraint, high-retention social content, and visual communication.
        </p>
      </div>

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
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
      )}

      {/* Articles List */}
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
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              whileTap={{ scale: 0.995 }}
              onClick={() => handleSelectArticle(article)}
              className="group cursor-pointer p-8 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white hover:border-[#C59B63]/60 dark:hover:border-[#C59B63]/60 light:hover:border-[#C59B63]/60 hover:shadow-xl hover:shadow-[#C59B63]/5 transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                  <span className="text-accent uppercase tracking-wider font-semibold text-[11px]">
                    {article.category}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    By {article.author}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                  <span>{article.publishedAt}</span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 text-[#C59B63]">
                    <Clock size={12} />
                    <span>{displayReadTime}</span>
                  </span>
                  <span className="hidden sm:inline text-neutral-600">({readingInfo.wordCount} words)</span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 group-hover:text-accent transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/writing/${article.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-neutral-300 dark:text-neutral-300 light:text-neutral-800 group-hover:text-[#C59B63] group-hover:translate-x-1.5 transition-all"
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

      {/* Reading Modal / Full View */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-neutral-950/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="relative w-full max-w-3xl bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-neutral-200 rounded-2xl shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 bg-neutral-950/50">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <span className="text-accent uppercase tracking-widest font-semibold">{selectedArticle.category}</span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-[#C59B63]">
                  <Clock size={12} />
                  <span>{calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).text}</span>
                </span>
                <span>&bull;</span>
                <span className="text-neutral-500">
                  {calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).wordCount} words
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/writing/${selectedArticle.slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#C59B63] hover:underline"
                >
                  <span>Open Full Page</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  aria-label="Close article"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Reading Progress Bar for Modal */}
            <ReadingProgressBar 
              containerRef={modalScrollRef} 
              totalMinutes={calculateReadingTime(selectedArticle.content, selectedArticle.excerpt).minutes} 
              title={selectedArticle.title}
              showFloatingIndicator={false}
            />

            {/* Modal Body */}
            <div ref={modalScrollRef} className="p-6 sm:p-10 overflow-y-auto space-y-8">
              {selectedArticle.coverImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  {selectedArticle.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pb-4 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
                  <span>Author: <strong className="text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{selectedArticle.author}</strong></span>
                  <span>&bull;</span>
                  <span>Date: {selectedArticle.publishedAt}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed space-y-6 text-sm sm:text-base whitespace-pre-line font-serif sm:font-sans">
                {selectedArticle.content}
              </div>

              {/* Footer Tags */}
              <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
