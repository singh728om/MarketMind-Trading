
"use client";

import React from 'react';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  ShieldAlert, Clock, Info, ChevronRight, 
  Target, Zap, Activity, Power, XCircle, Wallet
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
import { collection, query, where, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. Fetch Open Trades
  const openTradesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'trades'),
      where('status', '==', 'OPEN')
    );
  }, [firestore, user?.uid]);
  const { data: openTrades, isLoading: tradesLoading } = useCollection(openTradesQuery);

  // 2. Fetch Active Algos
  const activeAlgosQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'algos'),
      where('status', '==', 'Deployed')
    );
  }, [firestore, user?.uid]);
  const { data: activeAlgos, isLoading: algosLoading } = useCollection(activeAlgosQuery);

  // 3. Fetch Primary Broker Connection (for funds)
  const brokerQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'broker_connections'),
      where('isPrimary', '==', true)
    );
  }, [firestore, user?.uid]);
  const { data: brokers, isLoading: brokersLoading } = useCollection(brokerQuery);
  const primaryBroker = brokers?.[0];

  // Actions
  const handleExitTrade = (tradeId: string) => {
    if (!user) return;
    const tradeRef = doc(firestore, 'users', user.uid, 'trades', tradeId);
    updateDocumentNonBlocking(tradeRef, {
      status: 'CLOSED',
      closedAt: serverTimestamp(),
      // In a real app, you'd fetch current market price for exitPrice
      exitPrice: 0, 
    });
  };

  const handleKillAll = () => {
    if (!user || !openTrades) return;
    openTrades.forEach(trade => {
      handleExitTrade(trade.id);
    });
    // Also pause active algos
    activeAlgos?.forEach(algo => {
      const algoRef = doc(firestore, 'users', user.uid, 'algos', algo.id);
      updateDocumentNonBlocking(algoRef, { status: 'Paused' });
    });
  };

  const totalPnL = openTrades?.reduce((acc, trade) => acc + (trade.pnl || 0), 0) || 0;

  if (isUserLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Trader'}! 🌅
          </h1>
          <p className="text-muted-foreground mt-1">Your AI guardian is monitoring your session.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className={cn("mono-font text-3xl font-extrabold", totalPnL >= 0 ? "price-up" : "price-down")}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Today's Unrealized P&L</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Open Positions Section */}
          <Card className="shadow-purple border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-headline font-bold">Open Positions</CardTitle>
                <CardDescription>Active trades currently in the market</CardDescription>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 font-bold gap-2"
                onClick={handleKillAll}
                disabled={!openTrades?.length && !activeAlgos?.length}
              >
                <Power className="w-3.5 h-3.5" />
                KILL ALL
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!tradesLoading && openTrades?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active positions found.
                  </div>
                )}
                {openTrades?.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-muted-foreground/10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                        trade.side === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {trade.side}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{trade.symbol}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{trade.segment} • {trade.qty} Lots</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Entry</p>
                        <p className="mono-font text-xs font-bold">{trade.entryPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">P&L</p>
                        <p className={cn("mono-font text-sm font-bold", (trade.pnl || 0) >= 0 ? "text-bull" : "text-bear")}>
                          {(trade.pnl || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-bear border-bear/20 hover:bg-bear/5"
                        onClick={() => handleExitTrade(trade.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Exit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Algos Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold" />
              Active Algos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAlgos?.map((algo) => (
                <Card key={algo.id} className="hover:border-primary/30 transition-all border-gold/20 bg-gold/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{algo.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Deployed • Capital: ₹{algo.capitalAllocated?.toLocaleString()}</p>
                    </div>
                    <Badge className="bg-bull text-white border-none text-[10px] animate-pulse">RUNNING</Badge>
                  </CardContent>
                </Card>
              ))}
              {!algosLoading && activeAlgos?.length === 0 && (
                <div className="col-span-2 text-center py-4 text-muted-foreground text-sm border border-dashed rounded-xl">
                  No algorithms currently deployed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account & Funds */}
          <Card className="shadow-purple border-none bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Available Margin</p>
                <p className="mono-font text-2xl font-extrabold text-primary">
                  ₹{primaryBroker?.availableMargin?.toLocaleString('en-IN') || '0.00'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">F&O Margin</p>
                  <p className="mono-font text-sm font-bold">₹{primaryBroker?.fnoMargin?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Broker</p>
                  <p className="text-sm font-bold truncate">{primaryBroker?.brokerName || 'Not Linked'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Guardian Bar */}
          <Card className="shadow-purple border-primary/10 overflow-hidden">
            <div className="bg-bull/5 border-b px-4 py-2 flex items-center justify-between">
               <div className="flex items-center gap-2 text-[10px] font-bold text-bull uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3" />
                  Risk Guardian: Active
               </div>
            </div>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>DAILY LOSS LIMIT</span>
                    <span className="text-bear">₹5,000</span>
                  </div>
                  <Progress value={Math.abs(totalPnL) / 50} className="h-2" />
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  <MascotDigi expression="Coaching" size="sm" className="inline-block mr-2 scale-75 -ml-2" />
                  You are {Math.abs(totalPnL) < 5000 ? 'within safe limits' : 'approaching limit'}. Digi is monitoring.
                </p>
            </CardContent>
          </Card>

          {/* FII/DII Today */}
          <Card className="shadow-purple border-none bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider text-muted-foreground">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground uppercase">PCR</span>
                <span className="mono-font text-bull">1.28</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground uppercase">INDIA VIX</span>
                <span className="mono-font text-bear">13.42</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
