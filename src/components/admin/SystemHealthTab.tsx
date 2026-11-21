import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  ShieldCheck,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cloud,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

interface HealthResponse {
  status: string;
  timestamp: string;
  diagnostics?: {
    nodeVersion: string;
    uptimeSeconds: number;
    memoryRssMb: number;
    memoryHeapMb: number;
    uploadsWritable: boolean;
    securityVault: string;
    totpReplayProtection: string;
    activeSessionsCount: number;
    firebaseConfigured: boolean;
  };
}

interface SystemHealthTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ showToast }) => {
  const { firebaseUser, linkGoogleCloudSync } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<HealthResponse>('/api/health');
      setHealth(res);
    } catch (err: any) {
      showToast(err?.message || 'Could not fetch health diagnostics', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleLinkCloudSync = async () => {
    setSyncingGoogle(true);
    try {
      await linkGoogleCloudSync();
      showToast('Firebase Cloud Firestore write session linked');
    } catch (err: any) {
      showToast(err?.message || 'Could not link Google Cloud Sync', 'error');
    } finally {
      setSyncingGoogle(false);
    }
  };

  const d = health?.diagnostics;

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const securityChecks = [
    { label: 'Security Vault Encryption', value: d?.securityVault || 'AES-256-GCM', ok: Boolean(d) },
    { label: 'TOTP Replay Step Guard', value: d?.totpReplayProtection || 'Active', ok: Boolean(d) },
    { label: 'Uploads Directory Writable', value: d?.uploadsWritable ? 'Writable (Magic-Byte Guarded)' : 'Check Permissions', ok: Boolean(d?.uploadsWritable) },
    { label: 'Firebase Project Config', value: d?.firebaseConfigured ? 'Connected' : 'Missing Config', ok: Boolean(d?.firebaseConfigured) },
    {
      label: 'Firestore CMS Write Session',
      value: firebaseUser?.emailVerified ? `Linked (${firebaseUser.email})` : 'Not Linked in Browser',
      ok: Boolean(firebaseUser?.emailVerified),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-amber-400" />
            <span>System Health &amp; Infrastructure Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Runtime telemetry, upload storage checks, vault health, and Firebase Cloud Firestore sync status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Run Diagnostics</span>
        </button>
      </div>

      {/* Runtime Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Server Status</span>
            <Server size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 uppercase">{health?.status || 'Unknown'}</div>
          <div className="text-[11px] text-slate-500">Node {d?.nodeVersion || '—'}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Process Uptime</span>
            <Activity size={15} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{d ? formatUptime(d.uptimeSeconds) : '—'}</div>
          <div className="text-[11px] text-slate-500">Active sessions: {d?.activeSessionsCount ?? 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Memory Footprint</span>
            <Cpu size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{d ? `${d.memoryHeapMb} MB` : '—'}</div>
          <div className="text-[11px] text-slate-500">RSS {d ? `${d.memoryRssMb} MB` : '—'}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Media Storage</span>
            <HardDrive size={15} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{d?.uploadsWritable ? 'Ready' : 'Check'}</div>
          <div className="text-[11px] text-slate-500">Local disk + Firestore mirror</div>
        </div>
      </div>

      {/* Security & Integration Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck size={17} className="text-emerald-400" />
            <span>Security &amp; Integration Posture</span>
          </div>

          {!firebaseUser?.emailVerified && (
            <button
              type="button"
              onClick={handleLinkCloudSync}
              disabled={syncingGoogle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Cloud size={14} />
              <span>{syncingGoogle ? 'Linking...' : 'Link Google Cloud Sync'}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {securityChecks.map((chk) => (
            <div key={chk.label} className="py-3 flex items-center justify-between gap-4">
              <span className="text-slate-300 font-medium">{chk.label}</span>
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${
                  chk.ok ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {chk.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                <span>{chk.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
