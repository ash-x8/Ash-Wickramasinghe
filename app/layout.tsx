import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { PageTransition } from './components/PageTransition';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Ash Wickramasinghe — Cyber Portfolio',
  description: 'High-performance futuristic cyber-themed personal portfolio, read-only CV viewer, and CMS for Ash Wickramasinghe.',
  keywords: 'Full-Stack Developer, Cyber Security, React, Next.js, TypeScript, JavaScript, Web Development',
  authors: [{ name: 'Ash Wickramasinghe' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ash-wickramasinghe.site',
    siteName: 'Ash Wickramasinghe — Cyber Portfolio',
    title: 'Ash Wickramasinghe — Cyber Portfolio',
    description: 'High-performance futuristic cyber-themed personal portfolio, read-only CV viewer, and CMS for Ash Wickramasinghe.',
    images: [{
      url: 'https://ash-wickramasinghe.site/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Ash Wickramasinghe Cyber Portfolio',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ash Wickramasinghe — Cyber Portfolio',
    description: 'High-performance futuristic cyber-themed personal portfolio, read-only CV viewer, and CMS for Ash Wickramasinghe.',
    creator: '@ash_dev',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="relative bg-brand-dark text-white">
        {/* Background Gradient */}
        <div className="fixed inset-0 -z-10 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 -z-10" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }} />
        <div className="fixed inset-0 -z-10" style={{
          background: 'radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
        }} />

        <Navbar />

        <main className="min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
