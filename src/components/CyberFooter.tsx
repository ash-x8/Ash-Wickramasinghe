import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, GitBranch, Send, Mail, ArrowUpRight } from 'lucide-react';

export const CyberFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // The admin dashboard is completely separated from the public website
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#080B12] border-t border-slate-800/80 text-slate-400 font-mono text-xs relative overflow-hidden">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C59B63]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: System Ident */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wider font-sans">
              <span className="w-2 h-2 bg-[#C59B63] rounded-full animate-pulse" />
              Ash Wickramasinghe
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
              Graphic Designer • Social Media Manager • Author. Creating purposeful visual designs, high-retention digital content, and meaningful creative writing.
            </p>
            <p className="text-[11px] text-[#C59B63] italic font-serif">
              &ldquo;Design with purpose. Create with intention. Write with meaning.&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 bg-[#111622] border border-slate-800 rounded-md text-[#C59B63]">
                Graphic Design
              </span>
              <span className="px-2.5 py-1 bg-[#111622] border border-slate-800 rounded-md text-[#EDEDED]">
                Social Media Management
              </span>
              <span className="px-2.5 py-1 bg-[#111622] border border-slate-800 rounded-md text-slate-400">
                Author &amp; Creative Writing
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#C59B63]">
              Navigation
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> About &amp; Profile
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Services
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Featured Projects
                </Link>
              </li>
              <li>
                <Link to="/writing" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Writing &amp; Articles
                </Link>
              </li>
              <li>
                <Link to="/cv" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5 text-[#C59B63]">
                  <span className="text-slate-600">&gt;</span> View CV / Resume
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C59B63] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Coordinates */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#C59B63]">
              Connect &amp; Social
            </div>
            <div className="flex flex-col space-y-2 text-[11px]">
              <a 
                href="https://www.linkedin.com/in/kushan-a-wickramasinghe-28b1aa2a0" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#C59B63] transition-colors"
              >
                <Globe size={14} className="text-[#C59B63]" />
                LinkedIn (Kushan A Wickramasinghe)
              </a>
              <a 
                href="https://t.me/kawickramasinghe" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#C59B63] transition-colors"
              >
                <Send size={14} className="text-[#C59B63]" />
                Telegram (@kawickramasinghe)
              </a>
              <a 
                href="https://wa.me/94752269410" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#C59B63] transition-colors"
              >
                <Globe size={14} className="text-[#C59B63]" />
                WhatsApp (+94 75 226 9410)
              </a>
              <a 
                href="mailto:Kushanashvika216@gmail.com" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#C59B63] transition-colors"
              >
                <Mail size={14} className="text-[#C59B63]" />
                Kushanashvika216@gmail.com
              </a>
              <a 
                href="https://www.youtube.com/@Ash-x8" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#C59B63] transition-colors"
              >
                <ArrowUpRight size={14} className="text-[#C59B63]" />
                YouTube Channel
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {currentYear} Ash Wickramasinghe (Kushan A Wickramasinghe). All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sri Lanka &bull; Remote &bull; Available Worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
