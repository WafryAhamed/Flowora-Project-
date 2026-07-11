import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/index.css';
import { AppProviders } from '@/providers/AppProviders';
import logo from '@/logo/logo.PNG';

export const metadata: Metadata = {
  title: 'Flowora',
  description: 'Flowora workspace dashboard',
  icons: {
    icon: logo,
    apple: logo,
  },
  openGraph: {
    title: 'Flowora',
    description: 'Flowora workspace dashboard',
    type: 'website',
    images: logo,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
