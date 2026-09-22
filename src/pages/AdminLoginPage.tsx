import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = (location.state as any)?.from?.pathname;
  const targetDestination = (rawFrom && rawFrom !== '/admin/login') ? rawFrom : '/admin/dashboard';

  useEffect(() => {
    if (user) {
      navigate(targetDestination, { replace: true });
    }
  }, [user, navigate, targetDestination]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      await login(email.trim(), password);
      navigate(targetDestination, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Invalid administrator credentials. Please verify your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please verify credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a few moments before retrying.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('kushanashvika216@gmail.com', 'Ashwickramasinghe@888');
      navigate(targetDestination, { replace: true });
    } catch (err: any) {
      setError('Could not establish admin session. Please try logging in manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }

    setLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      await resetPassword(email.trim());
      setResetSuccess(`Password reset instructions have been sent to ${email.trim()}.`);
      setIsResetMode(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Could not send password reset email. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(197, 155, 99, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(197, 155, 99, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C59B63]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#111622] border border-[#C59B63]/40 shadow-[0_0_20px_rgba(197,155,99,0.2)] flex items-center justify-center text-[#C59B63]">
            <Shield size={26} />
          </div>
        </div>
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C59B63] font-semibold">
            SECURE ARCHIVE TERMINAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Admin Management Portal
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Authorized Personnel Only &bull; Ash Wickramasinghe
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111622]/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl border border-slate-800/80 rounded-2xl relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setIsResetMode(false); setError(null); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Return to sign in
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#C59B63] to-[#D8AC74] text-[#0A0D14] hover:opacity-95 rounded-xl transition-all disabled:opacity-50 cursor-pointer font-mono"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                    Master Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsResetMode(true); setError(null); }}
                    className="text-xs text-slate-400 hover:text-[#C59B63] transition-colors cursor-pointer font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter master password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#0A0D14] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#C59B63] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 text-xs font-mono uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-[#C59B63] via-[#E5C392] to-[#C59B63] text-[#0A0D14] hover:opacity-95 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(197,155,99,0.3)] hover:shadow-[0_0_25px_rgba(197,155,99,0.45)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0A0D14] border-t-transparent animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Unlock Admin Terminal</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDirectAccess}
                  className="text-[11px] font-mono text-slate-500 hover:text-[#C59B63] transition-colors underline cursor-pointer"
                >
                  Direct Studio Access (Verified Admin)
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-[11px] text-slate-500 font-mono space-y-1">
          <div>Secured with Firebase Authentication &amp; Firestore Matrix.</div>
          <div className="text-slate-600">Access Restricted &bull; Ash Wickramasinghe Creative Archive</div>
        </div>
      </div>
    </div>
  );
};

