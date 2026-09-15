import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Code2, 
  Mail, 
  Menu, 
  X, 
  Lock, 
  Radio, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CyberNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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
    { label: 'HOME', path: '/', num: '01' },
    { label: 'ABOUT', path: '/about', num: '02' },
    { label: 'PROJECTS', path: '/projects', num: '03' },
    { label: 'CV // READ-ONLY', path: '/cv', num: '04' },
    { label: 'CONTACT', path: '/contact', num: '05' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#00f0ff]/20 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.7)]' 
          : 'bg-gradient-to-b from-[#0b0f19]/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link 
          to="/" 
          className="group flex items-center gap-3 font-mono text-sm tracking-wider"
        >
          <div className="relative w-8 h-8 flex items-center justify-center bg-[#111827] border border-[#00f0ff]/40 rounded group-hover:border-[#00f0ff] transition-all">
            <span className="text-[#00f0ff] font-bold text-xs group-hover:scale-110 transition-transform">AW</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00ff66] rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00ff66] rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white group-hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
              ASH WICKRAMASINGHE
            </span>
            <span className="text-[10px] text-[#00f0ff]/70 font-mono tracking-widest">
              [FULL-STACK // CYBER SEC]
            </span>
          </div>
        </Link>

        {/* Live Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#111827]/80 border border-[#00ff66]/30 rounded-full font-mono text-[11px] text-[#00ff66]">
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="tracking-wider">SYS_STATUS: ONLINE // CLEARANCE_GRANTED</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`group relative py-1 font-mono text-xs tracking-wider transition-colors ${
                  isActive 
                    ? 'text-[#00f0ff] font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[#00f0ff]/40 text-[10px] mr-1 group-hover:text-[#00f0ff]/80 transition-colors">
                  {link.num}.
                </span>
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                )}
              </Link>
            );
          })}

          {/* Admin Terminal Link */}
          <Link
            to={user ? "/admin/dashboard" : "/admin"}
            className={`p-2 rounded border transition-all ${
              user
                ? 'border-[#00ff66]/60 bg-[#00ff66]/10 text-[#00ff66] hover:bg-[#00ff66]/20'
                : 'border-[#00f0ff]/30 text-[#00f0ff]/60 hover:text-[#00f0ff] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10'
            }`}
            title={user ? "CMS Admin Dashboard Active" : "Secret Admin Terminal"}
          >
            {user ? <ShieldCheck size={16} /> : <Lock size={15} />}
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to={user ? "/admin/dashboard" : "/admin"}
            className="p-1.5 text-xs text-[#00f0ff] border border-[#00f0ff]/30 rounded bg-[#111827]"
            title="Admin Login"
          >
            {user ? <ShieldCheck size={16} /> : <Lock size={15} />}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-[#00f0ff] bg-[#111827] border border-[#00f0ff]/30 rounded"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b0f19]/98 border-b border-[#00f0ff]/30 px-6 py-6 space-y-4 font-mono shadow-2xl backdrop-blur-xl">
          <div className="pb-3 border-b border-[#00f0ff]/20 flex items-center justify-between text-xs text-[#00ff66]">
            <span className="flex items-center gap-2">
              <Radio size={14} className="animate-pulse" />
              STATUS: SECURE
            </span>
            <span className="text-[10px] text-slate-500">PORT: 3000 // HTTPS</span>
          </div>

          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between py-2 text-sm border-b border-slate-800/60 ${
                    isActive ? 'text-[#00f0ff] font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#00f0ff]/60 text-xs">{link.num}.</span>
                    {link.label}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to={user ? "/admin/dashboard" : "/admin"}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-center border border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10 rounded hover:bg-[#00f0ff]/20 transition-all font-mono"
            >
              <Lock size={14} />
              {user ? "ACCESS CMS DASHBOARD" : "RESTRICTED ADMIN ACCESS"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
