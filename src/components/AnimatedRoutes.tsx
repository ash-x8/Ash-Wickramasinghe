import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { ProtectedRoute } from '../context/AuthContext';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { WritingPage } from '../pages/WritingPage';
import { WritingDetailPage } from '../pages/WritingDetailPage';
import { CvPage } from '../pages/CvPage';
import { ContactPage } from '../pages/ContactPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen pt-40 pb-24 px-6 flex flex-col items-center justify-center text-center">
    <span className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Error 404</span>
    <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-neutral-100 mb-4">Page Not Found</h1>
    <p className="text-slate-600 dark:text-neutral-400 text-sm max-w-md mb-8">
      The requested page does not correspond to an active project, article, or portfolio section.
    </p>
    <Link
      to="/"
      className="px-6 py-2.5 rounded-full bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
    >
      Return Home
    </Link>
  </div>
);

export const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/writing/:slug" element={<WritingDetailPage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authenticated & 2FA-Protected Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/:tab" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/:tab" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};
