"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { Card, Input, Button } from '../components/ui';
import { Bot } from 'lucide-react';
export function Login() {
  const [email, setEmail] = useState('nadeesha@flowora.lk');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const login = useStore((state) => state.login);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, password);
    if (ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/10 blur-[100px]" />

      <Card className="w-full max-w-md p-8 glass relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Flowora
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Sign in to your workspace
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@flowora.lk"
              required />
            
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <a href="#" className="text-xs text-brand-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required />
            
          </div>

          {error &&
          <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          }

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-accent hover:underline font-medium">
            Create one
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-app-border text-center text-sm text-brand-muted">
          <p className="font-medium mb-3">Sample account access</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setEmail('nadeesha@flowora.lk'); setPassword('password'); }}
              className="p-3 rounded-xl border border-app-border hover:border-brand-accent hover:text-brand-accent transition-colors text-left">
              
              <span className="block font-semibold text-app-text">Operations Manager</span>
              <span className="block text-xs truncate">nadeesha@flowora.lk</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('kavindu@flowora.lk'); setPassword('password'); }}
              className="p-3 rounded-xl border border-app-border hover:border-brand-accent hover:text-brand-accent transition-colors text-left">
              
              <span className="block font-semibold text-app-text">Team Member</span>
              <span className="block text-xs truncate">kavindu@flowora.lk</span>
            </button>
          </div>
        </div>
      </Card>
    </div>);

}