import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowUpRight, Shield } from 'lucide-react';
import { getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { defaultSiteSettings } from '../data/defaultContent';
import { SiteSettings } from '../types';
import { openPrivacyPreferences } from './PrivacyConsentBanner';

export const CyberFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn('Fallback settings for footer:', err));

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const activeSocials = settings.socialLinks && settings.socialLinks.length > 0
    ? settings.socialLinks.filter((s) => s.enabled)
    : [
        { id: '1', platform: 'linkedin', label: 'LinkedIn', url: settings.linkedin, enabled: !!settings.linkedin, order: 1 },
        { id: '2', platform: 'telegram', label: 'Telegram', url: settings.telegram, enabled: !!settings.telegram, order: 2 },
        { id: '3', platform: 'whatsapp', label: 'WhatsApp', url: settings.whatsapp || 'https://wa.me/94752269410', enabled: true, order: 3 },
        { id: '4', platform: 'youtube', label: 'YouTube', url: settings.youtube || 'https://www.youtube.com/@Ash-x8', enabled: !!settings.youtube, order: 4 },
        { id: '5', platform: 'facebook', label: 'Facebook', url: settings.facebook || 'https://www.facebook.com/share/1UeTQSvLik/', enabled: !!settings.facebook, order: 5 },
        { id: '6', platform: 'tiktok', label: 'TikTok', url: settings.tiktok || 'https://vm.tiktok.com/ZS9Ypfen3rcYL-KiVCP/', enabled: !!settings.tiktok, order: 6 },
      ].filter((s) => s.enabled && s.url);

  return (
    <footer className="bg-slate-50 dark:bg-[#080B12] border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C59B63]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Summary */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 dark:bg-[#0D111A] border border-[#C59B63]/40 p-0.5 flex items-center justify-center shrink-0">
                <img
                  src={settings.logoMonogramUrl || '/ash-logo-monogram.jpg'}
                  alt="AW Monogram"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white text-base font-bold tracking-tight font-sans">
                  {settings.creativeName || settings.name || 'Ash Wickramasinghe'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {settings.title || 'Graphic Designer • Social Media Manager • Author'}
                </div>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-md font-sans">
              {settings.bio || 'Kushan A Wickramasinghe is a creative professional specializing in graphic design, social media management, digital content and creative writing.'}
            </p>

            {settings.personalStatement && (
              <p className="text-xs text-[#9E6B24] dark:text-[#C59B63] italic font-serif">
                &ldquo;{settings.personalStatement}&rdquo;
              </p>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Graphic Design &middot; Social Media Management &middot; Author &amp; Creative Writing
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[11px] text-[#9E6B24] dark:text-[#C59B63]">
              Navigation
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  About &amp; Profile
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link to="/writing" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  Writing &amp; Articles
                </Link>
              </li>
              <li>
                <Link to="/cv" className="text-[#9E6B24] dark:text-[#C59B63] font-medium hover:underline">
                  View CV / Resume
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[11px] text-[#9E6B24] dark:text-[#C59B63]">
              Connect &amp; Social
            </div>
            <div className="flex flex-col space-y-2 text-xs">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
                >
                  <Mail size={14} className="text-[#9E6B24] dark:text-[#C59B63] shrink-0" />
                  <span className="truncate">{settings.email}</span>
                </a>
              )}
              {activeSocials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
                >
                  <ArrowUpRight size={14} className="text-[#9E6B24] dark:text-[#C59B63] shrink-0" />
                  <span>{soc.label || soc.platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {currentYear} Ash Wickramasinghe (Kushan A Wickramasinghe). All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Sri Lanka &middot; Remote Worldwide</span>
            <button
              type="button"
              onClick={openPrivacyPreferences}
              className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors cursor-pointer"
            >
              Privacy Preferences
            </button>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
            >
              <Shield size={11} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
