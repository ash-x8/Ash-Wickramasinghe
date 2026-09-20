import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { CyberNavbar } from './components/CyberNavbar';
import { CyberFooter } from './components/CyberFooter';
import { CyberBackground } from './components/CyberBackground';
import { SiteLoadingBar } from './components/SiteLoadingBar';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import { trackPageView } from './lib/firebase';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { WritingPage } from './pages/WritingPage';
import { WritingDetailPage } from './pages/WritingDetailPage';
import { CvPage } from './pages/CvPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AlertOctagon, Terminal } from 'lucide-react';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track public page views, exclude admin backend paths
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname).catch((err) => {
        console.debug("Telemetry track error:", err);
      });
    }
  }, [location.pathname]);

  return null;
};

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center font-mono relative z-10">
    <div className="w-16 h-16 bg-red-950/40 border border-red-500 rounded-2xl flex items-center justify-center text-red-400 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <AlertOctagon size={32} />
    </div>
    <div className="text-[#C59B63] text-xs uppercase tracking-widest mb-2">
      // 404 ERROR // NOT FOUND
    </div>
    <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 font-serif">
      PAGE NOT FOUND
    </h1>
    <p className="text-slate-400 text-sm max-w-md mb-8 font-sans">
      The specified URL or page does not exist or has been relocated.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-[#C59B63] text-[#0A0D14] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#D8AC74] transition-all flex items-center gap-2 font-mono shadow-[0_0_15px_rgba(197,155,99,0.25)]"
    >
      <Terminal size={14} />
      RETURN TO HOMEPAGE
    </Link>
  </div>
);

// Admin Portal Entry Point Handler
const AdminEntryPortal: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-slate-400">
        <div className="w-2 h-2 rounded-full bg-[#C59B63] animate-ping mr-3" />
        INITIALIZING SECURE PORTAL...
      </div>
    );
  }

  if (user) {
    return <AdminDashboardPage />;
  }

  return <AdminLoginPage />;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <SiteLoadingBar />
        <RouteTracker />
        <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col selection:bg-[#C59B63] selection:text-[#0A0D14] relative overflow-x-hidden font-sans">
          {/* Cyber Ambiance Background */}
          <CyberBackground />

          {/* Public Navigation Bar (hidden on /admin) */}
          <CyberNavbar />

          {/* Core Route Body */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/writing" element={<WritingPage />} />
              <Route path="/writing/:slug" element={<WritingDetailPage />} />
              <Route path="/cv" element={<CvPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Isolated Admin Entry Point */}
              <Route path="/admin" element={<AdminEntryPortal />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/:tab" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Public Footer (hidden on /admin) */}
          <CyberFooter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
