import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Share2,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { getArticleBySlug, getArticles, trackArticleView } from '../lib/firebase';
import { Article } from '../types';
import { defaultArticles } from '../data/defaultContent';
import { calculateReadingTime } from '../utils/readingTime';
import { ReadingProgressBar } from '../components/ReadingProgressBar';
import { useSeo } from '../utils/useSeo';

export const WritingDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: article ? `${article.title} — Ash Wickramasinghe` : 'Article — Ash Wickramasinghe',
    description: article?.excerpt || 'Essay and creative perspective by Ash Wickramasinghe.',
    canonicalPath: slug ? `/writing/${slug}` : '/writing',
    type: 'article',
  });

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const found = await getArticleBySlug(slug);
        const resolved = found || defaultArticles.find((a) => a.slug === slug || a.id === slug) || null;
        setArticle(resolved);

        if (resolved) {
          const rt = calculateReadingTime(resolved.content, resolved.excerpt);
          trackArticleView(resolved.id, resolved.title, resolved.category, rt.text);
        }

        const all = await getArticles();
        const others = (all.length > 0 ? all : defaultArticles)
          .filter((a) => a.slug !== slug && a.id !== slug)
          .slice(0, 2);
        setRelatedArticles(others);
      } catch (e) {
        console.warn('Error fetching article:', e);
        const fallback = defaultArticles.find((a) => a.slug === slug || a.id === slug);
        setArticle(fallback || null);
        if (fallback) {
          const rt = calculateReadingTime(fallback.content, fallback.excerpt);
          trackArticleView(fallback.id, fallback.title, fallback.category, rt.text);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center font-mono text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full border-2 border-[#C59B63] border-t-transparent animate-spin" />
          <span>LOADING ARTICLE...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center">
        <BookOpen size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
          The requested essay or publication record could not be located in the current archive.
        </p>
        <Link
          to="/writing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111622] border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Return to Writing Archive</span>
        </Link>
      </div>
    );
  }

  const readingTimeInfo = calculateReadingTime(article.content, article.excerpt);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-sans relative z-10">
      <ReadingProgressBar
        totalMinutes={readingTimeInfo.minutes}
        title={article.title}
        showFloatingIndicator={true}
      />

      <div className="flex items-center justify-between mb-8">
        <Link
          to="/writing"
          className="inline-flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO WRITING ARCHIVE</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111622] hover:bg-slate-100 dark:hover:bg-[#1A2234] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors cursor-pointer"
          title="Copy Link to Clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600 dark:text-[#10B981]" />
              <span className="text-emerald-600 dark:text-[#10B981]">Copied</span>
            </>
          ) : (
            <>
              <Share2 size={13} className="text-[#9E6B24] dark:text-[#C59B63]" />
              <span>Share Article</span>
            </>
          )}
        </button>
      </div>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-mono text-xs mb-4">
          <span className="text-[#9E6B24] dark:text-[#C59B63] font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{article.publishedAt}</span>
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1.5 text-[#9E6B24] dark:text-[#C59B63] font-semibold">
            <Clock size={13} />
            <span>{readingTimeInfo.text}</span>
          </span>
          <span>&middot;</span>
          <span className="text-slate-500 dark:text-slate-400">
            {readingTimeInfo.wordCount} words
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-serif leading-tight">
          {article.title}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl font-sans leading-relaxed border-l-2 border-[#C59B63] pl-4 italic">
          {article.excerpt}
        </p>
      </header>

      {article.coverImage && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111622] group">
          <motion.img
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="max-w-none mb-16 text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-base sm:text-lg">
        {article.content.split('\n\n').map((paragraph, pIdx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-2xl font-bold text-slate-900 dark:text-white font-serif mt-10 mb-4 tracking-tight">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={pIdx} className="text-3xl font-bold font-serif mt-12 mb-6 tracking-tight text-[#9E6B24] dark:text-[#C59B63]">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('- ')) {
            const items = paragraph.split('\n').filter((i) => i.startsWith('- '));
            return (
              <ul key={pIdx} className="space-y-2 my-6 list-none pl-0">
                {items.map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-[#9E6B24] dark:text-[#C59B63] mt-0.5">&bull;</span>
                    <span>{it.replace('- ', '')}</span>
                  </li>
                ))}
              </ul>
            );
          }
          if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
            const items = paragraph.split('\n').filter(Boolean);
            return (
              <ol key={pIdx} className="space-y-3 my-6 list-none pl-0">
                {items.map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <span className="font-mono text-xs text-[#9E6B24] dark:text-[#C59B63] font-bold mt-1">
                      {String(itIdx + 1).padStart(2, '0')}.
                    </span>
                    <span>{it.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p key={pIdx} className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
              {paragraph}
            </p>
          );
        })}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <span className="font-mono text-xs text-slate-500 flex items-center gap-1.5 mr-2">
            <Tag size={13} />
            <span>TOPICS:</span>
          </span>
          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {article.tags.join(' · ')}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-center gap-6 shadow-sm dark:shadow-none">
        <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-[#0D111A] border border-[#C59B63]/40 flex items-center justify-center shrink-0 text-[#C59B63] font-bold text-xl font-serif">
          AW
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="font-mono text-xs text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-wider mb-1">
            ABOUT THE AUTHOR
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white font-sans mb-2">
            {article.author}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
            Graphic Designer, Social Media Strategist &amp; Author based in Sri Lanka. Designing brand identities and visual narratives with typographic integrity.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9E6B24] dark:text-[#C59B63] hover:underline font-semibold"
          >
            <span>Commission an Article or Campaign</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="pt-12 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif mb-6">
            Continue Reading
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.map((rel) => {
              const relRead = calculateReadingTime(rel.content, rel.excerpt);
              return (
                <motion.div key={rel.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                  <Link
                    to={`/writing/${rel.slug}`}
                    className="group p-5 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 hover:border-[#C59B63]/60 rounded-xl transition-all block h-full shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#9E6B24] dark:text-[#C59B63] uppercase tracking-wider mb-2">
                      <span>{rel.category}</span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock size={10} />
                        <span>{relRead.text}</span>
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors font-sans mb-2 line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
