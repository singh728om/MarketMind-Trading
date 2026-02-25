
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Sparkles, 
  Zap, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  ArrowRight,
  RefreshCcw,
  Search,
  Filter,
  BrainCircuit,
  Activity,
  MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import { generateTradingSignals, type AIGeneratedTradingSignalsOutput } from '@/ai/flows/ai-generated-trading-signals';
import { toast } from '@/hooks/use-toast';

export default function SignalCenter() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [segment, setSegment] = useState<'All' | 'Equity' | 'F&O'>('All');
  const [timeframe, setTimeframe] = useState<'Intraday' | 'Swing' | 'Positional'>('Intraday');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signals, setSignals] = useState<AIGeneratedTradingSignalsOutput['signals'] | null>(null);

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

  const fetchSignals = async () => {
    setIsRefreshing(true);
    try {
      const result = await generateTradingSignals({
        segment,
        timeframe,
      });
      setSignals(result.signals);
    } catch (error) {
      console.error("Signal Fetch Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [segment, timeframe]);

  const handleExecuteSignal = (signal: any) => {
    if (!firestore || !userId || isLocked) return;

    // Check for high-frequency lock
    if (recentTrades && recentTrades.length >= 4) {
      const fourthTradeTime = new Date(recentTrades[3].openedAt).getTime();
      if (Date.now() - fourthTradeTime < 60000) {
        toast({
          variant: "destructive",
          title: "LOCK TRIGGERED",
          description: "Execution speed too high. Cooling down for 2 hours."
        });
        addDocumentNonBlocking(collection(firestore, 'users', userId, 'risk_locks'), {
          userId,
          lockReason: 'High Frequency Execution',
          lockType: 'Auto',
          lockedAt: new Date().toISOString()
        });
        return;
      }
    }

    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol: signal.symbol,
      exchange: 'NSE',
      segment: signal.segment.toUpperCase(),
      side: signal.direction,
      qty: signal.segment === 'F&O' ? 50 : 10,
      entryPrice: signal.entryPrice,
      status: 'OPEN',
      brokerOrderId: 'SIG-' + Math.random().toString(36).substr(2, 7),
      strategyName: 'AI Signal: ' + signal.signalType,
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {isLocked && (
        <Card className="bg-bear/10 border-bear/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-bear font-bold uppercase text-xs">
            <ShieldAlert className="w-5 h-5" />
            Execution Bridge Locked • High-Frequency Alert
          </div>
          <Badge className="bg-bear">2H COOLDOWN</Badge>
        </Card>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary relative">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Signal Center</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Real-time Institutional Flow Setups
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 h-10 font-bold" onClick={fetchSignals} disabled={isRefreshing}>
          <RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> REFRESH
        </Button>
      </div>

      {!signals || isRefreshing ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <MascotDigi expression="Thinking" size="lg" className="animate-pulse" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scanning Liquidity Pools...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((signal, idx) => (
            <Card key={idx} className="group relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all shadow-sm bg-card">
              <div className={cn("absolute top-0 left-0 w-1.5 h-full", signal.direction === 'BUY' ? "bg-bull" : "bg-bear")} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight uppercase">{signal.symbol}</h3>
                    <Badge variant="outline" className="text-[8px] font-bold uppercase">{signal.segment}</Badge>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xl font-black tracking-tighter", signal.direction === 'BUY' ? "text-bull" : "text-bear")}>{signal.direction}</div>
                    <span className="text-[10px] font-bold text-primary">{signal.confidence}% Match</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/20 rounded-xl">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Entry</p>
                    <p className="text-sm font-extrabold">₹{signal.entryPrice.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-bear/5 border border-bear/10 rounded-xl">
                    <p className="text-[9px] font-bold text-bear uppercase">Stop-Loss</p>
                    <p className="text-sm font-extrabold text-bear">₹{signal.stopLossPrice.toLocaleString()}</p>
                  </div>
                </div>
                <Button 
                  className="w-full h-11 font-bold gap-2 shadow-purple"
                  disabled={isLocked}
                  onClick={() => handleExecuteSignal(signal)}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {isLocked ? "LOCK ACTIVE" : "EXECUTE SIGNAL"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
