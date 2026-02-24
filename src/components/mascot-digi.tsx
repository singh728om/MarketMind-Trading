"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type DigiExpression = 
  | 'Happy' 
  | 'Sweating' 
  | 'Thinking' 
  | 'Celebrating' 
  | 'Sleeping' 
  | 'Sad' 
  | 'Focused' 
  | 'Excited' 
  | 'Alarmed' 
  | 'Locked' 
  | 'Coaching';

interface MascotDigiProps {
  expression?: DigiExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function MascotDigi({ expression = 'Happy', size = 'md', className }: MascotDigiProps) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-64 h-64'
  };

  const getExpressionEmoji = () => {
    switch (expression) {
      case 'Happy': return '😊';
      case 'Sweating': return '😰';
      case 'Thinking': return '🤔';
      case 'Celebrating': return '🎉';
      case 'Sleeping': return '😴';
      case 'Sad': return '😢';
      case 'Focused': return '😤';
      case 'Excited': return '🤩';
      case 'Alarmed': return '🚨';
      case 'Locked': return '🔒';
      case 'Coaching': return '🎓';
      default: return '😊';
    }
  };

  return (
    <motion.div 
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary/40",
        sizeMap[size],
        className
      )}
      animate={{
        y: expression === 'Sleeping' ? [0, 5, 0] : [0, -5, 0],
        scale: expression === 'Excited' ? [1, 1.1, 1] : 1
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="text-center">
        <span className={cn(
          "block transition-transform duration-300",
          size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : size === 'lg' ? 'text-6xl' : 'text-8xl'
        )}>
          {getExpressionEmoji()}
        </span>
      </div>
      
      {/* Animated googly eyes area or other visual indicators could be added here */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-transparent" />
      </div>
    </motion.div>
  );
}
