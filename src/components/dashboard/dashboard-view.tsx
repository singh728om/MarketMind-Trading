"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  ArrowUpRight, Sparkles, BrainCircuit, LineChart,
  Search, Eye, ArrowRightLeft, Power, XCircle, 
  CheckCircle2, Info, ShoppingCart
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

export function Dashboard() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  // Hydration safety for local time
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Latest FII/DII Data
  const fiiDiiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'fii_dii_data'), orderBy('date', 'desc'), limit(1));
  }, [firestore]);
  const { data: fiiDiiDocs } = useCollection(fiiDiiQuery);
  const latestFiiDii = fiiDiiDocs?.[0];

  // Fetch Latest AI Signals
  const signalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'signals'), orderBy('firedAt', 'desc'), limit(3));
  }, [firestore]);
  const { data: liveSignals } = useCollection(signalsQuery);

  // Fetch User's Open Positions
  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('status', '==', 'OPEN')
    );
  }, [firestore, userId]);
  const { data: openPositions } = useCollection(tradesQuery);

  // Fallback / Mock AI Stats
  const totalPnL = 2450.50;
  const riskPercent = 32;
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

  // Handle Quick Trade Execution
  const handleQuickTrade = (signal: any) => {
    if (!firestore || !userId) return;
    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol: signal.symbol,
      exchange: signal.exchange || 'NSE',
      segment: signal.segment || 'F&O',
      side: signal.direction,
      qty: 50, // Default lot size for simulation
      entryPrice: signal.entryLow || 0,
      status: 'OPEN',
      brokerOrderId: 'QT-' + Math.random().toString(36).substr(2, 9),
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  // Handle Position Exit
  const handleExitPosition = (tradeId: string) => {
    if (!firestore || !userId) return;
    const tradeRef = doc(firestore, 'users', userId, 'trades', tradeId);
    updateDocumentNonBlocking(tradeRef, {
      status: 'CLOSED',
      exitPrice: 22500.50, // Mock exit price
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

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
        <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[200px]">
          <div className={cn("mono-font text-2xl font-extrabold", totalPnL >= 0 ? "text-bull" : "text-bear")}>
            ₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Session P&L</p>
        </div>
      </div>

      {/* Intelligence Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-bull/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bull/10 text-bull">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">FII/DII Conviction</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-bull">{conviction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
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
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Vibe</p>
              <p className="text-sm font-bold text-gold">{marketBias}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signals & Intelligence */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI F&O Suggestion Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                AI F&O Intelligence
              </h3>
            </div>
            <Card className="border-primary/20 bg-primary/5 shadow-purple overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-6 space-y-4 border-r border-primary/10">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold">NIFTY WEEKLY</Badge>
                      <span className="text-xs font-bold text-muted-foreground">EXP: 21 MAR</span>
                    </div>
                    <h4 className="text-xl font-bold">Bull Call Spread</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      High OI buildup at 22,400 PE and rising PCR indicates strong support. 
                      Strategy: Buy 22,450 CE / Sell 22,600 CE.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 p-3 rounded-xl border border-primary/5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Profit</p>
                        <p className="text-sm font-bold text-bull">₹8,450</p>
                      </div>
                      <div className="bg-background/50 p-3 rounded-xl border border-primary/5">
                        <p className="text-sm font-bold text-bear">₹3,200</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Loss</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white/40 backdrop-blur-sm flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground uppercase">Confidence</span>
                        <span className="text-primary">84%</span>
                      </div>
                      <Progress value={84} className="h-1.5" />
                    </div>
                    <Button 
                      className="w-full h-12 text-sm font-bold gap-2 shadow-purple"
                      onClick={() => handleQuickTrade({ symbol: 'NIFTY', direction: 'BUY', entryLow: 22450 })}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      QUICK TRADE EXECUTION
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground font-medium">
                      One-tap execution with AI Risk Guardian protection.
                    </p>
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
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Current Price</p>
                          <p className="text-sm font-bold mono-font">₹22,485.20</p>
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Signal Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary animate-pulse" />
                Live AI Signals
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveSignals?.map((signal) => (
                <Card key={signal.id} className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all bg-card/50 backdrop-blur-sm">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    signal.direction === 'BUY' ? "bg-bull" : "bg-bear"
                  )} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold">{signal.symbol}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{signal.signalType}</p>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-bold border-none",
                        signal.direction === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {signal.direction}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Target</p>
                        <p className="text-xs font-bold mono-font text-bull">₹{signal.target1}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-primary mb-1">
                          <BrainCircuit className="w-3 h-3" />
                          {signal.confidence}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Morning Intel */}
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

          {/* Risk Guardian */}
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
                <Progress value={riskPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Health</p>
                  <p className="text-sm font-bold text-bull">96%</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Focus</p>
                  <p className="text-sm font-bold">STABLE</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Pulse */}
          <Card className="shadow-sm border-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold p-2 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5 uppercase">
                  <Activity className="w-3 h-3" /> PCR (Nifty)
                </span>
                <span className="mono-font text-bull font-bold">1.28</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold p-2">
                <span className="text-muted-foreground flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-3 h-3" /> India VIX
                </span>
                <span className="mono-font text-bear font-bold">13.42 (-0.56%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
