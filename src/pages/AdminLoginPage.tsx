import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CyberCard } from '../components/CyberCard';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('kushanashvika216@gmail.com');
  const [password, setPassword] = useState('Ashwickramasinghe@888');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
      if (err.code === 'auth/wrong-password') {
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
            <h1 className="text-2xl font-extrabold text-white font-sans">
              Admin Authentication
            </h1>
            <p className="text-slate-400 font-mono text-xs">
              AUTHORIZATION PROTOCOL // SECURE CMS ACCESS
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded flex items-start gap-2.5 text-red-300 font-mono text-xs">
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00f0ff] text-[#0b0f19] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-[#00f0ff]/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 transition-all cursor-pointer mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0b0f19] border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING CREDENTIALS...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  AUTHORIZE ROOT ACCESS
                </>
              )}
            </button>
          </form>

          {/* Master Credentials Fast-Fill helper */}
          <div className="pt-4 border-t border-slate-800/80 text-center font-mono">
            <button
              type="button"
              onClick={handlePreFill}
              className="text-[11px] text-[#00f0ff]/80 hover:text-[#00f0ff] hover:underline inline-flex items-center gap-1"
            >
              <Sparkles size={12} />
              Set Designated Admin Credentials
            </button>
            <div className="text-[10px] text-slate-500 mt-1">
              kushanashvika216@gmail.com
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
