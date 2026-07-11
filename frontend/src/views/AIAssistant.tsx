"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card, Input, Button, cn } from '../components/ui';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import {
  AI_SUGGESTIONS
} from '../lib/aiMock';

export function AIAssistant() {
  const { currentUser, chatHistory, fetchChatHistory, askAI } = useStore();
  
  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);
  if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN')) return null;
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const text = input;
    setInput('');
    setIsTyping(true);
    
    await askAI(text);
    
    setIsTyping(false);
  };
  
  const handleSuggestion = (s: string) => {
    setInput(s);
  };
  const suggestions = AI_SUGGESTIONS;
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-brand-accent" />
          Flowora AI
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Your intelligent assistant for team analytics and insights.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 && (
            <div className="text-center text-brand-muted my-10">
              No chat history yet. Say hello!
            </div>
          )}
          {chatHistory.map((msg) =>
          <div
            key={msg.id}
            className={cn(
              'flex gap-4 max-w-[85%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}>
            
              <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'user' ?
                'bg-brand-accent text-white' :
                'bg-brand-primary text-white'
              )}>
              
                {msg.role === 'user' ?
              <User className="w-4 h-4" /> :

              <Bot className="w-4 h-4" />
              }
              </div>
              <div
              className={cn(
                'p-4 rounded-2xl text-sm',
                msg.role === 'user' ?
                'bg-brand-accent text-white rounded-tr-sm' :
                'bg-app-bg border border-app-border rounded-tl-sm'
              )}>
              
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                <div
                className={cn(
                  'text-[10px] mt-2 opacity-70',
                  msg.role === 'user' ? 'text-right' : 'text-left'
                )}>
                
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Just now'}
                </div>
              </div>
            </div>
          )}
          {isTyping &&
          <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl text-sm bg-app-bg border border-app-border rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-muted" />
                <span className="text-brand-muted">Analyzing reports...</span>
              </div>
            </div>
          }
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-app-border bg-app-surface/50">
          {chatHistory.length <= 2 &&
          <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((s, i) =>
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-app-border bg-app-bg hover:border-brand-accent hover:text-brand-accent transition-colors flex items-center gap-1.5">
              
                  <Sparkles className="w-3 h-3" />
                  {s}
                </button>
            )}
            </div>
          }
          <form onSubmit={handleSend} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about team activity, blockers, or request a summary..."
              className="flex-1 bg-app-bg border-app-border focus:border-brand-accent"
              disabled={isTyping} />
            
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0">
              
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>);

}