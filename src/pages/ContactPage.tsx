import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, ArrowUpRight, CheckCircle2, AlertCircle, Send, MapPin, Phone } from 'lucide-react';
import { submitContactMessage, getSiteSettings, subscribeToSiteSettings } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || '';

  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(initialService || 'Graphic Design');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn("Using fallback settings for contact:", err));

    const unsubscribe = subscribeToSiteSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => unsubscribe();
  }, []);

  const serviceOptions = [
    'Graphic Design',
    'Social Media Post Design',
    'Logo & Brand Identity Design',
    'Poster Design',
    'Certificate Design',
    'Invitation Design',
    'Tute & Educational Material Design',
    'CV & Executive Resume Design',
    'Photo Editing & Retouching',
    'Content Writing & Creative Direction',
    'Web Management & Digital Content',
    'General Inquiry'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and a message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        service,
        subject: `Inquiry: ${service}`,
        message: message.trim()
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setError('Your message could not be sent right now. Please try again or reach out directly via email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      <div className="max-w-3xl space-y-4 mb-16">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Inquiries &amp; Collaboration
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          Let's Start a Conversation
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          Have an upcoming brand launch, campaign, or publication project? Fill in the details below or contact me directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Contact Direct Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white space-y-6">
            <h2 className="text-lg font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
              Direct Coordinates
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-accent mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Email</div>
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="text-neutral-200 dark:text-neutral-200 light:text-neutral-800 hover:text-accent transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-accent mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Base</div>
                  <span className="text-neutral-200 dark:text-neutral-200 light:text-neutral-800">
                    {settings.location}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Send size={16} className="text-accent mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Telegram</div>
                  <a 
                    href={settings.telegram} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-neutral-200 dark:text-neutral-200 light:text-neutral-800 hover:text-accent transition-colors"
                  >
                    @ash_wickramasinghe
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 space-y-2">
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Response Window</div>
              <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                Client inquiries are generally answered within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white">
            {success ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. I have received your inquiry and will review your project brief shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-all cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Your Name <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Email Address <span className="text-accent">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="eleanor@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Primary Service of Interest
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-neutral-900 text-neutral-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Project Overview &amp; Requirements <span className="text-accent">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell me about your brand, goals, timeline, and deliverables..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <span>Send Project Inquiry</span>
                      <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
