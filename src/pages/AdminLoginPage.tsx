import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Terminal, 
  Sparkles,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CyberCard } from '../components/CyberCard';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('kushanashvika216@gmail.com');
  const [password, setPassword] = useState('Ashwickramasinghe@888');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Google authentication error:", err);
      let msg = "Google sign-in encountered an issue.";
      if (err.code === 'auth/popup-closed-by-user') {
        msg = "Authentication window was closed before completing authorization.";
      } else if (err.code === 'auth/popup-blocked') {
        msg = "Browser blocked the authentication popup. Please allow popups for this site.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter valid credentials.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login authentication error:", err);
      let msg = "Authentication failed. Verify credentials and permissions.";
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        msg = "Firebase Email/Password provider is not configured for this project. Please authenticate via 'Sign In with Google' below.";
      } else if (err.code === 'auth/wrong-password') {
        msg = "INVALID PASSWORD: Cryptographic check failed.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "TOO MANY ATTEMPTS: Access locked momentarily for security.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePreFill = () => {
    setEmail('kushanashvika216@gmail.com');
    setPassword('Ashwickramasinghe@888');
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center relative z-10 font-sans">
      <div className="w-full max-w-md">
        <CyberCard highlightHeader="ROOT_SECURITY_TERMINAL" className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-[#111827] border border-[#00f0ff] rounded-xl flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-sans tracking-wide">
              Admin Authentication
            </h1>
            <p className="text-slate-400 font-mono text-xs">
              SYS_LEVEL: 0 // ROOT CONTROL CONSOLE
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded flex flex-col gap-2 text-red-300 font-mono text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {(error.includes('Google') || error.includes('configuration-not-found')) && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="mt-1 self-start px-3 py-1 bg-[#00f0ff] text-[#0b0f19] font-bold rounded hover:bg-[#00f0ff]/90 flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck size={14} />
                  Authorize with Google Now
                </button>
              )}
            </div>
          )}

          {/* Primary Recommended Auth: Google One-Click (Configured Firebase Provider) */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 bg-[#131b2e] hover:bg-[#1a2642] border border-[#00f0ff]/50 hover:border-[#00f0ff] text-white font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                  <span>NEGOTIATING GOOGLE OAUTH...</span>
                </>
              ) : (
                <>
                  {/* Google G Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Google (Admin)</span>
                  <ArrowRight size={14} className="text-[#00f0ff] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-center text-[10px] text-slate-400 font-mono">
              <span className="h-px flex-1 bg-slate-800" />
              <span className="uppercase tracking-widest text-slate-500">// OR CIPHER ACCESS //</span>
              <span className="h-px flex-1 bg-slate-800" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 uppercase tracking-wider block">
                ADMIN_IDENTIFIER (EMAIL)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kushanashvika216@gmail.com"
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white focus:outline-none focus:border-[#00f0ff] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 uppercase tracking-wider block">
                ACCESS_PASSPHRASE
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded text-white pr-10 focus:outline-none focus:border-[#00f0ff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 bg-[#111827] border border-slate-700 hover:border-[#00f0ff] text-slate-200 hover:text-white font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-[#162032] disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING CREDENTIALS...
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  Authorize via Passphrase
                </>
              )}
            </button>
          </form>

          {/* Master Credentials Fast-Fill helper */}
          <div className="pt-4 border-t border-slate-800/80 text-center font-mono">
            <button
              type="button"
              onClick={handlePreFill}
              className="text-[11px] text-[#00f0ff]/80 hover:text-[#00f0ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              Set Designated Admin Coordinates
            </button>
            <div className="text-[10px] text-slate-400 mt-1">
              Admin: kushanashvika216@gmail.com
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
