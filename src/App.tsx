import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { CyberNavbar } from './components/CyberNavbar';
import { CyberFooter } from './components/CyberFooter';
import { CyberBackground } from './components/CyberBackground';
import { SiteLoadingBar } from './components/SiteLoadingBar';
import { SiteInitialLoader } from './components/SiteInitialLoader';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { AuthProvider } from './context/AuthContext';
import { trackPageView } from './lib/firebase';

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

export function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Full Site Initial Loading Animation */}
        <SiteInitialLoader />

        {/* Top Route Progress Bar */}
        <SiteLoadingBar />

        {/* Route Tracking Analytics */}
        <RouteTracker />

        <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col selection:bg-[#C59B63] selection:text-[#0A0D14] relative overflow-x-hidden font-sans">
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
    </AuthProvider>
  );
}

export default App;
