"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Bell, CreditCard, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const indices = [
  { name: 'NIFTY 50', value: '22,450.30', change: '+125.40', pct: '+0.56%', trend: 'up' },
  { name: 'SENSEX', value: '74,119.00', change: '+380.20', pct: '+0.51%', trend: 'up' },
  { name: 'BANK NIFTY', value: '48,230.00', change: '-95.00', pct: '-0.19%', trend: 'down' },
  { name: 'NIFTY IT', value: '38,450.00', change: '+220.00', pct: '+0.57%', trend: 'up' },
  { name: 'INDIA VIX', value: '13.42', change: '-0.80', pct: '-0.56%', trend: 'down' },
  { name: 'NIFTY MID', value: '45,210.00', change: '+180.00', pct: '+0.40%', trend: 'up' },
];

export function TopBar() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 z-50 h-16 w-full border-b bg-surface shadow-sm px-4 flex items-center justify-between">
      {/* Left Area: Logo and Market Status */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow-purple transition-transform group-hover:scale-110">D</div>
          <span className="text-xl font-headline font-bold text-primary hidden md:block">TheDigiOcean</span>
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-bull/10 text-bull rounded-pill text-xs font-medium border border-bull/20">
          <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
          Market Open
        </div>
      </div>

      {/* Center Area: Ticker */}
      <div className="flex-1 mx-8 overflow-hidden hidden lg:block">
        <div className="flex items-center gap-8 animate-scroll-left whitespace-nowrap py-1">
          {indices.map((idx, i) => (
            <div key={i} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors">
              <span className="text-xs font-bold text-muted-foreground">{idx.name}</span>
              <span className="mono-font text-sm font-semibold">{idx.value}</span>
              <span className={cn(
                "mono-font text-xs",
                idx.trend === 'up' ? "text-bull" : "text-bear"
              )}>
                {idx.trend === 'up' ? '▲' : '▼'} {idx.change} ({idx.pct})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Risk, Clock, Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden xl:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2 text-bull font-semibold text-xs bg-bull/10 px-2 py-1 rounded-pill border border-bull/20">
            <Shield className="w-3 h-3" />
            Protected
          </div>
          <span className="mono-font text-[10px] text-muted-foreground mt-0.5">
            {time.toLocaleTimeString('en-IN', { hour12: true })} IST
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-full relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-bear rounded-full" />
          </button>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-light text-primary rounded-lg border border-primary/10">
            <CreditCard className="w-4 h-4" />
            <span className="mono-font text-xs font-bold">842 cr</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-muted cursor-pointer hover:bg-muted p-1 rounded-lg transition-colors">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src="https://picsum.photos/seed/user/32/32" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-xs font-bold leading-none">Ajay Kumar</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">Pro Trader</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
