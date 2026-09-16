import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://ash-wickramasinghe.site'),
  title: { default: 'Ash Wickramasinghe — Creative Digital Portfolio', template: '%s | Ash Wickramasinghe' },
  description: 'Ash Wickramasinghe creates thoughtful graphic design, social media content, and digital experiences for modern brands.',
  keywords: ['Graphic Design', 'Social Media Management', 'Content Editing', 'Creative Digital Work'],
  alternates: { canonical: 'https://ash-wickramasinghe.site' },
  authors: [{ name: 'Ash Wickramasinghe' }],
  icons: { icon: '/favicon.svg' },
  openGraph: { type: 'website', url: 'https://ash-wickramasinghe.site', siteName: 'Ash Wickramasinghe', title: 'Ash Wickramasinghe — Creative Digital Portfolio', description: 'Graphic design, social media management, content editing, and creative digital work.' },
  twitter: { card: 'summary_large_image', title: 'Ash Wickramasinghe — Creative Digital Portfolio', description: 'Graphic design, social media management, content editing, and creative digital work.' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
