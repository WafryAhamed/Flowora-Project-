import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-accent hover:bg-brand-muted text-white shadow-sm',
      secondary: 'bg-brand-secondary hover:bg-brand-primary text-white shadow-sm',
      outline:
      'border border-brand-accent text-brand-accent hover:bg-brand-accent/10',
      ghost: 'hover:bg-brand-accent/10 text-brand-accent'
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props} />);


  });
Button.displayName = 'Button';
export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-app-border bg-app-surface text-app-text shadow-card',
      className
    )}
    {...props} />

);
Card.displayName = 'Card';
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) =>
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props} />

);
Input.displayName = 'Input';
export const Badge = ({
  className,
  variant = 'default',
  children




}: {className?: string;variant?: 'default' | 'success' | 'warning' | 'error';children: React.ReactNode;}) => {
  const variants = {
    default: 'bg-brand-accent/10 text-brand-accent',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}>
      
      {children}
    </span>);

};