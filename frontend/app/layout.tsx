import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/index.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Flowora',
  description: 'Flowora workspace dashboard',
  openGraph: {
    title: 'Flowora',
    description: 'Flowora workspace dashboard',
    type: 'website',
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
