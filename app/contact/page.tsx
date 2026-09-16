'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  MapPin, 
  GitBranch, 
  Globe, 
  Radio, 
  Lock 
} from 'lucide-react';
import { CyberCard } from '@/app/components/CyberCard';
import { saveContactMessage, getSiteSettings } from '@/utils/firebase-service';
import { SiteSettings } from '@/lib/types';
import { defaultSiteSettings } from '@/lib/defaultContent';

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING SECURE SOCKET...",
    "HANDSHAKE PROTOCOL: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    "TRANSMISSION CHANNEL READY."
  ]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const loaded = await getSiteSettings();
        if (loaded) setSettings(loaded);
      } catch (err) {
        console.warn("Using fallback settings for contact page:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("REQUIRED PARAMETERS MISSING: Please provide Name, Email, and Message.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] PACKET GENERATION: TARGET=ASH_WICKRAMASINGHE`,
      `[${new Date().toLocaleTimeString()}] ENCRYPTING PAYLOAD WITH AES-256...`,
      `[${new Date().toLocaleTimeString()}] TRANSMITTING TO FIRESTORE RELAY NODE...`
    ]);

    try {
      await saveContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Portfolio Inquiry',
        message: formData.message
      });

      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 200 OK: PAYLOAD DELIVERED & INDEXED IN FIRESTORE.`,
        `[${new Date().toLocaleTimeString()}] DISPATCH CONFIRMED.`
      ]);

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error("Message submission failed:", err);
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: TRANSMISSION TIMEOUT / RETRY REQUIRED.`
      ]);
      setErrorMessage("Connection to secure message relay encountered an issue. Please retry or contact directly via email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* PAGE HEADER */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] mb-4">
          <Radio size={14} className="text-[#00ff66] animate-pulse" />
          <span>// SECURE TRANSMISSION PORTAL // ENCRYPTED NODE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Initialize <span className="text-[#00f0ff]">Direct Transmission</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-mono">
          Inquire regarding full-stack architecture, high-security auditing, web applications, or team collaboration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Cyber Form */}
        <div className="lg:col-span-7">
          <CyberCard highlightHeader="ENCRYPTED_MESSAGE_PAYLOAD" className="p-6 sm:p-8">
            {success ? (
              <div className="py-12 text-center space-y-4 font-mono">
                <div className="w-16 h-16 mx-auto bg-[#00ff66]/10 border border-[#00ff66] rounded-full flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">PAYLOAD SUCCESSFULLY DELIVERED</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  Your message was authenticated and saved directly into the secure dispatch inbox. Ash Wickramasinghe will review and respond promptly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 bg-[#00f0ff] text-[#0b0f19] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all cursor-pointer"
                >
                  TRANSMIT ANOTHER PAYLOAD
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
                {errorMessage && (
                  <div className="p-3 bg-red-950/50 border border-red-500/50 rounded flex items-center gap-2 text-red-300">
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 uppercase tracking-wider block">
                      OPERATOR_NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white focus:outline-none focus:border-[#00f0ff] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 uppercase tracking-wider block">
                      REPLY_ENDPOINT (EMAIL) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. operator@enterprise.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white focus:outline-none focus:border-[#00f0ff] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 uppercase tracking-wider block">
                    PROJECT_SUBJECT / INQUIRY_TYPE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Contract Engineering / System Security Audit"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white focus:outline-none focus:border-[#00f0ff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 uppercase tracking-wider block">
                    ENCRYPTED_MESSAGE_BODY *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe scope, project timeline, technical requirements, or inquiry parameters..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white focus:outline-none focus:border-[#00f0ff] transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Lock size={12} className="text-[#00ff66]" />
                    <span>256-BIT ENCRYPTION ACTIVE</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#00f0ff]/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#0b0f19] border-t-transparent rounded-full animate-spin" />
                        TRANSMITTING...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        EXECUTE TRANSMISSION
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </CyberCard>
        </div>

        {/* Right Column: Direct Coordinates & Live Terminal Feedback */}
        <div className="lg:col-span-5 space-y-6 font-mono text-xs">
          {/* Coordinates Card */}
          <CyberCard highlightHeader="DIRECT_COORDINATES" className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#0b0f19] border border-slate-800 rounded">
                <Mail className="text-[#00f0ff] shrink-0 mt-0.5" size={16} />
                <div>
                  <div className="text-slate-400 text-[10px]">PRIMARY DIRECT EMAIL</div>
                  <a href={`mailto:${settings.email}`} className="text-white hover:text-[#00f0ff] font-bold">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#0b0f19] border border-slate-800 rounded">
                <MapPin className="text-[#00ff66] shrink-0 mt-0.5" size={16} />
                <div>
                  <div className="text-slate-400 text-[10px]">GEOGRAPHIC LOCATION</div>
                  <div className="text-white font-bold">{settings.location}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase mb-2">
                VERIFIED NETWORK PROFILES
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={settings.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[#0b0f19] border border-slate-800 rounded text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 flex items-center gap-2 transition-all"
                >
                  <GitBranch size={14} className="text-[#00f0ff]" />
                  <span>GitHub</span>
                </a>
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[#0b0f19] border border-slate-800 rounded text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 flex items-center gap-2 transition-all"
                >
                  <Globe size={14} className="text-[#00f0ff]" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={settings.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[#0b0f19] border border-slate-800 rounded text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 flex items-center gap-2 transition-all col-span-2"
                >
                  <Send size={14} className="text-[#00ff66]" />
                  <span>Telegram Dispatch</span>
                </a>
              </div>
            </div>
          </CyberCard>

          {/* Live Terminal Telemetry Log */}
          <CyberCard highlightHeader="TRANSMISSION_TELEMETRY" className="p-4 bg-[#080c14]">
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-[#00ff66] font-bold pb-1 border-b border-slate-800">
                <Terminal size={12} />
                <span>ACTIVE SOCKET LOGS</span>
              </div>
              {terminalLogs.slice(-6).map((log, i) => (
                <div key={i} className="text-slate-400 leading-tight">
                  <span className="text-[#00f0ff]">&gt;</span> {log}
                </div>
              ))}
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
}
