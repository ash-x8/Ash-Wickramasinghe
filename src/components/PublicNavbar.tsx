import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const PublicNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Projects', path: '/projects' },
    { label: 'Services', path: '/services' },
    { label: 'Writing', path: '/writing' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/85 dark:bg-neutral-950/90 light:bg-white/85 backdrop-blur-md border-b border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200/80 py-3.5 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand / Name */}
        <Link 
          to="/" 
          className="group flex flex-col focus:outline-none"
        >
          <span className="font-sans font-semibold tracking-tight text-base sm:text-lg text-neutral-100 dark:text-neutral-100 light:text-neutral-900 group-hover:opacity-80 transition-opacity">
            Ash Wickramasinghe
          </span>
          <span className="text-[11px] font-sans tracking-wide text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
            Graphic Design &bull; Social Media &bull; Content
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? 'text-white dark:text-white light:text-neutral-950 font-semibold'
                    : 'text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-950'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Contact CTA */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-100 dark:hover:text-neutral-950 light:hover:bg-neutral-900 light:hover:text-white transition-all"
          >
            <span>Let's Talk</span>
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu and theme toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 text-neutral-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/98 dark:bg-neutral-950/98 light:bg-white/98 border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 px-6 py-8 space-y-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg tracking-tight font-medium transition-colors ${
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-800 dark:border-neutral-800 light:border-neutral-200">
            <Link
              to="/contact"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-medium tracking-wide uppercase rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-opacity"
            >
              <span>Let's Work Together</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
