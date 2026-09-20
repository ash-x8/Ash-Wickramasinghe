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

const AppContent: React.FC = () => {
  const { isLight } = useTheme();

  return (
    <Router>
      {/* Full Site Initial Loading Animation */}
      <SiteInitialLoader />

      {/* Top Route Progress Bar */}
      <SiteLoadingBar />

      {/* Route Tracking Analytics */}
      <RouteTracker />

      <div className={`min-h-screen ${isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0A0D14] text-slate-100'} flex flex-col selection:bg-[#C59B63] selection:text-[#0A0D14] relative overflow-x-hidden font-sans transition-colors duration-200`}>
        {/* Cyber Ambiance Background */}
        <CyberBackground />

        {/* Public Navigation Bar (hidden on /admin) */}
        <CyberNavbar />

        {/* Core Route Body with Route Transition Animation */}
        <main className="flex-1 flex flex-col">
          <AnimatedRoutes />
        </main>

        {/* Public Footer (hidden on /admin) */}
        <CyberFooter />
      </div>
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
