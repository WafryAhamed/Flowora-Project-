import type { ReactNode } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
