import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { CyberNavbar } from './components/CyberNavbar';
import { CyberFooter } from './components/CyberFooter';
import { CyberBackground } from './components/CyberBackground';
import { SiteLoadingBar } from './components/SiteLoadingBar';
import { SiteInitialLoader } from './components/SiteInitialLoader';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { trackPageView } from './lib/firebase';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/dashboard')) {
      trackPageView(location.pathname).catch((err) => {
        console.debug('Telemetry track error:', err);
      });
    }
  }, [location.pathname]);

  return null;
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans relative">
        <AnimatedRoutes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#C59B63] selection:text-[#0A0D14] relative overflow-x-hidden font-sans transition-colors duration-200">
      <SiteInitialLoader />
      <SiteLoadingBar />
      <CyberBackground />
      <CyberNavbar />
      <main className="flex-1 flex flex-col relative z-10">
        <AnimatedRoutes />
      </main>
      <CyberFooter />
      <PrivacyConsentBanner />
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
