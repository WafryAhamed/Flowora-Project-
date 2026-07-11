"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/Layout';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return <Layout>{children}</Layout>;
}
