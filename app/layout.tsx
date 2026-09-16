import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://ash-wickramasinghe.site'),
  title: { default: 'Ash Wickramasinghe — Creative Digital Portfolio', template: '%s | Ash Wickramasinghe' },
  description: 'Graphic design, social media management, content editing, and creative digital work by Ash Wickramasinghe.',
  keywords: ['Graphic Design', 'Social Media Management', 'Content Editing', 'Creative Digital Work'],
  alternates: { canonical: 'https://ash-wickramasinghe.site' },
  icons: { icon: '/favicon.svg' },
  openGraph: { type: 'website', siteName: 'Ash Wickramasinghe', url: 'https://ash-wickramasinghe.site', title: 'Ash Wickramasinghe — Creative Digital Portfolio', description: 'Graphic design, social media management, content editing, and creative digital work.' },
  twitter: { card: 'summary_large_image', title: 'Ash Wickramasinghe — Creative Digital Portfolio', description: 'Graphic design, social media management, content editing, and creative digital work.' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="bg-brand-dark text-white"><Navbar /><main className="min-h-screen">{children}</main><Footer /><Analytics /></body></html>;
}
