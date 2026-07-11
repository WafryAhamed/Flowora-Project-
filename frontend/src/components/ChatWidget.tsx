"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, X, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Input, Button, cn } from './ui';
import {
  AI_SUGGESTIONS
} from '../lib/aiMock';
export function ChatWidget() {
  const { currentUser, chatHistory, fetchChatHistory, askAI } = useStore();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (open) {
      fetchChatHistory();
    }
  }, [open, fetchChatHistory]);
  
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [chatHistory, typing, open]);
  
  if (!currentUser || currentUser.role !== 'MANAGER') return null;
  
  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setInput('');
    setTyping(true);
    
    await askAI(text);
    
    setTyping(false);
  };
  return (
    <>
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.96
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.96
          }}
          transition={{
            duration: 0.2
          }}
          className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[32rem] rounded-2xl bg-app-surface border border-app-border shadow-glass flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Flowora AI assistant">
          
            <div className="flex items-center justify-between px-4 py-3 border-b border-app-border bg-brand-primary text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold text-sm">Flowora AI</span>
              </div>
              <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-brand-muted my-6 text-sm">
                  How can I help you today?
                </div>
              )}
              {chatHistory.map((msg) =>
            <div
              key={msg.id}
              className={cn(
                'flex gap-2.5 max-w-[90%]',
                msg.role === 'user' && 'ml-auto flex-row-reverse'
              )}>
              
                  <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                  msg.role === 'user' ?
                  'bg-brand-accent text-white' :
                  'bg-brand-primary text-white'
                )}>
                
                    {msg.role === 'user' ?
                <User className="w-3.5 h-3.5" /> :

                <Bot className="w-3.5 h-3.5" />
                }
                  </div>
                  <div
                className={cn(
                  'p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed',
                  msg.role === 'user' ?
                  'bg-brand-accent text-white rounded-tr-sm' :
                  'bg-app-bg border border-app-border rounded-tl-sm'
                )}>
                
                    {msg.content}
                  </div>
                </div>
            )}
              {typing &&
            <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm bg-app-bg border border-app-border flex items-center gap-2 text-brand-muted">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </div>
                </div>
            }
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-app-border">
              {chatHistory.length <= 2 &&
            <div className="flex flex-wrap gap-1.5 mb-3">
                  {AI_SUGGESTIONS.slice(0, 3).map((s) =>
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-app-border hover:border-brand-accent hover:text-brand-accent transition-colors flex items-center gap-1">
                
                      <Sparkles className="w-3 h-3" />
                      {s}
                    </button>
              )}
                </div>
            }
              <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2">
              
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your team..."
                className="flex-1 bg-app-bg"
                disabled={typing} />
              
                <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || typing}
                className="h-10 px-3">
                
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <motion.button
        whileHover={{
          scale: 1.05
        }}
        whileTap={{
          scale: 0.95
        }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-primary text-white shadow-glass flex items-center justify-center hover:bg-brand-secondary transition-colors">
        
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </>);

}