import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowUpRight, CheckCircle2, AlertCircle, Send, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import { submitContactMessage, getSiteSettings, subscribeToSiteSettings, trackContactSubmission } from '../lib/firebase';
import { SiteSettings } from '../types';
import { defaultSiteSettings } from '../data/defaultContent';

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
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || 'Graphic Design';

  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      service: initialService,
      message: ''
    }
  });

  const messageValue = watch('message') || '';

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
    'Content & Digital Media Editing',
    'Content Writing & Creative Direction',
    'Web Management & Digital Content',
    'General Inquiry'
  ];

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    try {
      await submitContactMessage({
        name: data.name.trim(),
        email: data.email.trim(),
        service: data.service,
        subject: `Inquiry: ${data.service}`,
        message: data.message.trim()
      });
      await trackContactSubmission(data.service);
      setSubmitSuccess(true);
      reset({
        name: '',
        email: '',
        service: data.service,
        message: ''
      });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSubmitError('Your message could not be sent right now. Please try again or reach out directly via email.');
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
        <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
          Inquiries &amp; Collaboration
        </span>
        <h1 className="editorial-section-title font-semibold tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
          Let's Start a Conversation
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed font-light">
          Have an upcoming brand launch, campaign, or publication project? Fill in the verified details below or contact me directly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Contact Direct Info */}
        <motion.div 
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="p-8 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/30 dark:bg-neutral-900/30 light:bg-white space-y-6 shadow-sm">
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
                Client inquiries are generally reviewed and answered within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-7"
        >
          <div className="p-8 sm:p-10 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white shadow-xl shadow-black/10">
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-medium text-neutral-100 dark:text-neutral-100 light:text-neutral-900">
                  Inquiry Received Successfully
                </h3>
                <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your brief has been securely logged. I look forward to exploring this collaboration.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4 px-6 py-2.5 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 transition-all cursor-pointer shadow-md"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <AnimatePresence>
                  {submitError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{submitError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                      <span>Your Name <span className="text-accent">*</span></span>
                      {errors.name && (
                        <span className="text-[11px] text-rose-400 normal-case font-normal">
                          {errors.name.message}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-neutral-800 dark:border-neutral-800 light:border-neutral-300 focus:border-accent'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                      <span>Email Address <span className="text-accent">*</span></span>
                      {errors.email && (
                        <span className="text-[11px] text-rose-400 normal-case font-normal">
                          {errors.email.message}
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      placeholder="eleanor@studio.com"
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-neutral-800 dark:border-neutral-800 light:border-neutral-300 focus:border-accent'
                      }`}
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Primary Service of Interest</span>
                    {errors.service && (
                      <span className="text-[11px] text-rose-400 normal-case font-normal">
                        {errors.service.message}
                      </span>
                    )}
                  </label>
                  <select
                    {...register('service')}
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    <span>Project Overview &amp; Requirements <span className="text-accent">*</span></span>
                    <span className={`text-[11px] font-mono lowercase ${messageValue.length > 2800 ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {messageValue.length} / 3,000
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Tell me about your brand, goals, target audience, timeline, and required deliverables..."
                    {...register('message')}
                    className={`w-full px-4 py-3 rounded-xl bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100 border text-neutral-100 dark:text-neutral-100 light:text-neutral-900 text-sm placeholder-neutral-500 focus:outline-none transition-colors resize-none ${
                      errors.message
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-neutral-800 dark:border-neutral-800 light:border-neutral-300 focus:border-accent'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-400 font-normal">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-xs uppercase tracking-widest font-medium rounded-full bg-neutral-100 text-neutral-950 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[#C59B63]/10"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
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
