import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  ShieldCheck,
  Smartphone,
  KeyRound,
  Copy,
  Check,
  Download,
  UserPlus,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAuth, AdminUserProfile, AdminSessionMeta } from '../context/AuthContext';
import { apiFetch } from '../lib/apiClient';
import { loginWithGooglePopup } from '../lib/firebase';

type AuthStep =
  | 'loading'
  | 'bootstrap'
  | 'invite'
  | 'login'
  | 'setup_2fa'
  | 'recovery_codes'
  | 'verify_2fa';

interface StatusResponse {
  needsBootstrap: boolean;
  primaryOwnerEmail: string;
  firebaseProjectId: string;
  inviteValid: boolean;
  inviteDetails: {
    email: string;
    name: string;
    role: string;
  } | null;
}

interface AuthChallengeResponse {
  requires2fa?: boolean;
  requiresSetup2fa?: boolean;
  challengeToken: string;
  admin: AdminUserProfile;
}

interface PendingCompletedSession {
  sessionToken: string;
  admin: AdminUserProfile;
  session: AdminSessionMeta;
}

export const AdminLoginPage: React.FC = () => {
  const { isAdmin, completeSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';

  const rawFrom = (location.state as any)?.from?.pathname;
  const targetDestination = rawFrom && rawFrom !== '/admin/login' ? rawFrom : '/admin/dashboard';

  const [step, setStep] = useState<AuthStep>('loading');
  const [statusInfo, setStatusInfo] = useState<StatusResponse | null>(null);

  // Credentials / Form inputs
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA Challenge State
  const [challengeToken, setChallengeToken] = useState('');
  const [pendingAdmin, setPendingAdmin] = useState<AdminUserProfile | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [useRecoveryMode, setUseRecoveryMode] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState<string[]>([]);
  const [pendingSession, setPendingSession] = useState<PendingCompletedSession | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && step !== 'recovery_codes') {
      navigate(targetDestination, { replace: true });
    }
  }, [isAdmin, step, navigate, targetDestination]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const query = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
        const status = await apiFetch<StatusResponse>(`/api/auth/status${query}`);
        if (!active) return;
        setStatusInfo(status);
        if (inviteToken && status.inviteValid && status.inviteDetails) {
          setEmail(status.inviteDetails.email);
          setName(status.inviteDetails.name);
          setStep('invite');
        } else if (inviteToken && !status.inviteValid) {
          setError('This administrator invitation link is invalid, expired, or has already been used.');
          setStep(status.needsBootstrap ? 'bootstrap' : 'login');
        } else if (status.needsBootstrap) {
          setEmail(status.primaryOwnerEmail || '');
          setName('Ash Wickramasinghe');
          setStep('bootstrap');
        } else {
          setStep('login');
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Unable to connect to authentication server.');
        setStep('login');
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [inviteToken]);

  const initiate2faStep = async (res: AuthChallengeResponse) => {
    setChallengeToken(res.challengeToken);
    setPendingAdmin(res.admin);
    setOtpCode('');
    setRecoveryCodeInput('');
    setUseRecoveryMode(false);

    if (res.requiresSetup2fa) {
      const setup = await apiFetch<{
        qrDataUrl: string;
        manualSecret: string;
        otpauthUri: string;
        accountEmail: string;
      }>('/api/auth/2fa/setup', {
        method: 'POST',
        body: { challengeToken: res.challengeToken },
      });
      setQrDataUrl(setup.qrDataUrl);
      setManualSecret(setup.manualSecret);
      setStep('setup_2fa');
    } else {
      setStep('verify_2fa');
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError('Master password must be at least 10 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<AuthChallengeResponse>('/api/auth/bootstrap', {
        method: 'POST',
        body: { email: email.trim(), password, name: name.trim() || undefined },
      });
      await initiate2faStep(res);
    } catch (err: any) {
      setError(err?.message || 'Could not initialize primary owner credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<AuthChallengeResponse>('/api/auth/invite/accept', {
        method: 'POST',
        body: { inviteToken, password, name: name.trim() || undefined },
      });
      await initiate2faStep(res);
    } catch (err: any) {
      setError(err?.message || 'Could not accept administrator invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AuthChallengeResponse>('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      });
      await initiate2faStep(res);
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { user } = await loginWithGooglePopup();
      const idToken = await user.getIdToken();
      const res = await apiFetch<AuthChallengeResponse>('/api/auth/firebase-verify', {
        method: 'POST',
        body: { idToken },
      });
      await initiate2faStep(res);
    } catch (err: any) {
      const msg = err?.code === 'auth/popup-closed-by-user'
        ? 'Google sign-in window was closed before completing.'
        : err?.message || 'Google authentication could not be verified.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConfirm2faSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = otpCode.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleaned)) {
      setError('Enter the 6-digit verification code from Google Authenticator.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{
        sessionToken: string;
        session: AdminSessionMeta;
        admin: AdminUserProfile;
        recoveryCodes: string[];
      }>('/api/auth/2fa/confirm', {
        method: 'POST',
        body: { challengeToken, code: cleaned },
      });
      setGeneratedRecoveryCodes(res.recoveryCodes || []);
      setPendingSession({
        sessionToken: res.sessionToken,
        admin: res.admin,
        session: res.session,
      });
      setStep('recovery_codes');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Ensure device clock is synced.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (useRecoveryMode) {
        const rec = recoveryCodeInput.trim();
        if (!rec) {
          setError('Enter one of your single-use recovery codes.');
          setLoading(false);
          return;
        }
        const res = await apiFetch<{
          sessionToken: string;
          session: AdminSessionMeta;
          admin: AdminUserProfile;
        }>('/api/auth/2fa/recovery', {
          method: 'POST',
          body: { challengeToken, recoveryCode: rec },
        });
        completeSession(res.sessionToken, res.admin, res.session);
        navigate(targetDestination, { replace: true });
      } else {
        const cleaned = otpCode.replace(/\s+/g, '');
        if (!/^\d{6}$/.test(cleaned)) {
          setError('Enter a valid 6-digit authenticator code.');
          setLoading(false);
          return;
        }
        const res = await apiFetch<{
          sessionToken: string;
          session: AdminSessionMeta;
          admin: AdminUserProfile;
        }>('/api/auth/2fa/verify', {
          method: 'POST',
          body: { challengeToken, code: cleaned },
        });
        completeSession(res.sessionToken, res.admin, res.session);
        navigate(targetDestination, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const finalizeSetupAndEnter = () => {
    if (pendingSession) {
      completeSession(pendingSession.sessionToken, pendingSession.admin, pendingSession.session);
      navigate(targetDestination, { replace: true });
    }
  };

  const copyManualSecret = () => {
    if (!manualSecret) return;
    navigator.clipboard.writeText(manualSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(generatedRecoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const content = [
      'ASH WICKRAMASINGHE STUDIO — 2FA RECOVERY CODES',
      `Account: ${pendingAdmin?.email || email}`,
      `Generated: ${new Date().toISOString()}`,
      '',
      'Each recovery code can be used ONCE if you lose access to Google Authenticator.',
      'Store these offline in a secure password manager.',
      '',
      ...generatedRecoveryCodes,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ash-studio-2fa-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-100">
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(197, 155, 99, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(197, 155, 99, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C59B63]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mb-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Public Portfolio</span>
          </Link>
        </div>

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#111622] border border-[#C59B63]/40 shadow-[0_0_24px_rgba(197,155,99,0.2)] flex items-center justify-center text-[#C59B63]">
            {step === 'setup_2fa' || step === 'verify_2fa' ? (
              <Smartphone size={26} />
            ) : step === 'recovery_codes' ? (
              <ShieldCheck size={26} />
            ) : (
              <Shield size={26} />
            )}
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C59B63] font-semibold block">
            {step === 'bootstrap'
              ? 'INITIAL OWNER ENROLLMENT'
              : step === 'invite'
              ? 'ADMINISTRATOR INVITATION'
              : step === 'setup_2fa'
              ? 'MANDATORY 2FA ENROLLMENT'
              : step === 'recovery_codes'
              ? 'BACKUP RECOVERY VAULT'
              : step === 'verify_2fa'
              ? 'TWO-FACTOR AUTHENTICATION'
              : 'SECURE STUDIO GATEWAY'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {step === 'bootstrap'
              ? 'Initialize Super Admin'
              : step === 'invite'
              ? 'Activate Admin Access'
              : step === 'setup_2fa'
              ? 'Link Google Authenticator'
              : step === 'recovery_codes'
              ? 'Save Your Recovery Codes'
              : step === 'verify_2fa'
              ? 'Authenticator Verification'
              : 'Admin Management Portal'}
          </h1>
          <p className="text-xs text-slate-400">
            Ash Wickramasinghe Studio &bull; Zero-Trust Encrypted Control Plane
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111622]/95 backdrop-blur-xl py-8 px-6 sm:px-9 shadow-2xl border border-slate-800/80 rounded-2xl relative space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-400 text-xs font-mono">
              <RefreshCw size={20} className="animate-spin text-[#C59B63]" />
              <span>Checking security gateway status...</span>
            </div>
          )}

          {/* BOOTSTRAP FIRST SUPER ADMIN */}
          {step === 'bootstrap' && (
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                No master password is set yet for <strong className="text-white">{statusInfo?.primaryOwnerEmail}</strong>. Set your strong password below, then scan the QR code to activate Google Authenticator 2FA.
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Primary Owner Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  New Master Password (min 10 chars)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create strong master password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Master Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter master password"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Initializing Vault...' : 'Continue to 2FA Setup'}</span>
                <ArrowRight size={14} />
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono">
                  <span className="bg-[#111622] px-3 text-slate-500">Or verify with Google</span>
                </div>
              </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="font-bold text-amber-400">G</span>
                <span>{googleLoading ? 'Connecting Google...' : 'Sign in with Google Account'}</span>
              </button>
            </form>
          )}

          {/* INVITE ACCEPTANCE */}
          {step === 'invite' && (
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-start gap-2.5">
                <UserPlus size={16} className="shrink-0 mt-0.5 text-sky-400" />
                <div>
                  Invited as <strong className="uppercase text-white">{statusInfo?.inviteDetails?.role}</strong> for{' '}
                  <span className="font-mono text-white">{email}</span>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Create Password (min 10 chars)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={10}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-[#C59B63] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Activating...' : 'Activate & Configure 2FA'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STANDARD LOGIN (EMAIL + PASSWORD OR GOOGLE) */}
          {step === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      placeholder="admin@ash-wickramasinghe.site"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter master password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Continue to 2FA Verification</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono">
                  <span className="bg-[#111622] px-3 text-slate-500">Or verify via Google</span>
                </div>
              </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="font-bold text-amber-400">G</span>
                <span>{googleLoading ? 'Verifying Google Identity...' : 'Continue with Google Sign-In'}</span>
              </button>
            </div>
          )}

          {/* MANDATORY 2FA SETUP STEP (QR + MANUAL KEY + VERIFY) */}
          {step === 'setup_2fa' && (
            <form onSubmit={handleConfirm2faSetup} className="space-y-5">
              <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  Scan this QR code with <strong className="text-white">Google Authenticator</strong> (or Authy / 1Password) for{' '}
                  <span className="font-mono text-[#C59B63]">{pendingAdmin?.email || email}</span>:
                </p>
              </div>

              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-2xl shadow-lg">
                    <img src={qrDataUrl} alt="Google Authenticator QR Code" className="w-44 h-44" />
                  </div>
                </div>
              )}

              {manualSecret && (
                <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                    Manual Setup Key (Time-Based TOTP)
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-amber-300 break-all select-all">
                      {manualSecret}
                    </code>
                    <button
                      type="button"
                      onClick={copyManualSecret}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
                      title="Copy secret key"
                    >
                      {copiedSecret ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Enter 6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full py-3 px-4 text-center text-xl tracking-[0.45em] font-mono bg-[#0A0D14] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C59B63]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Activating 2FA...' : 'Activate 2FA & Generate Recovery Codes'}</span>
                <ShieldCheck size={15} />
              </button>
            </form>
          )}

          {/* ONE-TIME RECOVERY CODES DISPLAY AFTER ENROLLMENT */}
          {step === 'recovery_codes' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  Google Authenticator is now active. Save these 10 single-use recovery codes now — they will not be displayed again.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-[#0A0D14] border border-slate-800 font-mono text-xs text-amber-200">
                {generatedRecoveryCodes.map((code) => (
                  <div key={code} className="px-2.5 py-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center select-all">
                    {code}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={copyRecoveryCodes}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedCodes ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadRecoveryCodes}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download .txt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={finalizeSetupAndEnter}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>I Saved These Codes &mdash; Enter Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* STANDARD 2FA OTP / RECOVERY VERIFICATION */}
          {step === 'verify_2fa' && (
            <form onSubmit={handleVerify2fa} className="space-y-5">
              <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="truncate font-mono">{pendingAdmin?.email}</span>
                <span className="px-2 py-0.5 rounded bg-[#C59B63]/15 text-[#C59B63] text-[10px] font-mono uppercase">
                  {pendingAdmin?.role}
                </span>
              </div>

              {!useRecoveryMode ? (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    6-Digit Google Authenticator Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full py-3 px-4 text-center text-2xl tracking-[0.45em] font-mono bg-[#0A0D14] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C59B63]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Single-Use Backup Recovery Code
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-[#0A0D14] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C59B63]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!useRecoveryMode && otpCode.length !== 6)}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-[0.18em] font-bold bg-[#C59B63] text-[#0A0D14] hover:bg-[#d6ae76] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying...' : 'Unlock Studio Dashboard'}</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  &larr; Switch Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseRecoveryMode(!useRecoveryMode);
                    setError(null);
                  }}
                  className="text-[#C59B63] hover:underline cursor-pointer"
                >
                  {useRecoveryMode ? 'Use 6-digit OTP instead' : 'Lost device? Use recovery code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-7 text-center text-[11px] text-slate-500 font-mono space-y-1">
          <div>Protected by PBKDF2/Scrypt Vault, TOTP 2FA &amp; Replay Prevention</div>
          <div className="text-slate-600">Authorized Personnel Only &bull; ash-wickramasinghe.site</div>
        </div>
      </div>
    </div>
  );
};
