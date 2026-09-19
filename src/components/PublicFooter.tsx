import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, Send } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-950 dark:bg-neutral-950 light:bg-white text-neutral-400 dark:text-neutral-400 light:text-neutral-600 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Identity column */}
          <div className="md:col-span-6 space-y-4">
            <div className="text-xl font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              Ash Wickramasinghe
            </div>
            <p className="text-sm leading-relaxed max-w-md text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Graphic designer, social media strategist, and creative content editor. 
              Designing editorial brand systems, high-retention social content, and disciplined visual collateral for discerning clients worldwide.
            </p>
            <div className="pt-2 text-xs uppercase tracking-widest text-neutral-500">
              Colombo, Sri Lanka &bull; Available Worldwide
            </div>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-200 dark:text-neutral-200 light:text-neutral-800">
              Navigation
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  About &amp; Biography
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Selected Works
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Services &amp; Offerings
                </Link>
              </li>
              <li>
                <Link to="/writing" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Writing &amp; Articles
                </Link>
              </li>
              <li>
                <Link to="/cv" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Curriculum Vitae (CV)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors">
                  Contact &amp; Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-200 dark:text-neutral-200 light:text-neutral-800">
              Connect
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a 
                  href="mailto:kushanashvika216@gmail.com" 
                  className="inline-flex items-center gap-1.5 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
                >
                  <span>Email</span>
                  <ArrowUpRight size={13} className="text-neutral-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://linkedin.com/in/ash-wickramasinghe" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight size={13} className="text-neutral-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ash-wickramasinghe" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
                >
                  <span>GitHub</span>
                  <ArrowUpRight size={13} className="text-neutral-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/ash_wickramasinghe" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
                >
                  <span>Telegram</span>
                  <ArrowUpRight size={13} className="text-neutral-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/ash_wickramasinghe" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 hover:text-white dark:hover:text-white light:hover:text-neutral-950 transition-colors"
                >
                  <span>Instagram</span>
                  <ArrowUpRight size={13} className="text-neutral-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-900 dark:border-neutral-900 light:border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {currentYear} Ash Wickramasinghe. All rights reserved.
          </div>
          <div>
            Design &bull; Strategy &bull; Editorial Content
          </div>
        </div>
      </div>
    </footer>
  );
};
