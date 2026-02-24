"use client";

import React from 'react';
import { 
  ShieldAlert, Zap, Activity, Power, XCircle, Wallet,
  Radio, TrendingUp, ArrowUpRight, ArrowDownRight,
  Sparkles, BrainCircuit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useCollection, 
  useUser, 
  useFirestore, 
  useMemoFirebase,
  updateDocumentNonBlocking 
} from '@/firebase';
import { collection, query, where, doc, serverTimestamp, limit, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. Fetch Open Trades (Requires Auth)
  const openTradesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'trades'),
      where('status', '==', 'OPEN')
    );
  }, [firestore, user?.uid]);
  const { data: openTrades, isLoading: tradesLoading } = useCollection(openTradesQuery);

  // 2. Fetch Active Algos (Requires Auth)
  const activeAlgosQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'algos'),
      where('status', '==', 'Deployed')
    );
  }, [firestore, user?.uid]);
  const { data: activeAlgos, isLoading: algosLoading } = useCollection(activeAlgosQuery);

  // 3. Fetch Primary Broker Connection (Requires Auth)
  const brokerQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'broker_connections'),
      where('isPrimary', '==', true)
    );
  }, [firestore, user?.uid]);
  const { data: brokers } = useCollection(brokerQuery);
  const primaryBroker = brokers?.[0];

  // 4. Fetch Platform Signals (Public)
  const signalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'signals'),
      where('status', '==', 'ACTIVE'),
      orderBy('firedAt', 'desc'),
      limit(3)
    );
  }, [firestore]);
  const { data: signals } = useCollection(signalsQuery);

  // Actions
  const handleExitTrade = (tradeId: string) => {
    if (!user || !firestore) return;
    const tradeRef = doc(firestore, 'users', user.uid, 'trades', tradeId);
    updateDocumentNonBlocking(tradeRef, {
      status: 'CLOSED',
      closedAt: serverTimestamp(),
    });
  };

  const handleKillAll = () => {
    if (!user || !openTrades || !firestore) return;
    openTrades.forEach(trade => {
      handleExitTrade(trade.id);
    });
    activeAlgos?.forEach(algo => {
      const algoRef = doc(firestore, 'users', user.uid, 'algos', algo.id);
      updateDocumentNonBlocking(algoRef, { status: 'Paused' });
    });
  };

  const totalPnL = openTrades?.reduce((acc, trade) => acc + (trade.pnl || 0), 0) || 0;
  const riskPercent = Math.min(100, (Math.abs(totalPnL) / 5000) * 100);

  if (isUserLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[400px]" />
          <Skeleton className="lg:col-span-4 h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <MascotDigi expression={totalPnL >= 0 ? 'Happy' : 'Sweating'} size="md" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight">
              Good Morning, {user?.displayName?.split(' ')[0] || 'Trader'}! 🌅
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-bull" />
              AI Risk Guardian is active and protecting your capital.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[200px]">
          <div className={cn("mono-font text-3xl font-extrabold", totalPnL >= 0 ? "price-up" : "price-down")}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Session P&L (Unrealized)</p>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available Margin', value: `₹${primaryBroker?.availableMargin?.toLocaleString('en-IN') || '0.00'}`, icon: Wallet, color: 'text-primary' },
          { label: 'Active Positions', value: openTrades?.length || 0, icon: Activity, color: 'text-bull' },
          { label: 'Running Algos', value: activeAlgos?.length || 0, icon: Zap, color: 'text-gold' },
          { label: 'Risk Used', value: `${riskPercent.toFixed(1)}%`, icon: ShieldAlert, color: 'text-bear' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-sm font-bold mono-font">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Market and Execution */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Execution: Open Positions */}
          <Card className="shadow-purple border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
              <div>
                <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Execution
                </CardTitle>
                <CardDescription>Manage your active manual and algo trades</CardDescription>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 font-bold gap-2 shadow-lg"
                onClick={handleKillAll}
                disabled={!openTrades?.length && !activeAlgos?.length}
              >
                <Power className="w-3.5 h-3.5" />
                KILL ALL
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {!tradesLoading && (!openTrades || openTrades.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted rounded-full">
                      <Zap className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm font-medium">No open positions in the market.</p>
                  </div>
                )}
                {openTrades?.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm border",
                        trade.side === 'BUY' ? "bg-bull/5 text-bull border-bull/20" : "bg-bear/5 text-bear border-bear/20"
                      )}>
                        {trade.side}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base">{trade.symbol}</p>
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-bold">{trade.exchange}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{trade.segment} • {trade.qty} Qty</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-12">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Avg Entry</p>
                        <p className="mono-font text-sm font-bold">₹{trade.entryPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">PnL</p>
                        <p className={cn("mono-font text-base font-extrabold", (trade.pnl || 0) >= 0 ? "text-bull" : "text-bear")}>
                          {(trade.pnl || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-full border-bear/20 text-bear hover:bg-bear/5"
                        onClick={() => handleExitTrade(trade.id)}
                        title="Exit Position"
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Intelligence: Signals */}
          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary animate-pulse" />
              AI Signal Center
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals?.map((signal) => (
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
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Entry Zone</p>
                        <p className="text-xs font-bold mono-font">₹{signal.entryLow} - {signal.entryHigh}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-primary mb-1">
                          <BrainCircuit className="w-3 h-3" />
                          {signal.confidence}% Confidence
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!signals || signals.length === 0) && (
                <div className="col-span-3 text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm font-medium">
                  Scanning for high-probability signals...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Risk & Insights */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Risk Guardian Card */}
          <Card className="shadow-purple border-primary/10 bg-gradient-to-b from-primary/[0.02] to-transparent overflow-hidden">
            <div className="bg-primary px-4 py-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Risk Guardian Status
              </div>
              <Badge variant="outline" className="text-[9px] border-white/40 text-white font-bold h-5">LIVE</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <MascotDigi expression={riskPercent > 70 ? 'Alarmed' : riskPercent > 40 ? 'Thinking' : 'Coaching'} size="md" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-xs leading-relaxed font-medium">
                  {riskPercent > 80 
                    ? "Warning: You are approaching your daily loss limit. I recommend reducing your quantity." 
                    : riskPercent > 40
                    ? "Careful, losses are increasing. Stick to your A-plus setups only."
                    : "Market sentiment is positive. Your current exposure is well within limits. Keep trading disciplined!"}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase text-muted-foreground">
                  <span>Daily Loss Utilization</span>
                  <span className={cn(riskPercent > 70 ? "text-bear" : "text-bull")}>₹{Math.abs(totalPnL).toLocaleString()} / ₹5,000</span>
                </div>
                <Progress value={riskPercent} className="h-3 rounded-full bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Max Trades</p>
                  <p className="text-sm font-bold">4 / 15</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Emotion Score</p>
                  <p className="text-sm font-bold text-bull">Neutral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Intelligence: Market Briefing */}
          <Card className="shadow-purple border-none bg-primary/5 border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Digi's Morning Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold p-2 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">SGX NIFTY</span>
                  <span className="text-bull">+45 pts (0.22%)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold p-2 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">FII Conviction</span>
                  <span className="text-bull">Mildly Bullish</span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium italic">
                "Institutional data shows significant accumulation in Private Banks. Expect volatility near 22,500 resistance. Support at 22,380 is holding strong."
              </p>
              <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary flex items-center gap-1 group">
                Read Full Briefing
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Market Pulse Stats */}
          <Card className="shadow-purple border-none bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider text-muted-foreground">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold p-2 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5 uppercase">
                  <Activity className="w-3 h-3" /> PCR (Nifty)
                </span>
                <span className="mono-font text-bull">1.28</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold p-2 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-3 h-3" /> India VIX
                </span>
                <span className="mono-font text-bear">13.42 (-0.56%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold p-2">
                <span className="text-muted-foreground flex items-center gap-1.5 uppercase">
                  <BrainCircuit className="w-3 h-3" /> Bias Rating
                </span>
                <Badge className="bg-bull text-white text-[9px] font-bold">BULLISH</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}