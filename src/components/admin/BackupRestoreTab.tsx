import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { SiteSettings, Project, Article, ContactMessage, MediaItem } from '../../types';

interface BackupRecordRow {
  id: string;
  type: 'export' | 'restore';
  createdAt: string;
  actorEmail: string;
  checksum: string;
  sizeBytes: number;
  counts: {
    projects: number;
    articles: number;
    services: number;
    messages: number;
    media: number;
  };
  status: string;
}

interface BackupRestoreTabProps {
  settings: SiteSettings;
  projects: Project[];
  articles: Article[];
  messages: ContactMessage[];
  mediaList: MediaItem[];
  onApplyRestore: (sanitizedSnapshot: Record<string, any>) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({
  settings,
  projects,
  articles,
  messages,
  mediaList,
  onApplyRestore,
  showToast,
}) => {
  const { role } = useAuth();
  const [history, setHistory] = useState<BackupRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Restore staging
  const [stagedBundle, setStagedBundle] = useState<Record<string, any> | null>(null);
  const [stagedFileName, setStagedFileName] = useState('');
  const [restoreOtp, setRestoreOtp] = useState('');
  const [restoring, setRestoring] = useState(false);

  const isPrivileged = role === 'super_admin' || role === 'admin';
  const isSuperAdmin = role === 'super_admin';

  const loadHistory = useCallback(async () => {
    if (!isPrivileged) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ backups: BackupRecordRow[] }>('/api/backup/history');
      setHistory(res.backups || []);
    } catch (err: any) {
      showToast(err?.message || 'Could not load backup history', 'error');
    } finally {
      setLoading(false);
    }
  }, [isPrivileged, showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const snapshot = {
        siteSettings: settings,
        projects,
        articles,
        messages,
        media: mediaList,
      };
      const res = await apiFetch<{
        record: BackupRecordRow;
        checksum: string;
        sanitizedSnapshot: Record<string, any>;
      }>('/api/backup/record-export', {
        method: 'POST',
        body: { snapshot },
      });

      const archive = {
        exportedAt: res.record.createdAt,
        checksum: res.checksum,
        snapshot: res.sanitizedSnapshot,
      };

      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ash-portfolio-backup-${res.record.createdAt.slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Exported verified backup archive (SHA-256 ${res.checksum.slice(0, 10)}...)`);
      await loadHistory();
    } catch (err: any) {
      showToast(err?.message || 'Backup export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.snapshot) {
        showToast('Invalid archive format: missing "snapshot" root object.', 'error');
        return;
      }
      setStagedBundle(parsed);
      setStagedFileName(file.name);
      setRestoreOtp('');
    } catch {
      showToast('Could not parse JSON backup file.', 'error');
    }
  };

  const handleRestoreConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagedBundle) return;
    if (!/^\d{6}$/.test(restoreOtp)) {
      showToast('Enter a 6-digit Google Authenticator code to authorize restore.', 'error');
      return;
    }
    setRestoring(true);
    try {
      const res = await apiFetch<{
        verified: boolean;
        checksum: string;
        sanitizedSnapshot: Record<string, any>;
      }>('/api/backup/validate-restore', {
        method: 'POST',
        body: {
          bundle: stagedBundle,
          totpCode: restoreOtp,
        },
      });
      await onApplyRestore(res.sanitizedSnapshot);
      setStagedBundle(null);
      setStagedFileName('');
      setRestoreOtp('');
      showToast('Archive verified & portfolio data restored successfully');
      await loadHistory();
    } catch (err: any) {
      showToast(err?.message || 'Archive restore validation failed', 'error');
    } finally {
      setRestoring(false);
    }
  };

  if (!isPrivileged) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <Lock size={26} className="mx-auto text-amber-400" />
        <h3 className="text-base font-semibold text-white">Admin Access Required</h3>
        <p className="text-xs text-slate-400">
          Backup &amp; Restore operations are restricted to Admin and Super Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database size={20} className="text-amber-400" />
            <span>Backup &amp; Verified Archive Restore</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate SHA-256 verified sanitized portfolio snapshots (all secrets/credentials stripped automatically).
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Snapshot */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Download size={16} className="text-emerald-400" />
            <span>Export Portfolio Snapshot</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Packages your site profile, services, projects, articles, contact messages, and media catalog into a checksum-signed JSON bundle.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-lg font-bold text-white">{projects.length}</div>
              <div className="text-[10px] text-slate-500">Projects</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-lg font-bold text-white">{articles.length}</div>
              <div className="text-[10px] text-slate-500">Articles</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-lg font-bold text-white">{settings.services?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Services</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-lg font-bold text-white">{mediaList.length}</div>
              <div className="text-[10px] text-slate-500">Media Items</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>{exporting ? 'Signing & Downloading...' : 'Download Signed JSON Archive'}</span>
          </button>
        </div>

        {/* Restore Snapshot */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Upload size={16} className="text-amber-400" />
            <span>Validate &amp; Restore Archive</span>
          </div>

          {!isSuperAdmin ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>Archive restoration is restricted strictly to the Super Admin with 2FA step-up approval.</span>
            </div>
          ) : (
            <>
              <p className="text-slate-400 leading-relaxed">
                Upload a previously exported archive. The server checks the SHA-256 signature and strips untrusted secret fields before syncing back into Firestore.
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer">
                <Upload size={14} />
                <span>{stagedFileName ? `Selected: ${stagedFileName}` : 'Choose Backup .json File'}</span>
                <input type="file" accept=".json,application/json" onChange={handleFilePick} className="hidden" />
              </label>

              {stagedBundle && (
                <form
                  onSubmit={handleRestoreConfirm}
                  className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <ShieldCheck size={15} />
                    <span>Archive Ready for Verification</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Checksum: {stagedBundle.checksum ? String(stagedBundle.checksum).slice(0, 18) + '...' : 'Unsigned'}
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Step-Up 6-Digit OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={restoreOtp}
                        onChange={(e) => setRestoreOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-40 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono tracking-[0.25em] text-center"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={restoring}
                      className="px-4 py-2 rounded-xl font-semibold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                    >
                      {restoring ? 'Verifying & Restoring...' : 'Verify & Restore'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStagedBundle(null);
                        setStagedFileName('');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* History Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Backup &amp; Restore History</h3>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No archive operations logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">SHA-256 Checksum</th>
                  <th className="p-3">Contents</th>
                  <th className="p-3">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 uppercase font-mono text-[11px] text-white">{item.type}</td>
                    <td className="p-3 font-mono text-slate-300">{item.actorEmail}</td>
                    <td className="p-3 font-mono text-amber-300">{item.checksum.slice(0, 14)}...</td>
                    <td className="p-3 text-slate-400">
                      {item.counts.projects}P / {item.counts.articles}A / {item.counts.services}S
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 size={12} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
