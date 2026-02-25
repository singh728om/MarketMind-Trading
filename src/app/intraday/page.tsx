
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Target, ShieldAlert, 
  TrendingUp, TrendingDown, Layers, 
  MousePointerClick, BarChart3, Clock,
  Flame, Crosshair, ArrowRight, Settings2,
  Lock, ShieldCheck, Thermometer, AlertTriangle,
  RotateCcw, Sliders, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking 
} from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const MOMENTUM_STOCKS = [
  { symbol: 'RELIANCE', price: 2950.40, change: '+1.2%', momentum: 88, trend: 'up', volume: '1.5x' },
  { symbol: 'TCS', price: 4120.00, change: '+2.1%', momentum: 94, trend: 'up', volume: '2.2x' },
  { symbol: 'HDFCBANK', price: 1450.20, change: '-0.4%', momentum: 42, trend: 'down', volume: '0.8x' }
];

export default function IntradayCockpit() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Active Lock Check
  const locksQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    return query(
      collection(firestore, 'users', userId, 'risk_locks'),
      where('lockedAt', '>=', twoHoursAgo),
      orderBy('lockedAt', 'desc'),
      limit(1)
    );
  }, [firestore, userId]);
  const { data: activeLocks } = useCollection(locksQuery);
  const isLocked = activeLocks && activeLocks.length > 0;

  // Recent Trades for Frequency Check
  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    const todayIso = new Date().setHours(0,0,0,0);
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('openedAt', '>=', new Date(todayIso).toISOString()),
      orderBy('openedAt', 'desc'),
      limit(5)
    );
  }, [firestore, userId]);
  const { data: recentTrades } = useCollection(tradesQuery);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickTrade = (symbol: string, side: 'BUY' | 'SELL', price: number) => {
    if (!firestore || !userId || isLocked) return;

    if (recentTrades && recentTrades.length >= 4) {
      const fourthTradeTime = new Date(recentTrades[3].openedAt).getTime();
      if (Date.now() - fourthTradeTime < 60000) {
        toast({ variant: "destructive", title: "LOCKOUT", description: "Frequency limit hit. Cooldown: 2 hours." });
        addDocumentNonBlocking(collection(firestore, 'users', userId, 'risk_locks'), {
          userId, lockReason: 'High Frequency', lockType: 'Auto', lockedAt: new Date().toISOString()
        });
        return;
      }
    }

    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId, symbol, exchange: 'NSE', segment: 'EQUITY', side, qty: 10,
      entryPrice: price, status: 'OPEN', brokerOrderId: 'COCKPIT-' + Math.random().toString(36).substr(2, 7),
      strategyName: 'Intraday Momentum', openedAt: new Date().toISOString(), createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {isLocked && (
        <div className="bg-bear/10 border border-bear/20 p-4 rounded-2xl flex items-center gap-4 text-bear">
          <Lock className="w-6 h-6 shrink-0" />
          <p className="text-xs font-bold uppercase">System Lock: 2-Hour Cooldown in progress due to high-frequency execution.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Intraday Cockpit</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase">Live Market Session • NSE / BSE</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Session Time</p>
          <p className="mono-font text-lg font-extrabold">{currentTime?.toLocaleTimeString('en-IN', { hour12: false }) || '--:--:--'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold">Momentum Scanner</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {MOMENTUM_STOCKS.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{stock.symbol}</span>
                    <Badge variant="outline" className="text-[8px]">{stock.volume} VOL</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="h-8 text-[10px] font-bold gap-1.5"
                    disabled={isLocked}
                    onClick={() => handleQuickTrade(stock.symbol, 'BUY', stock.price)}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    {isLocked ? "LOCKED" : "TRADE"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-primary/5 p-6 space-y-4">
            <MascotDigi expression={isLocked ? 'Locked' : 'Coaching'} size="md" className="mx-auto" />
            <p className="text-xs font-medium italic text-center leading-relaxed">
              {isLocked ? "You were moving too fast, friend. Take this time to reflect on your plan. I'll be here in 2 hours." : "I'm monitoring your re-entry speed. Remember: quality over quantity."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
