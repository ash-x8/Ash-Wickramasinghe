import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Lock, Globe, Mail, ArrowUpRight, GitBranch, Send } from 'lucide-react';

export const CyberFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080c14] border-t border-[#00f0ff]/20 text-slate-400 font-mono text-xs relative overflow-hidden">
      {/* Top Cyber Accents */}
      <div className="absolute top-0 left-0 w-32 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-32 h-[2px] bg-[#00ff66] shadow-[0_0_10px_#00ff66]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: System Ident */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wider">
              <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-ping" />
              ASH WICKRAMASINGHE // TERMINAL_v2.6
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
              Senior Full-Stack Web Developer, UI/UX Designer, and Cyber Systems Specialist. Architecting resilient cloud applications, defensive interfaces, and high-performance digital platforms.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-[#00f0ff]/80">
              <span className="px-2 py-0.5 bg-[#111827] border border-[#00f0ff]/30 rounded">
                ENV: PRODUCTION
              </span>
              <span className="px-2 py-0.5 bg-[#111827] border border-[#00ff66]/30 rounded text-[#00ff66]">
                FIREBASE: CONNECTED
              </span>
              <span className="px-2 py-0.5 bg-[#111827] border border-slate-700 rounded text-slate-400">
                SSL: 256-BIT TLS
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#00f0ff]">
              // DIRECTORY INDEX
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Home Hub
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Profile & Skills Matrix
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Engineering Projects
                </Link>
              </li>
              <li>
                <Link to="/cv" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5 text-[#00f0ff]">
                  <span className="text-slate-600">&gt;</span> Read-Only CV Viewer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span> Transmit Message
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Coordinates & Admin */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#00f0ff]">
              // CONNECTIVITY
            </div>
            <div className="flex flex-col space-y-2 text-[11px]">
              <a 
                href="https://github.com/ash-x8" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#00f0ff] transition-colors"
              >
                <GitBranch size={14} className="text-[#00f0ff]" />
                github.com/ash-x8
              </a>
              <a 
                href="https://linkedin.com/in/ash-wickramasinghe" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#00f0ff] transition-colors"
              >
                <Globe size={14} className="text-[#00f0ff]" />
                linkedin.com/in/ash-wickramasinghe
              </a>
              <a 
                href="https://t.me/ash_wickramasinghe" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-slate-300 hover:text-[#00f0ff] transition-colors"
              >
                <Send size={14} className="text-[#00f0ff]" />
                Telegram Direct
              </a>
              <Link
                to="/admin"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/15 rounded transition-all w-fit"
              >
                <Lock size={12} />
                ADMIN_TERMINAL_LOGIN
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div>
            &copy; {currentYear} ASH WICKRAMASINGHE. ALL RIGHTS RESERVED. SECURE DOCUMENT EMBED PROTOCOLS ACTIVE.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#00ff66]">
              <Shield size={12} />
              TAMPER PROTECTION: ENABLED
            </span>
            <span>LATENCY: ~12ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
