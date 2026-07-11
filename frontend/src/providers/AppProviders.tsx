"use client";

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ToastContainer } from '@/components/Feedback';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  const fetchMe = useStore((s) => s.fetchMe);

  useEffect(() => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Attempt to restore user session
    fetchMe();
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {children}
    </>
  );
}
