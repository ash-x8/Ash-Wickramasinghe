import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, GitBranch, Send, Mail, ArrowUpRight, Heart } from 'lucide-react';

export const CyberFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080C14] border-t border-slate-800/80 text-slate-400 font-mono text-xs relative overflow-hidden">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06B6D4]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: System Ident */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wider font-sans">
              <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-ping" />
              Ash Wickramasinghe
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
              Senior Full-Stack Web Developer &amp; UI/UX Architect. Building responsive, high-performance web applications, scalable APIs, and clean digital experiences.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 bg-[#111827] border border-slate-800 rounded-md text-[#06B6D4]">
                React &amp; TypeScript
              </span>
              <span className="px-2.5 py-1 bg-[#111827] border border-slate-800 rounded-md text-[#3B82F6]">
                Node.js &amp; Cloud
              </span>
              <span className="px-2.5 py-1 bg-[#111827] border border-slate-800 rounded-md text-[#10B981]">
                UI/UX Design
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#06B6D4]">
              Navigation
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> About &amp; Skills
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Featured Projects
                </Link>
              </li>
              <li>
                <Link to="/cv" className="hover:text-white transition-colors flex items-center gap-1.5 text-[#06B6D4]">
                  <span className="text-slate-600">&gt;</span> View CV / Resume
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Coordinates */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#06B6D4]">
              Connect
            </div>
            <div className="flex flex-col space-y-2 text-[11px]">
              <a 
                href="https://github.com/ash-x8" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#06B6D4] transition-colors"
              >
                <GitBranch size={14} className="text-[#06B6D4]" />
                github.com/ash-x8
              </a>
              <a 
                href="https://linkedin.com/in/ash-wickramasinghe" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#06B6D4] transition-colors"
              >
                <Globe size={14} className="text-[#06B6D4]" />
                linkedin.com/in/ash-wickramasinghe
              </a>
              <a 
                href="https://t.me/ash_wickramasinghe" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#06B6D4] transition-colors"
              >
                <Send size={14} className="text-[#06B6D4]" />
                Telegram
              </a>
              <a 
                href="mailto:kushanashvika216@gmail.com" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#06B6D4] transition-colors"
              >
                <Mail size={14} className="text-[#06B6D4]" />
                kushanashvika216@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {currentYear} Ash Wickramasinghe. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Colombo, Sri Lanka &bull; Remote</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
