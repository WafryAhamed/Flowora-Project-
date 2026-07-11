"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button, Card, cn } from './ui';
export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}
export function Toast({
  toast,
  onClose



}: {toast: ToastProps;onClose: (id: string) => void;}) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.9
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        y: 20,
        scale: 0.9
      }}
      className="bg-app-surface border border-app-border shadow-glass rounded-xl p-4 flex items-start gap-3 w-80 pointer-events-auto">
      
      {icons[toast.type || 'info']}
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{toast.title}</h4>
        {toast.description &&
        <p className="text-xs text-brand-muted mt-1">{toast.description}</p>
        }
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-brand-muted hover:text-app-text transition-colors">
        
        <X className="w-4 h-4" />
      </button>
    </motion.div>);

}
export function ToastContainer({
  toasts,
  onClose



}: {toasts: ToastProps[];onClose: (id: string) => void;}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) =>
        <Toast key={t.id} toast={t} onClose={onClose} />
        )}
      </AnimatePresence>
    </div>);

}
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary'









}: {isOpen: boolean;title: string;description: string;confirmText?: string;cancelText?: string;onConfirm: () => void;onCancel: () => void;variant?: 'primary' | 'destructive';}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md p-6 shadow-glass">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-brand-muted mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              variant === 'destructive' &&
              'bg-red-500 hover:bg-red-600 text-white'
            )}>
            
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>);

}