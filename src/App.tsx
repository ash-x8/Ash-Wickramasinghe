import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CyberNavbar } from './components/CyberNavbar';
import { CyberFooter } from './components/CyberFooter';
import { CyberBackground } from './components/CyberBackground';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CvPage } from './pages/CvPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AlertOctagon, Terminal } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center font-mono relative z-10">
    <div className="w-16 h-16 bg-red-950/40 border border-red-500 rounded-2xl flex items-center justify-center text-red-400 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <AlertOctagon size={32} />
    </div>
    <div className="text-[#00f0ff] text-xs uppercase tracking-widest mb-2">
      // 404 ERROR // SECTOR UNREACHABLE
    </div>
    <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4">
      COORDINATE NOT FOUND
    </h1>
    <p className="text-slate-400 text-sm max-w-md mb-8">
      The specified memory sector or routing address does not exist or requires elevated clearance.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-[#00f0ff] text-[#0b0f19] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all flex items-center gap-2"
    >
      <Terminal size={14} />
      RETURN TO BASE HUB
    </Link>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-[#00f0ff] selection:text-[#0b0f19] relative overflow-x-hidden font-sans">
          {/* Cyber Ambiance Background */}
          <CyberBackground />

          {/* Navigation Bar */}
          <CyberNavbar />

          {/* Core Route Body */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/cv" element={<CvPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Cyber Footer */}
          <CyberFooter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
