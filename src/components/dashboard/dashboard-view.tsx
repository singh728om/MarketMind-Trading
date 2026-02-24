"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  Sparkles, BrainCircuit, Eye, XCircle, 
  ShoppingCart, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Power,
  BarChart3, Target, Info
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
  },
  {
    id: 'reliance-breakout',
    symbol: 'RELIANCE',
    name: 'Long Straddle',
    expiry: 'MAR END',
    badge: 'EVENT SPECIAL',
    description: 'High volatility expected ahead of results. Expecting a 3-5% move in either direction.',
    maxProfit: 'Unlimited',
    maxLoss: '₹6,500',
    confidence: 79,
    direction: 'BUY',
    entryPrice: 2980
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
    id: 'sig-tcs',
    symbol: 'TCS',
    segment: 'EQUITY',
    direction: 'BUY',
    type: 'VWAP Reversal',
    entry: 4120.00,
    target: 4200.00,
    stoploss: 4080.00,
    confidence: 82,
    qty: 5
  },
  {
    id: 'sig-infy',
    symbol: 'INFY',
    segment: 'EQUITY',
    direction: 'SELL',
    type: 'Resistance Rejection',
    entry: 1640.00,
    target: 1580.00,
    stoploss: 1665.00,
    confidence: 75,
    qty: 20
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
  },
  {
    id: 'sig-fn-ce',
    symbol: 'FINNIFTY 21600 CE',
    segment: 'F&O',
    direction: 'BUY',
    type: 'Momentum',
    entry: 85.00,
    target: 125.00,
    stoploss: 65.00,
    confidence: 85,
    qty: 40
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

  const fiiDiiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'fii_dii_data'), orderBy('date', 'desc'), limit(1));
  }, [firestore]);
  const { data: fiiDiiDocs } = useCollection(fiiDiiQuery);
  const latestFiiDii = fiiDiiDocs?.[0];

  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('status', '==', 'OPEN')
    );
  }, [firestore, userId]);
  const { data: openPositions } = useCollection(tradesQuery);

  const algosQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'algos'),
      where('status', '==', 'Deployed')
    );
  }, [firestore, userId]);
  const { data: activeAlgos } = useCollection(algosQuery);

  const totalPnL = 2450.50;
  const marketBias = "BULLISH";
  
  const getAiRecommendation = () => {
    if (marketBias === "BULLISH") return { text: "BUY", color: "text-bull", bg: "bg-bull/10" };
    if (marketBias === "BEARISH") return { text: "SELL", color: "text-bear", bg: "bg-bear/10" };
    return { text: "WATCH", color: "text-gold", bg: "bg-gold/10" };
  };
  const recommendation = getAiRecommendation();

  const getConviction = () => {
    if (!latestFiiDii) return "NEUTRAL";
    const net = (latestFiiDii.fiiCashNet || 0) + (latestFiiDii.diiNet || 0);
    if (net > 2000) return "HIGHLY BULLISH";
    if (net > 500) return "BULLISH";
    if (net < -2000) return "HIGHLY BEARISH";
    if (net < -500) return "BEARISH";
    return "NEUTRAL";
  };
  const conviction = getConviction();

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

  const handleExitPosition = (tradeId: string) => {
    if (!firestore || !userId) return;
    const tradeRef = doc(firestore, 'users', userId, 'trades', tradeId);
    updateDocumentNonBlocking(tradeRef, {
      status: 'CLOSED',
      exitPrice: 22500.50, 
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const nextStrategy = () => setStrategyIndex((prev) => (prev + 1) % FO_STRATEGIES.length);
  const prevStrategy = () => setStrategyIndex((prev) => (prev - 1 + FO_STRATEGIES.length) % FO_STRATEGIES.length);

  const currentStrategy = FO_STRATEGIES[strategyIndex];

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <MascotDigi expression="Happy" size="md" />
          <div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight">
              AI Command Center 🌊
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-bull" />
              Risk Guardian Active • Sentiment: {marketBias}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[160px]">
            <div className={cn("mono-font text-2xl font-extrabold", totalPnL >= 0 ? "text-bull" : "text-bear")}>
              ₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Session P&L</p>
          </div>

          <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[140px]">
            <div className="mono-font text-2xl font-extrabold text-primary">
              {openPositions?.length || 0}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Open Positions</p>
          </div>

          <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[140px]">
            <div className="mono-font text-2xl font-extrabold text-gold">
              {activeAlgos?.length || 0}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Active Algos</p>
          </div>
        </div>
      </div>

      {/* Intelligence Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-bull/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bull/10 text-bull">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">FII/DII Conviction</p>
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase">AI Strategy</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-sm font-bold", recommendation.color)}>{recommendation.text}</p>
                <Badge variant="outline" className={cn("text-[8px] font-bold h-4 px-1 border-none", recommendation.bg, recommendation.color)}>
                  SUGGESTED
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gold/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Vibe</p>
              <p className="text-sm font-bold text-gold">{marketBias}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI F&O Suggestion Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                AI F&O Intelligence
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevStrategy}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-bold text-muted-foreground">{strategyIndex + 1} / {FO_STRATEGIES.length}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextStrategy}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 p-3 rounded-xl border border-primary/5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Profit</p>
                        <p className="text-sm font-bold text-bull">{currentStrategy.maxProfit}</p>
                      </div>
                      <div className="bg-background/50 p-3 rounded-xl border border-primary/5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Loss</p>
                        <p className="text-sm font-bold text-bear">{currentStrategy.maxLoss}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white/40 backdrop-blur-sm flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground uppercase">AI Confidence</span>
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
                      QUICK TRADE EXECUTION
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Positions Manager */}
          {openPositions && openPositions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Active Positions
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-bull border-bull/20 bg-bull/5">
                  {openPositions.length} OPEN
                </Badge>
              </div>
              <div className="space-y-3">
                {openPositions.map((position) => (
                  <Card key={position.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
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
                            {position.qty} QTY • AVG ₹{position.entryPrice}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center gap-8 w-full md:w-auto">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Live P&L</p>
                          <p className={cn("text-sm font-bold mono-font", totalPnL >= 0 ? "text-bull" : "text-bear")}>
                            +₹1,240.00
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Status</p>
                          <Badge variant="outline" className="text-[9px] font-bold border-bull/20 text-bull">ACTIVE</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 md:flex-none h-9 text-[11px] font-bold gap-1.5 border-bear/20 text-bear hover:bg-bear hover:text-white"
                          onClick={() => handleExitPosition(position.id)}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          EXIT NOW
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Live AI Signal Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary animate-pulse" />
                Live AI Signals
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {AI_RECOMMENDED_SIGNALS.map((signal) => (
                <Card key={signal.id} className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all bg-card/50 backdrop-blur-sm">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    signal.direction === 'BUY' ? "bg-bull" : "bg-bear"
                  )} />
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{signal.symbol}</p>
                          <Badge variant="outline" className="text-[8px] font-bold h-4 px-1 border-muted-foreground/20 text-muted-foreground">
                            {signal.segment}
                          </Badge>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{signal.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                          <BrainCircuit className="w-3 h-3" />
                          {signal.confidence}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded-lg">
                      <div>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase">Entry Target</p>
                        <p className="text-xs font-bold mono-font">₹{signal.entry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-muted-foreground font-bold uppercase">Target 1</p>
                        <p className="text-xs font-bold mono-font text-bull">₹{signal.target}</p>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full h-8 text-[10px] font-bold gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none"
                      onClick={() => executeTrade({
                        symbol: signal.symbol,
                        side: signal.direction,
                        segment: signal.segment,
                        qty: signal.qty,
                        price: signal.entry,
                        strategy: 'AI Signal: ' + signal.type
                      })}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      QUICK TRADE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-purple border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Digi's Morning Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold p-2 bg-background/50 rounded-lg border border-primary/5">
                  <span className="text-muted-foreground uppercase">Conviction</span>
                  <span className={cn(
                    "font-bold uppercase",
                    conviction.includes('BULLISH') ? "text-bull" : conviction.includes('BEARISH') ? "text-bear" : "text-gold"
                  )}>
                    {conviction}
                  </span>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl text-[11px] leading-relaxed text-muted-foreground font-medium italic border border-primary/5">
                "FII conviction is high in large-caps today. Support at 22,350 is strong. Avoid aggressive shorts unless 22,280 breaks."
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-primary/10 overflow-hidden">
            <div className="bg-primary px-4 py-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Risk Guardian
              </div>
              <Badge variant="outline" className="text-[9px] border-white/40 text-white font-bold h-5 uppercase">Secure</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <MascotDigi expression="Coaching" size="sm" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-[11px] leading-relaxed font-medium italic">
                  "Great discipline today! No signs of FOMO. Stick to your targets."
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Daily Loss Cap</span>
                  <span className="text-bull">₹0 / ₹5,000</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* AI F&O Pro Recommendations */}
          <Card className="shadow-sm border-gold/10 overflow-hidden bg-gradient-to-br from-gold/[0.02] to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                AI F&O Pro Insights
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">
                Advanced Strike & OI Analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-card border border-gold/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">NIFTY Max Pain</p>
                    <p className="text-xs font-extrabold mono-font">22,450.00</p>
                    <p className="text-[8px] text-muted-foreground font-medium mt-0.5">Expect consolidation near this strike.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-card border border-primary/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">OI Buildup Alert</p>
                    <p className="text-xs font-extrabold mono-font text-bear">Resistance at 22,600</p>
                    <p className="text-[8px] text-muted-foreground font-medium mt-0.5">Heavy call writing detected at 22.6k strike.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-card border border-bull/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-bull/10 text-bull">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">PCR Trend</p>
                    <p className="text-xs font-extrabold mono-font text-bull">1.28 (Bullish)</p>
                    <p className="text-[8px] text-muted-foreground font-medium mt-0.5">Bullish divergence on the 15m timeframe.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl flex gap-3">
                <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "Pro-Tip: When Max Pain shifts upwards during the live session, it confirms institutional strength. Look for Bull Call Spreads."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
