"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, Role } from '../store/useStore';
import { Card, Input, Button, cn } from '../components/ui';
import { Bot } from 'lucide-react';
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: Role;
  password: string;
  confirm: string;
}
type Errors = Partial<Record<keyof FormState, string>>;
export function Register() {
  const register = useStore((s) => s.register);
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'MEMBER',
    password: '',
    confirm: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const set = (key: keyof FormState, value: string) =>
  setForm((f) => ({
    ...f,
    [key]: value
  }));
  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';else
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Required';else
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const res = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      department: form.department.trim() || undefined,
      role: form.role,
      password: form.password
    });
    if (!res.ok) {
      setErrors({
        email: res.error
      });
      return;
    }
    router.push('/dashboard');
  };
  const field = (
  label: string,
  key: keyof FormState,
  props: React.InputHTMLAttributes<HTMLInputElement> = {}) =>

  <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input
      value={form[key]}
      onChange={(ev) => set(key, ev.target.value)}
      className={cn(
        errors[key] && 'border-red-500 focus-visible:ring-red-500'
      )}
      {...props} />
    
      {errors[key] &&
    <p className="text-xs text-red-500" role="alert">
          {errors[key]}
        </p>
    }
    </div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/10 blur-[100px]" />

      <Card className="w-full max-w-lg p-8 glass relative z-10 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Join your team on Flowora
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('First name', 'firstName', {
              placeholder: 'Nadeesha'
            })}
            {field('Last name', 'lastName', {
              placeholder: 'Fernando'
            })}
          </div>
          {field('Email', 'email', {
            type: 'email',
            placeholder: 'name@flowora.lk'
          })}
          <div className="grid grid-cols-2 gap-4">
            {field('Department', 'department', {
              placeholder: 'Operations (optional)'
            })}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                value={form.role}
                onChange={(ev) => set('role', ev.target.value)}
                className="flex h-10 w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent">
                
                <option value="MEMBER">Team Member</option>
                <option value="MANAGER">Manager / Admin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Password', 'password', {
              type: 'password',
              placeholder: '••••••••'
            })}
            {field('Confirm password', 'confirm', {
              type: 'password',
              placeholder: '••••••••'
            })}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-accent hover:underline font-medium">
            
            Sign in
          </Link>
        </p>
      </Card>
    </div>);

}