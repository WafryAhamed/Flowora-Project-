"use client";

import React from 'react';
import Link from 'next/link';
import { useStore, Role } from '../store/useStore';
import { Button } from './ui';
import { ShieldAlert } from 'lucide-react';
export function RoleGuard({
  allow,
  children



}: {allow: Role[];children: React.ReactNode;}) {
  const currentUser = useStore((s) => s.currentUser);
  if (currentUser && allow.includes(currentUser.role)) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Access restricted</h1>
      <p className="text-sm text-brand-muted mt-2 max-w-sm">
        This area is only available to managers. If you think this is a mistake,
        contact your workspace admin.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>);

}