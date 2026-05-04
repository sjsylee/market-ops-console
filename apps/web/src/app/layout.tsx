import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Bruno_Ace_SC, DM_Sans, JetBrains_Mono, Noto_Sans_KR } from 'next/font/google';

import { PersistentAppShell } from '../components/layout/persistent-app-shell';
import './globals.css';

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: {
    default: 'Dashboard | Market Ops Console',
    template: '%s | Market Ops Console',
  },
  description: 'Market Ops Console operation dashboard for macro loops and bid management.',
  applicationName: 'Market Ops Console',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/app-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Market Ops Console',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Market Ops Console',
    description: 'Market Ops Console operation dashboard for macro loops and bid management.',
    siteName: 'Market Ops Console',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eaf2ff' },
    { media: '(prefers-color-scheme: dark)', color: '#080d1b' },
  ],
};

const displayFont = Bruno_Ace_SC({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const koreanFont = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-korean',
  weight: ['400', '500', '700'],
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600'],
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} ${koreanFont.variable} ${monoFont.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(() => { try { const p = localStorage.getItem('market-ops-theme-preference'); const n = p === 'light' || p === 'dark' ? p : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); document.documentElement.setAttribute('data-theme', n); document.documentElement.style.colorScheme = n; } catch (e) {} })();",
          }}
        />
        <PersistentAppShell>{children}</PersistentAppShell>
      </body>
    </html>
  );
}
