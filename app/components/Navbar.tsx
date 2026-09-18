'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'PROJECTS', path: '/projects' },
    { label: 'SERVICES', path: '/services' },
    { label: 'WRITING', path: '/writing' },
    { label: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#070A10]/95 backdrop-blur-md border-b border-slate-800/80 py-3.5 shadow-2xl'
          : 'bg-gradient-to-b from-[#070A10]/95 via-[#070A10]/70 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 font-mono text-sm tracking-wider"
        >
          <div className="relative w-9 h-9 flex items-center justify-center bg-[#111827] border border-[#06B6D4]/40 rounded-lg group-hover:border-[#3B82F6] transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="text-white font-bold text-xs tracking-tight group-hover:text-[#06B6D4] transition-colors">AW</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10B981] rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white group-hover:text-[#06B6D4] transition-colors flex items-center gap-1.5 font-sans tracking-tight text-sm sm:text-base">
              Ash Wickramasinghe
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              Graphic Design &amp; Digital Creative
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#111827]/60 border border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-3.5 py-1.5 text-xs font-mono tracking-wider rounded-full transition-all duration-200 ${
                  active 
                    ? 'text-[#06B6D4] bg-[#06B6D4]/10 font-bold border border-[#06B6D4]/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#111827]/80 border border-slate-800 rounded-full text-xs font-mono text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[11px] text-slate-400">STATUS:</span>
            <span className="text-[#10B981] text-[11px] font-bold">AVAILABLE</span>
          </div>

          <Link
            href="/contact"
            className="px-4 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:from-[#0891B2] hover:to-[#2563EB] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
          >
            <span>INQUIRE</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-[#111827] border border-slate-800 rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} className="text-[#06B6D4]" /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070A10]/98 border-b border-slate-800 px-4 pt-4 pb-6 mt-3 space-y-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between px-3 py-2 bg-[#111827] border border-slate-800/80 rounded-lg text-xs font-mono mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-slate-400">STATUS:</span>
              <span className="text-white font-bold">AVAILABLE FOR WORK</span>
            </div>
          </div>

          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-xs font-mono tracking-wider transition-all ${
                  active 
                    ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 font-bold' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-slate-600">&gt;</span>
              </Link>
            );
          })}

          <div className="pt-2">
            <Link
              href="/contact"
              className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#070A10] font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
            >
              <span>GET IN TOUCH</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
