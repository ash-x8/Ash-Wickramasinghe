import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CyberNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update Colombo local time clock
  useEffect(() => {
    const updateColomboTime = () => {
      try {
        const timeString = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Colombo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(new Date());
        setCurrentTime(timeString);
      } catch (e) {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };
    updateColomboTime();
    const interval = setInterval(updateColomboTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // The admin dashboard is completely separated from the public website
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'SERVICES', path: '/services' },
    { label: 'PROJECTS', path: '/projects' },
    { label: 'WRITING', path: '/writing' },
    { label: 'CV / RESUME', path: '/cv' },
    { label: 'CONTACT', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A0D14]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-2xl' 
          : 'bg-gradient-to-b from-[#0A0D14]/95 via-[#0A0D14]/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link 
          to="/" 
          className="group flex items-center gap-3 font-mono text-sm tracking-wider"
        >
          <div className="relative w-9 h-9 flex items-center justify-center bg-[#111622] border border-[#C59B63]/40 rounded-lg group-hover:border-[#C59B63] transition-all shadow-[0_0_15px_rgba(197,155,99,0.15)]">
            <span className="text-[#EDEDED] font-bold text-xs tracking-tight group-hover:text-[#C59B63] transition-colors">AW</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10B981] rounded-full ring-2 ring-[#0A0D14] shadow-[0_0_6px_#10B981]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#EDEDED] group-hover:text-[#C59B63] transition-colors flex items-center gap-1.5 font-sans tracking-tight text-sm sm:text-base">
              Ash Wickramasinghe
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <span>Graphic Designer &amp; Creative Digital</span>
            </span>
          </div>
        </Link>

        {/* Live Colombo Time & Status indicator */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#111622]/80 border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            <span className="text-slate-400">Available for Retainers</span>
          </div>
          {currentTime && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#111622]/60 border border-slate-800/80 rounded-full font-mono text-[11px] text-slate-400">
              <Clock size={12} className="text-[#C59B63]" />
              <span className="text-slate-300">{currentTime}</span>
              <span className="text-[9px] text-slate-500">LK (GMT+5:30)</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 font-mono text-xs tracking-wider transition-colors ${
                  isActive 
                    ? 'text-[#C59B63] font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C59B63] to-[#E5C392] shadow-[0_0_8px_#C59B63]" />
                )}
              </Link>
            );
          })}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#111622] hover:bg-[#151B2A] border border-slate-800 text-slate-300 hover:text-[#C59B63] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'high-contrast light mode' : 'dark mode'}`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-[#C59B63]" />
            ) : (
              <Moon size={15} className="text-[#0F172A]" />
            )}
          </button>

          <Link
            to="/contact"
            className="ml-1 px-4 py-1.5 bg-gradient-to-r from-[#C59B63] to-[#D8AC74] text-[#0A0D14] hover:opacity-95 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(197,155,99,0.25)]"
          >
            <span>Let's Talk</span>
            <ArrowRight size={13} />
          </Link>
        </nav>

        {/* Mobile Actions: Theme toggle + Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-white bg-[#111622] border border-slate-800 rounded-lg"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-[#C59B63]" />
            ) : (
              <Moon size={16} className="text-slate-200" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-[#111622] border border-slate-800 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0D14]/98 border-b border-slate-800 px-6 py-6 space-y-4 font-mono shadow-2xl backdrop-blur-xl">
          {currentTime && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                <span>Colombo, LK</span>
              </span>
              <span className="text-[#C59B63]">{currentTime}</span>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between py-2 text-sm border-b border-slate-800/60 ${
                    isActive ? 'text-[#C59B63] font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 py-3 text-xs text-center bg-gradient-to-r from-[#C59B63] to-[#D8AC74] text-[#0A0D14] font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(197,155,99,0.25)]"
            >
              <span>Get in Touch / Request Quote</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
