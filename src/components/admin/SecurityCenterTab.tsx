import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Monitor,
  Smartphone,
  LogOut,
  RefreshCw,
  Lock,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Search,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';
import { AdminUserProfile, useAuth } from '../../context/AuthContext';

interface ActiveSessionRow {
  id: string;
  adminId: string;
  email: string;
  name: string;
  role: string;
  browser: string;
  os: string;
  deviceType: string;
  maskedIp: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

interface SecurityEventRow {
  id: string;
  type: string;
  email: string;
  role?: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  maskedIp: string;
  timestamp: string;
}

interface SecurityOverviewResponse {
  currentAdmin: AdminUserProfile;
  sessions: ActiveSessionRow[];
  securityEvents: SecurityEventRow[];
  lockouts: AdminUserProfile[];
  unreadNotificationsCount: number;
}

interface SecurityCenterTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshHeaderNotifications?: () => void;
}

export const SecurityCenterTab: React.FC<SecurityCenterTabProps> = ({
  showToast,
  onRefreshHeaderNotifications,
}) => {
  const { refreshSession } = useAuth();
  const [data, setData] = useState<SecurityOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Recovery codes regeneration
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Audit filter
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [logSearch, setLogSearch] = useState('');

  const loadSecurity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<SecurityOverviewResponse>('/api/security/overview');
      setData(res);
    } catch (err: any) {
      showToast(err?.message || 'Could not load security telemetry', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSecurity();
  }, [loadSecurity]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiFetch(`/api/security/sessions/${sessionId}/revoke`, { method: 'POST', body: {} });
      showToast('Session terminated successfully');
      await loadSecurity();
      onRefreshHeaderNotifications?.();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke session', 'error');
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const res = await apiFetch<{ success: boolean; revokedCount: number }>(
        '/api/security/sessions/revoke-others',
        { method: 'POST', body: {} }
      );
      showToast(`Signed out ${res.revokedCount} other active session(s)`);
      await loadSecurity();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke sessions', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 10) {
      showToast('New password must be at least 10 characters.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(passwordOtp)) {
      showToast('Step-up verification requires a 6-digit authenticator code.', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await apiFetch('/api/auth/password/change', {
        method: 'POST',
        body: {
          currentPassword: currentPassword || undefined,
          newPassword,
          totpCode: passwordOtp,
        },
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordOtp('');
      showToast('Master password updated securely');
      await loadSecurity();
      await refreshSession();
    } catch (err: any) {
      showToast(err?.message || 'Password change rejected', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRegenerateRecoveryCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(recoveryOtp)) {
      showToast('Enter a 6-digit Google Authenticator code.', 'error');
      return;
    }
    setRegenerating(true);
    try {
      const res = await apiFetch<{ recoveryCodes: string[] }>('/api/security/2fa/regenerate-recovery', {
        method: 'POST',
        body: { totpCode: recoveryOtp },
      });
      setFreshCodes(res.recoveryCodes);
      setRecoveryOtp('');
      showToast('Generated 10 fresh recovery codes');
      await loadSecurity();
      await refreshSession();
    } catch (err: any) {
      showToast(err?.message || 'Could not regenerate recovery codes', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const filteredEvents = (data?.securityEvents || []).filter((ev) => {
    if (severityFilter !== 'all' && ev.severity !== severityFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        ev.email.toLowerCase().includes(q) ||
        ev.message.toLowerCase().includes(q) ||
        ev.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-amber-400" />
            <span>Security Center, Sessions &amp; Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor active sessions, manage 2FA recovery codes, update credentials, and review security events.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSecurity}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Security State</span>
        </button>
      </div>

      {/* Posture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Google Authenticator</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {data?.currentAdmin.totpEnabled ? 'Active & Enforced' : 'Pending'}
          </div>
          <div className="text-[11px] text-slate-500">Replay step protection enabled</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Recovery Codes Left</span>
            <KeyRound size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.currentAdmin.recoveryCodesRemaining ?? 0} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500">Single-use emergency tokens</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Active Sessions</span>
            <Monitor size={15} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.sessions.length ?? 0}</div>
          <div className="text-[11px] text-slate-500">Authenticated devices</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Locked Accounts</span>
            <ShieldAlert size={15} className={data?.lockouts.length ? 'text-rose-400' : 'text-slate-500'} />
          </div>
          <div className="text-2xl font-bold text-white">{data?.lockouts.length ?? 0}</div>
          <div className="text-[11px] text-slate-500">Auto-lock after 5 failed attempts</div>
        </div>
      </div>

      {/* Password Update & Recovery Codes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock size={16} className="text-amber-400" />
            <span>Update Master Password</span>
          </div>
          <p className="text-slate-400">
            Requires your current password and a fresh 6-digit Google Authenticator code.
          </p>

          {data?.currentAdmin.hasPassword && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">New Password (min 10)</label>
              <input
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={10}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Step-Up 6-Digit OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="000000"
              value={passwordOtp}
              onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-40 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tracking-[0.25em] text-center"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-5 py-2.5 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Recovery Codes Regeneration */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <KeyRound size={16} className="text-amber-400" />
            <span>Regenerate 2FA Recovery Codes</span>
          </div>
          <p className="text-slate-400">
            Generating a new batch invalidates any unused previous recovery codes. Verify with your current 6-digit OTP.
          </p>

          <form onSubmit={handleRegenerateRecoveryCodes} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="000000"
                value={recoveryOtp}
                onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-40 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tracking-[0.25em] text-center"
              />
            </div>
            <button
              type="submit"
              disabled={regenerating}
              className="px-4 py-2.5 rounded-xl font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {regenerating ? 'Generating...' : 'Generate New Codes'}
            </button>
          </form>

          {freshCodes && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span>Save these 10 codes offline now:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(freshCodes.join('\n'));
                      setCopiedCodes(true);
                      setTimeout(() => setCopiedCodes(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedCodes ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCodes ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([freshCodes.join('\n')], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'ash-recovery-codes.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    <Download size={12} />
                    <span>.txt</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-slate-200">
                {freshCodes.map((c) => (
                  <div key={c} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-center">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Sessions</h3>
            <p className="text-xs text-slate-400">Devices currently holding verified 2FA access tokens</p>
          </div>
          {(data?.sessions.length || 0) > 1 && (
            <button
              type="button"
              onClick={handleRevokeOtherSessions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out All Other Devices</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {(data?.sessions || []).map((s) => (
            <div key={s.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
                  {s.deviceType === 'Mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex flex-wrap items-center gap-2">
                    <span>
                      {s.browser} on {s.os}
                    </span>
                    {s.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                        Current Session
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {s.role}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    {s.email} &bull; IP {s.maskedIp} &bull; Last active {new Date(s.lastActiveAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(s.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs cursor-pointer self-start sm:self-center"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security & Login Audit Logs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Security &amp; Login Audit Trail</h3>
            <p className="text-xs text-slate-400">Tamper-resistant chronological audit ledger</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filter email or event..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer ${
                    severityFilter === sev ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Event Details</th>
                <th className="p-3">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredEvents.slice(0, 60).map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-950/40">
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        ev.severity === 'critical'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : ev.severity === 'warning'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {ev.severity === 'critical' && <AlertTriangle size={10} />}
                      {ev.severity}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{ev.email}</td>
                  <td className="p-3 text-slate-200">{ev.message}</td>
                  <td className="p-3 font-mono text-slate-500">{ev.maskedIp}</td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No matching security events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
