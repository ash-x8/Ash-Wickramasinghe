import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Menu, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CyberNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
  }, [location.pathname]);

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'PROJECTS', path: '/projects' },
    { label: 'CV / RESUME', path: '/cv' },
    { label: 'CONTACT', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 py-3.5 shadow-2xl' 
          : 'bg-gradient-to-b from-[#0B0F17]/95 via-[#0B0F17]/70 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link 
          to="/" 
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
              Full-Stack Developer &amp; UI/UX
            </span>
          </div>
        </Link>

        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#111827]/80 border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-slate-400">Available for Opportunities</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 font-mono text-xs tracking-wider transition-colors ${
                  isActive 
                    ? 'text-[#06B6D4] font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] shadow-[0_0_8px_#06B6D4]" />
                )}
              </Link>
            );
          })}

          <Link
            to="/contact"
            className="ml-2 px-4 py-1.5 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] hover:opacity-90 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <span>Let's Talk</span>
            <ArrowRight size={13} />
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-[#111827] border border-slate-800 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F17]/98 border-b border-slate-800 px-6 py-6 space-y-4 font-mono shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between py-2.5 text-sm border-b border-slate-800/60 ${
                    isActive ? 'text-[#06B6D4] font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 py-3 text-xs text-center bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-[#0B0F17] font-bold rounded-lg transition-all"
            >
              <span>Get in Touch</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
