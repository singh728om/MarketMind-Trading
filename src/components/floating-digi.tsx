"use client";

import React from 'react';
import { MascotDigi, DigiExpression } from './mascot-digi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingDigi() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expression, setExpression] = React.useState<DigiExpression>('Happy');

  return (
    <div className="fixed bottom-14 right-14 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-surface rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MascotDigi expression={expression} size="sm" className="bg-white/20 border-white/40" />
                <div>
                  <h3 className="font-headline font-bold text-sm">Digi AI Assistant</h3>
                  <p className="text-[10px] text-white/80">Always on Duty • Risk Guard Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 bg-muted/20 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <MascotDigi expression="Coaching" size="sm" className="shrink-0" />
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-primary/5 shadow-sm text-sm">
                  Hello Ajay! I'm watching the markets. NIFTY is showing strong volume near 22,400. How can I help you today?
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {['Show Signals', 'Check my P&L', 'Analyze RELIANCE', 'Risk Status'].map(tag => (
                  <button key={tag} className="text-[10px] font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask Digi anything..." 
                  className="w-full pl-4 pr-10 py-2.5 bg-muted/30 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-white border-2 border-primary" : "bg-primary"
        )}
      >
        <MascotDigi 
          expression={isOpen ? 'Focused' : expression} 
          size="md" 
          className={cn(
            "bg-transparent border-none transition-transform",
            isOpen ? "scale-90" : ""
          )} 
        />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-bear text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            1
          </div>
        )}
      </motion.button>
    </div>
  );
}
