import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveChatWidget from '../components/LiveChatWidget';
import AnalyticsProvider from '../components/AnalyticsProvider';
import CommandPalette from '../components/CommandPalette';

export const metadata: Metadata = {
  title: 'Portfolio Showcase | Software Engineer',
  description: 'A highly secure, full-stack monorepo application designed to seamlessly manage and present professional portfolios.',
  openGraph: {
    title: 'Portfolio Showcase | Software Engineer',
    description: 'A highly secure, full-stack monorepo application designed to seamlessly manage and present professional portfolios.',
    url: 'https://yourdomain.com',
    siteName: 'Portfolio Showcase',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Showcase | Software Engineer',
    description: 'A highly secure, full-stack monorepo application.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AnalyticsProvider />
        <CommandPalette />
        <Navbar />
        {children}
        <LiveChatWidget />
        <Footer />
      </body>
    </html>
  );
}
