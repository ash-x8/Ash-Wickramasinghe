'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GitBranch, 
  Linkedin, 
  Send, 
  ShieldCheck, 
  Terminal, 
  Mail, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#070A10] border-t border-slate-800/80 pt-16 pb-12 overflow-hidden z-10">
      {/* Top subtle glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#06B6D4]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Identity Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-[#111827] border border-[#06B6D4]/40 rounded-lg">
                <span className="text-white font-bold text-xs font-mono">AW</span>
              </div>
              <span className="text-lg font-bold text-white font-sans tracking-tight">
                Ash Wickramasinghe
              </span>
            </div>
            
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Graphic designer, social media manager, content editor, and creative digital specialist crafting high-impact visual identities, digital marketing assets, and modern web experiences.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={13} className="text-[#06B6D4]" />
                Colombo, Sri Lanka // Remote Worldwide
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              // DIRECTORY
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-[#06B6D4] transition-colors">
                  Overview / Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-[#06B6D4] transition-colors">
                  Specialist Profile
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-400 hover:text-[#06B6D4] transition-colors">
                  Featured Portfolio
                </Link>
              </li>
              <li>
                <Link href="/cv" className="text-slate-400 hover:text-[#06B6D4] transition-colors">
                  CV / Credentials
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-[#06B6D4] transition-colors">
                  Direct Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / System Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              // CHANNELS
            </h4>
            <div className="space-y-2 text-sm">
              <a 
                href="https://linkedin.com/in/ash-wickramasinghe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-[#06B6D4] transition-colors"
              >
                <Linkedin size={15} />
                <span>LinkedIn</span>
                <ExternalLink size={11} className="text-slate-600" />
              </a>
              <a 
                href="https://github.com/ash-wickramasinghe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-[#06B6D4] transition-colors"
              >
                <GitBranch size={15} />
                <span>GitHub</span>
                <ExternalLink size={11} className="text-slate-600" />
              </a>
              <a 
                href="mailto:kushanashvika216@gmail.com"
                className="flex items-center gap-2 text-slate-400 hover:text-[#06B6D4] transition-colors"
              >
                <Mail size={15} />
                <span>Email Inquiries</span>
              </a>
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-slate-400 hover:text-[#06B6D4] transition-colors pt-1"
              >
                <ShieldCheck size={15} className="text-slate-500" />
                <span>Admin CMS</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>ash-wickramasinghe.site // PRODUCTION</span>
          </div>
          <div>
            &copy; {currentYear} Ash Wickramasinghe. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
