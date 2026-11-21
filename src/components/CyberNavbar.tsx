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
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { defaultSiteSettings } from '../data/defaultContent';
import { SiteSettings } from '../types';

export const CyberNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch(console.warn);

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateColomboTime = () => {
      try {
        const timeString = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Colombo',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(new Date());
        setCurrentTime(timeString);
      } catch {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };
    updateColomboTime();
    const interval = setInterval(updateColomboTime, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Projects', path: '/projects' },
    { label: 'Writing', path: '/writing' },
    { label: 'CV', path: '/cv' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#0A0D14]/92 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 py-3 shadow-sm dark:shadow-2xl'
          : 'bg-gradient-to-b from-white/95 via-white/75 to-transparent dark:from-[#0A0D14]/95 dark:via-[#0A0D14]/75 dark:to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-900 dark:bg-[#0D111A] border border-[#C59B63]/40 rounded-xl group-hover:border-[#C59B63] transition-all overflow-hidden">
            {logoLoaded ? (
              <img
                src={settings.logoMonogramUrl || '/ash-logo-monogram.jpg'}
                alt="AW Monogram"
                onError={() => setLogoLoaded(false)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-white font-bold text-xs tracking-tight group-hover:text-[#C59B63] transition-colors">
                AW
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-[#EDEDED] group-hover:text-[#9E6B24] dark:group-hover:text-[#C59B63] transition-colors font-sans tracking-tight text-sm sm:text-base">
              {settings.creativeName || settings.name || 'Ash Wickramasinghe'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              {settings.title ? settings.title.split('•')[0].trim() : 'Graphic Designer'} · Creative Studio
            </span>
          </div>
        </Link>

        {/* Center: Clean Single-Line Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Primary Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#9E6B24] dark:text-[#C59B63] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9E6B24] dark:bg-[#C59B63] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Colombo Time + Theme Toggle + Primary CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentTime && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 pr-2 border-r border-slate-200 dark:border-slate-800">
              <Clock size={12} className="text-[#9E6B24] dark:text-[#C59B63]" />
              <span>{currentTime}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">LK</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#111622] hover:bg-slate-200 dark:hover:bg-[#151B2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light mode' : 'dark mode'}`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-[#C59B63]" />
            ) : (
              <Moon size={15} className="text-slate-700" />
            )}
          </button>

          <Link
            to="/contact"
            className="px-4 py-2 bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Let&apos;s Talk</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-[#C59B63]" />
            ) : (
              <Moon size={16} className="text-slate-700" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0A0D14]/98 border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 shadow-2xl backdrop-blur-xl">
          {currentTime && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Colombo, Sri Lanka</span>
              <span className="text-[#9E6B24] dark:text-[#C59B63]">{currentTime}</span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between py-2.5 text-sm border-b border-slate-100 dark:border-slate-800/60 ${
                    isActive
                      ? 'text-[#9E6B24] dark:text-[#C59B63] font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <ArrowRight size={14} className="text-[#C59B63]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 py-3 text-xs bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] font-bold rounded-lg transition-all"
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
