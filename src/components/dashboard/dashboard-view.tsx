"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  Sparkles, BrainCircuit, Eye, XCircle, 
  ShoppingCart, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Power,
  BarChart3, Target, Info,
  AlertTriangle
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
import { collection, query, orderBy, limit, where, doc, Timestamp } from 'firebase/firestore';

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
  },
  {
    id: 'nifty-iron-condor',
    symbol: 'NIFTY',
    name: 'Short Iron Condor',
    expiry: '21 MAR',
    badge: 'RANGE-BOUND',
    description: 'VIX is stabilizing. NIFTY expected to stay between 22,200 - 22,600. Strategy: Multi-leg credit spread.',
    maxProfit: '₹5,600',
    maxLoss: '₹2,400',
    confidence: 81,
    direction: 'SELL',
    entryPrice: 22400
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
  },
  {
    id: 'sig-bn-pe',
    symbol: 'BANKNIFTY 48200 PE',
    segment: 'F&O',
    direction: 'BUY',
    type: 'Trend Ride',
    entry: 210.50,
    target: 280.00,
    stoploss: 175.00,
    confidence: 79,
    qty: 15
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

  // Fetch FII/DII for Conviction
  const fiiDiiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'fii_dii_data'), orderBy('date', 'desc'), limit(1));
  }, [firestore]);
  const { data: fiiDiiDocs } = useCollection(fiiDiiQuery);
  const latestFiiDii = fiiDiiDocs?.[0];

  // Fetch All Today's Trades for Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const allTradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('openedAt', '>=', todayIso)
    );
  }, [firestore, userId, todayIso]);
  const { data: todayTrades } = useCollection(allTradesQuery);

  // Compute Dashboard Stats
  const stats = useMemo(() => {
    if (!todayTrades) return { sessionPnL: 0, openCount: 0, totalTrades: 0, riskFactor: 0 };
    
    const openCount = todayTrades.filter(t => t.status === 'OPEN').length;
    const closedTrades = todayTrades.filter(t => t.status === 'CLOSED');
    const sessionPnL = closedTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    
    // Risk Factor: Percentage of daily trade limit (e.g. 10 trades)
    const riskFactor = Math.min((todayTrades.length / 10) * 100, 100);

    return {
      sessionPnL,
      openCount,
      totalTrades: todayTrades.length,
      riskFactor
    };
  }, [todayTrades]);

  // Conviction Logic
  const getConviction = () => {
    if (!latestFiiDii) return "STABLE";
    const net = (latestFiiDii.fiiCashNet || 0);
    if (net > 2000) return "VERY BULLISH";
    if (net > 0) return "MODERATELY BULLISH";
    if (net < -2000) return "VERY BEARISH";
    return "CAUTIOUS";
  };
  const conviction = getConviction();

  // Guardian Expression and Message Logic
  const guardianStatus = useMemo(() => {
    if (stats.riskFactor > 80) {
      return { 
        expression: 'Sweating' as const, 
        message: "Warning! You've reached 80% of your daily trade limit. Risk of emotional fatigue is high. Consider cooling off.",
        status: 'CRITICAL'
      };
    }
    if (stats.openCount > 3) {
      return { 
        expression: 'Thinking' as const, 
        message: "You have several open positions. Focus on managing these before scanning for new signals.",
        status: 'HEAVY'
      };
    }
    if (stats.sessionPnL < -2000) {
      return { 
        expression: 'Sad' as const, 
        message: "Tough session so far. Stick to your stop-losses. Digi is watching for revenge patterns.",
        status: 'CAUTION'
      };
    }
    return { 
      expression: 'Coaching' as const, 
      message: "Session is stable. Your execution timing is aligned with institutional flows. Stay disciplined!",
      status: 'SECURE'
    };
  }, [stats]);

  const executeTrade = (tradeData: { symbol: string, side: string, segment: string, qty: number, price: number, strategy: string }) => {
    if (!firestore || !userId) return;
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
    
    // Simulate exit price based on direction
    const exitPrice = entryPrice * 1.02; // Mock 2% gain for UI demo
    const pnl = (exitPrice - entryPrice) * 10; // Qty 10 mock

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
      {/* Real-time Header Stats */}
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

      {/* Institutional Conviction Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-bull/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bull/10 text-bull">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">FII/DII Net Flow</p>
              <p className="text-sm font-bold text-bull">{conviction}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">AI Recommended Bias</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-bull">BULLISH</p>
                <Badge variant="outline" className="text-[8px] font-bold h-4 px-1 border-none bg-bull/10 text-bull">
                  HIGH CONFIDENCE
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gold/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Guardrails</p>
              <p className="text-sm font-bold text-gold">REVENGE SHIELD ACTIVE</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Positions UI */}
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
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
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
                    
                    <div className="flex-1 flex items-center justify-center gap-8 w-full md:w-auto">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Segment</p>
                        <Badge variant="secondary" className="text-[9px] font-bold">{position.segment}</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Account Risk</p>
                        <p className="text-xs font-bold text-primary">0.5%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 md:flex-none h-9 text-[11px] font-bold gap-1.5 border-bear/20 text-bear hover:bg-bear hover:text-white"
                        onClick={() => handleExitPosition(position.id, position.entryPrice)}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        AUTO-EXIT (MOCK)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {stats.openCount === 0 && (
                <div className="py-12 border-2 border-dashed rounded-3xl text-center space-y-3 bg-muted/5">
                  <Info className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No active market exposure detected</p>
                  <Button variant="link" className="text-[10px] font-bold uppercase text-primary">SCAN FOR NEW SIGNALS</Button>
                </div>
              )}
            </div>
          </div>

          {/* AI F&O Intel - Rotating Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              AI F&O Pro Intelligence
            </h3>
            <Card className="border-primary/20 bg-primary/5 shadow-purple overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-6 space-y-4 border-r border-primary/10">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold uppercase">{currentStrategy.badge}</Badge>
                      <span className="text-xs font-bold text-muted-foreground">EXP: {currentStrategy.expiry}</span>
                    </div>
                    <h4 className="text-xl font-bold">{currentStrategy.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                      {currentStrategy.description}
                    </p>
                  </div>
                  <div className="p-6 bg-white/40 backdrop-blur-sm flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground uppercase">AI Conviction Weight</span>
                        <span className="text-primary">{currentStrategy.confidence}%</span>
                      </div>
                      <Progress value={currentStrategy.confidence} className="h-1.5" />
                    </div>
                    <Button 
                      className="w-full h-12 text-sm font-bold gap-2 shadow-purple"
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
                      DEPLOY STRATEGY
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dynamic Risk Guardian Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-primary/10 overflow-hidden">
            <div className={cn(
              "px-4 py-2 flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-widest",
              guardianStatus.status === 'CRITICAL' ? "bg-bear animate-pulse" : "bg-primary"
            )}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                AI Risk Guardian
              </div>
              <Badge variant="outline" className="text-[9px] border-white/40 text-white font-bold h-5 uppercase">
                {guardianStatus.status}
              </Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <MascotDigi expression={guardianStatus.expression} size="sm" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-[11px] leading-relaxed font-medium italic">
                  "{guardianStatus.message}"
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Session Capacity (Trade Limit)</span>
                    <span className={cn(stats.riskFactor > 80 ? "text-bear" : "text-primary")}>
                      {stats.totalTrades} / 10
                    </span>
                  </div>
                  <Progress value={stats.riskFactor} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-xl border border-primary/5 flex flex-col items-center text-center">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Revenge Risk</p>
                    <p className={cn("text-xs font-extrabold mt-1", stats.riskFactor > 70 ? "text-bear" : "text-bull")}>
                      {stats.riskFactor > 70 ? "HIGH" : "LOW"}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-primary/5 flex flex-col items-center text-center">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Fatigue Level</p>
                    <p className={cn("text-xs font-extrabold mt-1", stats.totalTrades > 5 ? "text-gold" : "text-bull")}>
                      {stats.totalTrades > 5 ? "MODERATE" : "LOW"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick AI Signal Stream */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Top AI Alpha Signals
            </h3>
            <div className="space-y-3">
              {AI_RECOMMENDED_SIGNALS.map(s => (
                <Card key={s.id} className="border-none shadow-sm hover:border-primary/20 transition-all cursor-pointer bg-white">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]",
                        s.direction === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {s.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{s.symbol}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{s.type}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-[10px] font-extrabold mono-font text-bull">₹{s.entry}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{s.confidence}% Match</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => executeTrade({
                          symbol: s.symbol,
                          side: s.direction,
                          segment: s.segment,
                          qty: s.qty,
                          price: s.entry,
                          strategy: 'AI Alpha Signal'
                        })}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Market Sentiment Barometer (Visual) */}
          <Card className="shadow-sm border-gold/10 bg-gradient-to-br from-gold/[0.02] to-transparent overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Institutional Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-center h-20 relative">
                <div className="text-center">
                  <p className="text-2xl font-black text-gold tracking-tighter uppercase">ACCUMULATION</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 italic">Institutions are holding support</p>
                </div>
              </div>
              <div className="pt-2 border-t border-gold/10 grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Advancing</span>
                  <span className="text-[9px] font-bold text-bull">1,240</span>
                </div>
                <div className="flex items-center justify-between px-2 border-l">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Declining</span>
                  <span className="text-[9px] font-bold text-bear">680</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
