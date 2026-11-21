import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowUpRight, CheckCircle2, AlertCircle, Send, MapPin } from 'lucide-react';
import { submitContactMessage, getSiteSettings, subscribeToSiteSettings, trackContactSubmission } from '../lib/firebase';
import { apiFetch } from '../lib/apiClient';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';
import { useSeo } from '../utils/useSeo';

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please provide a valid email address (e.g. name@domain.com)'),
  service: z
    .string()
    .min(1, 'Please select a service'),
  message: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your project requirements')
    .max(3000, 'Message is too long (maximum 3,000 characters)'),
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || 'Graphic Design';

  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useSeo({
    title: 'Contact — Ash Wickramasinghe',
    description: 'Start a conversation with Ash Wickramasinghe for graphic design, social media management, branding, and creative writing commissions.',
    canonicalPath: '/contact',
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      service: initialService,
      message: '',
      website: ''
    }
  });

  const messageValue = watch('message') || '';

  useEffect(() => {
    getSiteSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
    }).catch((err) => console.warn('Using fallback settings for contact:', err));

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
    'Content & Digital Media Editing',
    'Content Writing & Creative Direction',
    'Web Management & Digital Content',
    'General Inquiry'
  ];

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    try {
      // Server-side validation, rate limit, honeypot & link-spam guard
      await apiFetch<{ success: boolean }>('/api/contact', {
        method: 'POST',
        body: {
          name: data.name.trim(),
          email: data.email.trim(),
          service: data.service,
          subject: `Inquiry: ${data.service}`,
          message: data.message.trim(),
          website: data.website || '',
        },
      });

      // Mirror into Firestore inbox best-effort
      await submitContactMessage({
        name: data.name.trim(),
        email: data.email.trim(),
        service: data.service,
        subject: `Inquiry: ${data.service}`,
        message: data.message.trim()
      }).catch((err) => console.debug('Firestore message sync skipped:', err));

      await trackContactSubmission(data.service);
      setSubmitSuccess(true);
      reset({
        name: '',
        email: '',
        service: data.service,
        message: '',
        website: ''
      });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSubmitError(err?.message || 'Your message could not be sent right now. Please try again or reach out directly via email.');
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl space-y-4 mb-16"
      >
        <span className="text-xs uppercase tracking-widest text-[#9E6B24] dark:text-[#C59B63] font-semibold block">
          Inquiries &amp; Collaboration
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
          Let&apos;s Start a Conversation
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed font-light">
          Have an upcoming brand launch, campaign, or publication project? Share your brief below or reach out directly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/70 space-y-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
              Direct Coordinates
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#9E6B24] dark:text-[#C59B63] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Email</div>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-slate-800 dark:text-neutral-200 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#9E6B24] dark:text-[#C59B63] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Base</div>
                  <span className="text-slate-800 dark:text-neutral-200">
                    {settings.location}
                  </span>
                </div>
              </div>

              {settings.telegram && (
                <div className="flex items-start gap-3">
                  <Send size={16} className="text-[#9E6B24] dark:text-[#C59B63] mt-1 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Telegram</div>
                    <a
                      href={settings.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-800 dark:text-neutral-200 hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors"
                    >
                      @kawickramasinghe
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-neutral-800/60 space-y-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Response Window</div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Client inquiries are generally reviewed and answered within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-7"
        >
          <div className="p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-[#111622]/75 shadow-lg dark:shadow-xl dark:shadow-black/20">
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-neutral-100">
                  Inquiry Received Successfully
                </h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your brief has been securely logged and I will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-full bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] transition-all cursor-pointer shadow-sm"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {/* Invisible anti-bot honeypot field */}
                <div className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website-hp">Website</label>
                  <input
                    id="contact-website-hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register('website')}
                  />
                </div>

                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{submitError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>Your Name <span className="text-[#C59B63]">*</span></span>
                      {errors.name && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 normal-case font-normal">
                          {errors.name.message}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nuwan Fernando"
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border text-slate-900 dark:text-neutral-100 text-sm placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-slate-300 dark:border-neutral-800 focus:border-[#C59B63]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>Email Address <span className="text-[#C59B63]">*</span></span>
                      {errors.email && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 normal-case font-normal">
                          {errors.email.message}
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border text-slate-900 dark:text-neutral-100 text-sm placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-slate-300 dark:border-neutral-800 focus:border-[#C59B63]'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center justify-between">
                    <span>Primary Service of Interest</span>
                    {errors.service && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 normal-case font-normal">
                        {errors.service.message}
                      </span>
                    )}
                  </label>
                  <select
                    {...register('service')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C59B63] transition-colors"
                  >
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <span>Project Overview &amp; Requirements <span className="text-[#C59B63]">*</span></span>
                    <span className={`text-[11px] font-mono lowercase ${messageValue.length > 2800 ? 'text-amber-500' : 'text-slate-400 dark:text-neutral-500'}`}>
                      {messageValue.length} / 3,000
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Tell me about your brand, goals, target audience, timeline, and required deliverables..."
                    {...register('message')}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0A0D14]/70 border text-slate-900 dark:text-neutral-100 text-sm placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none transition-colors resize-none ${
                      errors.message
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-slate-300 dark:border-neutral-800 focus:border-[#C59B63]'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-normal">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-xs uppercase tracking-widest font-bold rounded-full bg-[#C59B63] hover:bg-[#D4AF37] text-[#0A0D14] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#0A0D14] border-t-transparent rounded-full animate-spin" />
                      <span>Validating &amp; Sending...</span>
                    </span>
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
        </motion.div>
      </div>
    </div>
  );
};
