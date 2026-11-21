import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Users,
  Mail,
  TrendingUp,
  Globe,
  Monitor,
  Briefcase,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

interface AnalyticsSummaryResponse {
  days: number;
  totals: {
    views: number;
    uniqueVisitors: number;
    contactSubmissions: number;
    prevViews: number;
    prevUniqueVisitors: number;
  };
  timeline: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    inquiries: number;
  }>;
  popularPages: Array<{ path: string; views: number }>;
  popularProjects: Array<{ id: string; title: string; category: string; clicks: number }>;
  popularArticles: Array<{ id: string; title: string; category: string; views: number }>;
  referrers: Array<{ source: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
}

interface AnalyticsOverviewTabProps {
  accentColor?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({
  accentColor = '#C59B63',
  showToast,
}) => {
  const [days, setDays] = useState<7 | 14 | 30 | 90 | 365>(30);
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<AnalyticsSummaryResponse>(`/api/analytics/summary?days=${days}`);
      setData(res);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load analytics summary', 'error');
    } finally {
      setLoading(false);
    }
  }, [days, showToast]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const csvText = await apiFetch<string>(`/api/analytics/summary?days=${days}&format=csv`);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ash-analytics-${days}d.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${days}-day CSV analytics report`);
    } catch (err: any) {
      showToast(err?.message || 'Could not export CSV report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatDelta = (curr: number, prev: number) => {
    if (prev <= 0) return curr > 0 ? `+${curr} new` : 'No prior baseline';
    const pct = Math.round(((curr - prev) / prev) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}% vs prior ${days}D`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-amber-400" />
            <span>Website Analytics &amp; Privacy Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            First-party analytics aggregated with rotating daily cryptographic salts (zero raw IP storage).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {([7, 14, 30, 90, 365] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  days === d ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadSummary}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || !data}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={13} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Page Views</span>
            <Eye size={14} className="text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{data?.totals.views ?? 0}</div>
          <div className="text-[11px] text-slate-500">
            {data ? formatDelta(data.totals.views, data.totals.prevViews) : 'Loading...'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Unique Daily Visitors</span>
            <Users size={14} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{data?.totals.uniqueVisitors ?? 0}</div>
          <div className="text-[11px] text-slate-500">
            {data ? formatDelta(data.totals.uniqueVisitors, data.totals.prevUniqueVisitors) : 'Loading...'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Contact Inquiries</span>
            <Mail size={14} className="text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-sky-400">{data?.totals.contactSubmissions ?? 0}</div>
          <div className="text-[11px] text-slate-500">Verified form submissions</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Engagement Rate</span>
            <TrendingUp size={14} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-indigo-400">
            {data && data.totals.views > 0
              ? ((data.totals.contactSubmissions / data.totals.views) * 100).toFixed(2)
              : '0.00'}
            %
          </div>
          <div className="text-[11px] text-slate-500">Inquiry conversion</div>
        </div>
      </div>

      {/* Main Traffic Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono">
              Traffic &amp; Visitor Trajectory ({days} Days)
            </h3>
            <p className="text-[11px] text-slate-500">Daily page views vs unique hashed visitors</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Views
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Unique Visitors
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              Inquiries
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="anViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => String(d).slice(5)}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="views" name="Page Views" stroke={accentColor} fill="url(#anViews)" strokeWidth={2} />
              <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#34D399" fill="url(#anUnique)" strokeWidth={2} />
              <Area type="monotone" dataKey="inquiries" name="Inquiries" stroke="#38BDF8" fill="none" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Pages */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono flex items-center gap-2">
            <Globe size={14} className="text-amber-400" />
            <span>Popular Pages</span>
          </h3>
          {!data || data.popularPages.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No route views tracked yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.popularPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <span className="font-mono text-slate-300 truncate">{p.path}</span>
                  <span className="font-semibold text-white shrink-0 ml-2">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Projects */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono flex items-center gap-2">
            <Briefcase size={14} className="text-sky-400" />
            <span>Top Projects Viewed</span>
          </h3>
          {!data || data.popularProjects.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No project interactions tracked yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.popularProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <div className="min-w-0">
                    <div className="text-slate-200 font-medium truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-500">{p.category}</div>
                  </div>
                  <span className="font-semibold text-sky-400 shrink-0 ml-2">{p.clicks}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Articles */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono flex items-center gap-2">
            <FileText size={14} className="text-emerald-400" />
            <span>Top Articles Read</span>
          </h3>
          {!data || data.popularArticles.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No article reads tracked yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.popularArticles.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <div className="min-w-0">
                    <div className="text-slate-200 font-medium truncate">{a.title}</div>
                    <div className="text-[10px] text-slate-500">{a.category}</div>
                  </div>
                  <span className="font-semibold text-emerald-400 shrink-0 ml-2">{a.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referrers, Devices, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono">Referrers</h3>
          {!data || data.referrers.length === 0 ? (
            <p className="text-xs text-slate-500">No referrer data yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.referrers.map((r) => (
                <div key={r.source} className="flex items-center justify-between text-slate-300">
                  <span className="truncate">{r.source}</span>
                  <span className="font-mono text-white">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono flex items-center gap-2">
            <Monitor size={14} className="text-slate-400" />
            <span>Device Split</span>
          </h3>
          {!data || data.devices.length === 0 ? (
            <p className="text-xs text-slate-500">No device data yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.devices.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-slate-300">
                  <span>{d.name}</span>
                  <span className="font-mono text-white">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold font-mono">Browsers</h3>
          {!data || data.browsers.length === 0 ? (
            <p className="text-xs text-slate-500">No browser data yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {data.browsers.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-slate-300">
                  <span>{b.name}</span>
                  <span className="font-mono text-white">{b.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
        <ShieldCheck size={16} className="shrink-0" />
        <span>
          Privacy-Compliant Mode Active: Visitor uniqueness is derived from a 24-hour rotating cryptographic salt and zero PII is written to disk.
        </span>
      </div>
    </div>
  );
};
