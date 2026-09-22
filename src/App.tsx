import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { CyberNavbar } from './components/CyberNavbar';
import { CyberFooter } from './components/CyberFooter';
import { CyberBackground } from './components/CyberBackground';
import { SiteLoadingBar } from './components/SiteLoadingBar';
import { SiteInitialLoader } from './components/SiteInitialLoader';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { trackPageView } from './lib/firebase';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track public page views, exclude admin backend paths
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/dashboard')) {
      trackPageView(location.pathname).catch((err) => {
        console.debug("Telemetry track error:", err);
      });
    }
  }, [location.pathname]);

  return null;
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLight } = useTheme();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  // Completely isolated Admin Layout: No public background, navbar, footer, or initial loader
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans relative">
        <AnimatedRoutes />
      </div>
    );
  }

  // Public Layout: With subtle background, sticky navbar, content, and footer
  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0A0D14] text-slate-100'} flex flex-col selection:bg-[#C59B63] selection:text-[#0A0D14] relative overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* Non-blocking, reduced-motion aware site loader */}
      <SiteInitialLoader />

      {/* Subtle Top Route Progress Bar */}
      <SiteLoadingBar />

      {/* Cyber Background (Base level z-0) */}
      <CyberBackground />

      {/* Public Navigation Bar (Sticky z-30) */}
      <CyberNavbar />

      {/* Core Public Page Content (z-10) */}
      <main className="flex-1 flex flex-col relative z-10">
        <AnimatedRoutes />
      </main>

      {/* Public Footer */}
      <CyberFooter />
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <RouteTracker />
      <MainLayout />
    </Router>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
