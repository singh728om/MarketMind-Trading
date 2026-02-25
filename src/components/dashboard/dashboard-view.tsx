"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  Sparkles, BrainCircuit, Eye, XCircle, 
  ShoppingCart, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Power,
  BarChart3, Target, Info,
  AlertTriangle, Lock, Crosshair, Flame, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { 
  useFirebase, 
  useCollection, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const FO_STRATEGIES = [
  {
    id: 'nifty-bull-call',
    symbol: 'NIFTY',
    name: 'Bull Call Spread',
    expiry: '21 MAR',
    badge: 'NIFTY WEEKLY',
    description: 'High OI buildup at 22,400 PE and rising PCR indicates strong support. Strategy: Buy 22,450 CE / Sell 22,600 CE.',
    maxProfit: '₹8,450',
    maxLoss: '₹3,200',
    confidence: 84,
    direction: 'BUY',
    entryPrice: 22450
  },
  {
    id: 'banknifty-bear-put',
    symbol: 'BANKNIFTY',
    name: 'Bear Put Spread',
    expiry: '21 MAR',
    badge: 'BANKNIFTY WEEKLY',
    description: 'Resistance at 48,500 CE is strengthening. FIIs are hedging. Strategy: Buy 48,200 PE / Sell 48,000 PE.',
    maxProfit: '₹12,200',
    maxLoss: '₹4,800',
    confidence: 76,
    direction: 'SELL',
    entryPrice: 48200
  }
];

const AI_FO_SCALPS = [
  {
    id: 'scalp-1',
    symbol: 'NIFTY 22500 CE',
    bias: 'BULLISH',
    entry: 142.50,
    target: 168.00,
    sl: 130.00,
    confidence: 92,
    reason: 'VWAP Breakout + Volume Surge',
    qty: 50
  },
  {
    id: 'scalp-2',
    symbol: 'BANKNIFTY 48300 PE',
    bias: 'BEARISH',
    entry: 310.40,
    target: 380.00,
    sl: 285.00,
    confidence: 81,
    reason: 'Call Writing at Resistance',
    qty: 15
  }
];

const AI_RECOMMENDED_SIGNALS = [
  {
    id: 'sig-rel',
    symbol: 'RELIANCE',
    segment: 'EQUITY',
    direction: 'BUY',
    type: 'Breakout',
    entry: 2950.40,
    target: 3020.00,
    stoploss: 2910.00,
    confidence: 88,
    qty: 10
  },
  {
    id: 'sig-nifty-ce',
    symbol: 'NIFTY 22500 CE',
    segment: 'F&O',
    direction: 'BUY',
    type: 'Option Scalp',
    entry: 145.20,
    target: 185.00,
    stoploss: 120.00,
    confidence: 91,
    qty: 50
  }
];

export function Dashboard() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [mounted, setMounted] = useState(false);
  const [strategyIndex, setStrategyIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Active Locks (within 2 hours)
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

  // Fetch FII/DII for Conviction
  const fiiDiiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'fii_dii_data'), orderBy('date', 'desc'), limit(1));
  }, [firestore]);
  const { data: fiiDiiDocs } = useCollection(fiiDiiQuery);
  const latestFiiDii = fiiDiiDocs?.[0];

  // Fetch All Today's Trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const allTradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('openedAt', '>=', todayIso),
      orderBy('openedAt', 'desc')
    );
  }, [firestore, userId, todayIso]);
  const { data: todayTrades } = useCollection(allTradesQuery);

  const stats = useMemo(() => {
    if (!todayTrades) return { sessionPnL: 0, openCount: 0, totalTrades: 0, riskFactor: 0 };
    const openCount = todayTrades.filter(t => t.status === 'OPEN').length;
    const closedTrades = todayTrades.filter(t => t.status === 'CLOSED');
    const sessionPnL = closedTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    const riskFactor = Math.min((todayTrades.length / 10) * 100, 100);
    return { sessionPnL, openCount, totalTrades: todayTrades.length, riskFactor };
  }, [todayTrades]);

  const guardianStatus = useMemo(() => {
    if (isLocked) {
      return { 
        expression: 'Locked' as const, 
        message: "TRADING DISABLED: High-frequency overtrading detected. 2-hour cooldown in progress.",
        status: 'LOCKED'
      };
    }
    if (stats.riskFactor > 80) {
      return { 
        expression: 'Sweating' as const, 
        message: "Warning! You've reached 80% of your daily trade limit. Risk of emotional fatigue is high.",
        status: 'CRITICAL'
      };
    }
    return { 
      expression: 'Coaching' as const, 
      message: "Session is stable. Your execution timing is aligned with institutional flows.",
      status: 'SECURE'
    };
  }, [stats, isLocked]);

  const executeTrade = async (tradeData: { symbol: string, side: string, segment: string, qty: number, price: number, strategy: string }) => {
    if (!firestore || !userId || isLocked) return;

    // Check for high-frequency lock (5 trades in 1 minute)
    if (todayTrades && todayTrades.length >= 4) {
      const recent = todayTrades.slice(0, 4);
      const fourthTradeTime = new Date(recent[3].openedAt).getTime();
      
      if (Date.now() - fourthTradeTime < 60000) {
        toast({
          variant: "destructive",
          title: "HIGH FREQUENCY LOCK TRIGGERED",
          description: "Execution bridge suspended for 2 hours."
        });
        
        addDocumentNonBlocking(collection(firestore, 'users', userId, 'risk_locks'), {
          userId,
          lockReason: 'High Frequency (5 trades / min)',
          lockType: 'Auto',
          lockedAt: new Date().toISOString(),
          pnlAtLock: stats.sessionPnL,
          tradesAtLock: stats.totalTrades + 1
        });
        return;
      }
    }

    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol: tradeData.symbol,
      exchange: 'NSE',
      segment: tradeData.segment,
      side: tradeData.side,
      qty: tradeData.qty,
      entryPrice: tradeData.price,
      status: 'OPEN',
      brokerOrderId: 'QT-' + Math.random().toString(36).substr(2, 9),
      strategyName: tradeData.strategy,
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  const handleExitPosition = (tradeId: string, entryPrice: number) => {
    if (!firestore || !userId) return;
    const tradeRef = doc(firestore, 'users', userId, 'trades', tradeId);
    const exitPrice = entryPrice * 1.02;
    const pnl = (exitPrice - entryPrice) * 10;

    updateDocumentNonBlocking(tradeRef, {
      status: 'CLOSED',
      exitPrice,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: 2.0,
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const currentStrategy = FO_STRATEGIES[strategyIndex];

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-10">
      {isLocked && (
        <div className="bg-bear text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg animate-in fade-in slide-in-from-top-4">
          <Lock className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <p className="font-bold uppercase tracking-tight">System Lockdown Active</p>
            <p className="text-xs opacity-90">Execution bridge is suspended for 2 hours due to high-frequency signals.</p>
          </div>
          <Badge variant="outline" className="text-white border-white/40 font-bold uppercase text-[10px]">2H COOLDOWN</Badge>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <MascotDigi expression={guardianStatus.expression} size="md" />
          <div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight">
              AI Command Center 🌊
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldAlert className={cn("w-3.5 h-3.5", guardianStatus.status === 'SECURE' ? "text-bull" : "text-bear")} />
              Risk Guard Status: {guardianStatus.status} • NSE/BSE Live
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Card className="flex flex-col items-end border rounded-2xl p-4 shadow-sm min-w-[160px] bg-card">
            <div className={cn("mono-font text-2xl font-extrabold", stats.sessionPnL >= 0 ? "text-bull" : "text-bear")}>
              ₹{stats.sessionPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Session Score (P&L)</p>
          </Card>

          <Card className="flex flex-col items-end border rounded-2xl p-4 shadow-sm min-w-[140px] bg-card">
            <div className="mono-font text-2xl font-extrabold text-primary">
              {stats.openCount}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Open Positions</p>
          </Card>

          <Card className="flex flex-col items-end border rounded-2xl p-4 shadow-sm min-w-[140px] bg-card">
            <div className="mono-font text-2xl font-extrabold text-gold">
              {stats.totalTrades}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Trade Count</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Live Portfolio Management
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-bull border-bull/20 bg-bull/5">
                {stats.openCount} LIVE TRADES
              </Badge>
            </div>
            <div className="space-y-3">
              {todayTrades?.filter(t => t.status === 'OPEN').map((position) => (
                <Card key={position.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                  <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm",
                        position.side === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {position.side === 'BUY' ? 'B' : 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{position.symbol}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {position.qty} QTY • ENTRY ₹{position.entryPrice}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-[11px] font-bold gap-1.5 border-bear/20 text-bear hover:bg-bear hover:text-white transition-all"
                      onClick={() => handleExitPosition(position.id, position.entryPrice)}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      AUTO-EXIT
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!todayTrades || todayTrades.filter(t => t.status === 'OPEN').length === 0) && (
                <div className="p-8 text-center bg-muted/10 rounded-2xl border border-dashed">
                  <p className="text-sm text-muted-foreground italic font-medium">No open positions in this session. Start with a signal below.</p>
                </div>
              )}
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5 shadow-purple overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary fill-current" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Top Recommended F&O Strategy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6 pt-0">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold uppercase">{currentStrategy.badge}</Badge>
                  <span className="text-xs font-bold text-muted-foreground">EXP: {currentStrategy.expiry}</span>
                </div>
                <h4 className="text-xl font-bold">{currentStrategy.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStrategy.description}
                </p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Profit</p>
                    <p className="text-xs font-bold text-bull">{currentStrategy.maxProfit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Loss</p>
                    <p className="text-xs font-bold text-bear">{currentStrategy.maxLoss}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col justify-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-primary uppercase">AI CONFIDENCE</p>
                  <p className="text-2xl font-black text-primary">{currentStrategy.confidence}%</p>
                </div>
                <Button 
                  className="h-12 px-8 font-bold gap-2 shadow-purple"
                  disabled={isLocked}
                  onClick={() => executeTrade({
                    symbol: currentStrategy.symbol,
                    side: currentStrategy.direction,
                    segment: 'F&O',
                    qty: 50,
                    price: currentStrategy.entryPrice,
                    strategy: currentStrategy.name
                  })}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {isLocked ? "DISABLED" : "DEPLOY STRATEGY"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New Section: F&O Alpha Hub for Quick Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-gold" />
              F&O Alpha Hub
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AI_FO_SCALPS.map((scalp) => (
                <Card key={scalp.id} className="border-none shadow-sm hover:border-gold/30 transition-all bg-white relative overflow-hidden group">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    scalp.bias === 'BULLISH' ? "bg-bull" : "bg-bear"
                  )} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase tracking-tight">{scalp.symbol}</h4>
                          <Badge variant="secondary" className="text-[8px] font-bold bg-muted/50 uppercase h-4 px-1.5">{scalp.confidence}% AI Match</Badge>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground italic mt-0.5">"{scalp.reason}"</p>
                      </div>
                      <div className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                        scalp.bias === 'BULLISH' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {scalp.bias}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="p-2 bg-muted/20 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Entry</p>
                        <p className="text-xs font-bold mono-font">₹{scalp.entry}</p>
                      </div>
                      <div className="p-2 bg-bull/5 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Target</p>
                        <p className="text-xs font-bold mono-font text-bull">₹{scalp.target}</p>
                      </div>
                      <div className="p-2 bg-bear/5 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">SL</p>
                        <p className="text-xs font-bold mono-font text-bear">₹{scalp.sl}</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-9 font-bold text-[10px] gap-2 shadow-sm"
                      variant="outline"
                      disabled={isLocked}
                      onClick={() => executeTrade({
                        symbol: scalp.symbol,
                        side: scalp.bias === 'BULLISH' ? 'BUY' : 'SELL',
                        segment: 'F&O',
                        qty: scalp.qty,
                        price: scalp.entry,
                        strategy: 'AI Option Scalp'
                      })}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-gold" />
                      QUICK SCALP EXECUTE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className={cn(
            "border-none shadow-sm overflow-hidden",
            isLocked ? "bg-bear/5" : "bg-primary/5"
          )}>
            <div className={cn(
              "px-4 py-2 flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-widest",
              isLocked ? "bg-bear" : "bg-primary"
            )}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                AI Risk Guardian
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <MascotDigi expression={guardianStatus.expression} size="sm" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-[11px] font-medium italic">
                  "{guardianStatus.message}"
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Session Capacity</span>
                    <span className={cn(stats.riskFactor > 80 ? "text-bear" : "text-primary")}>
                      {stats.totalTrades} / 10
                    </span>
                  </div>
                  <Progress value={stats.riskFactor} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics & Sentiment Context */}
          <Card className="border-none shadow-sm bg-gold/5 border-l-4 border-l-gold">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Market Pulse Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-gold/10 text-center">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Nifty PCR</p>
                  <p className="text-sm font-extrabold text-bull">1.28</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gold/10 text-center">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">India VIX</p>
                  <p className="text-sm font-extrabold text-bear">13.42</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-dashed border-gold/20">
                <Flame className="w-4 h-4 text-gold" />
                <p className="text-[9px] font-bold text-muted-foreground leading-tight">
                  High conviction accumulation observed in **BANKING** and **AUTO** sectors by FIIs.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Quick Signals
            </h3>
            {AI_RECOMMENDED_SIGNALS.map(s => (
              <Card key={s.id} className="border-none shadow-sm hover:border-primary/20 transition-all bg-white group">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] transition-transform group-hover:scale-110", s.direction === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}>
                      {s.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{s.symbol}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{s.type}</p>
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    disabled={isLocked}
                    onClick={() => executeTrade({
                      symbol: s.symbol,
                      side: s.direction,
                      segment: s.segment,
                      qty: s.qty,
                      price: s.entry,
                      strategy: 'AI Signal'
                    })}
                  >
                    <Zap className={cn("w-3.5 h-3.5", isLocked ? "text-muted opacity-50" : "fill-current text-primary")} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
