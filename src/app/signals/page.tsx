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
  addDocumentNonBlocking 
} from '@/firebase';
import { collection } from 'firebase/firestore';
import { generateTradingSignals, type AIGeneratedTradingSignalsOutput } from '@/ai/flows/ai-generated-trading-signals';

export default function SignalCenter() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [segment, setSegment] = useState<'All' | 'Equity' | 'F&O'>('All');
  const [timeframe, setTimeframe] = useState<'Intraday' | 'Swing' | 'Positional'>('Intraday');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signals, setSignals] = useState<AIGeneratedTradingSignalsOutput['signals'] | null>(null);

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
    if (!firestore || !userId) return;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary relative">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-bull"></span>
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Signal Center</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Real-time Institutional Flow & Technical Setups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-bold" 
            onClick={fetchSignals}
            disabled={isRefreshing}
          >
            {isRefreshing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            REFRESH SIGNALS
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-dashed">
        <div className="flex items-center gap-2 px-4 border-r border-border/50 hidden md:flex">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Filters:</span>
        </div>
        <Tabs value={segment} onValueChange={(v: any) => setSegment(v)} className="w-full md:w-auto">
          <TabsList className="bg-background shadow-sm border h-10 p-1 rounded-xl">
            <TabsTrigger value="All" className="rounded-lg text-[10px] font-bold uppercase px-4">All Assets</TabsTrigger>
            <TabsTrigger value="Equity" className="rounded-lg text-[10px] font-bold uppercase px-4">Equity</TabsTrigger>
            <TabsTrigger value="F&O" className="rounded-lg text-[10px] font-bold uppercase px-4">F&O Only</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="h-6 w-px bg-border hidden md:block" />
        <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)} className="w-full md:w-auto">
          <TabsList className="bg-background shadow-sm border h-10 p-1 rounded-xl">
            <TabsTrigger value="Intraday" className="rounded-lg text-[10px] font-bold uppercase px-4">Intraday</TabsTrigger>
            <TabsTrigger value="Swing" className="rounded-lg text-[10px] font-bold uppercase px-4">Swing</TabsTrigger>
            <TabsTrigger value="Positional" className="rounded-lg text-[10px] font-bold uppercase px-4">Positional</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Signals Grid */}
      {!signals || isRefreshing ? (
        <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
          <MascotDigi expression="Thinking" size="lg" className="animate-pulse" />
          <div className="text-center space-y-2">
            <p className="text-lg font-bold">Scanning Global & Local Liquidity Pools...</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Running Multi-Factor Validation Flow</p>
          </div>
        </div>
      ) : signals.length === 0 ? (
        <Card className="h-[400px] flex flex-col items-center justify-center text-center p-10 bg-muted/10 border-none">
          <MascotDigi expression="Sad" size="md" />
          <div className="max-w-xs mt-4">
            <h3 className="font-bold text-lg">No High-Prob Signals Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Market regime is currently too volatile for high-confidence setups. Try a different timeframe.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {signals.map((signal, idx) => (
            <Card key={idx} className="group relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl bg-card">
              {/* Direction Indicator */}
              <div className={cn(
                "absolute top-0 left-0 w-1.5 h-full",
                signal.direction === 'BUY' ? "bg-bull" : "bg-bear"
              )} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold tracking-tight uppercase">{signal.symbol}</h3>
                      <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary uppercase">
                        {signal.segment}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {signal.signalType} • {signal.timeframe}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-xl font-black tracking-tighter",
                      signal.direction === 'BUY' ? "text-bull" : "text-bear"
                    )}>
                      {signal.direction}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <BrainCircuit className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary">{signal.confidence}% Confidence</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Entry & Risk Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Recommended Entry</p>
                    <p className="text-sm font-extrabold mono-font">₹{signal.entryPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-bear/5 border border-bear/10 rounded-xl space-y-1">
                    <p className="text-[9px] font-bold text-bear uppercase">Hard Stop-Loss</p>
                    <p className="text-sm font-extrabold mono-font text-bear">₹{signal.stopLossPrice.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Target Ladder */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" /> Profit Targets
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {signal.targetPrices.map((target, tIdx) => (
                      <div key={tIdx} className="p-2 bg-bull/5 border border-bull/10 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-bull/70 uppercase">T{tIdx + 1}</p>
                        <p className="text-xs font-bold mono-font text-bull">₹{target.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasoning Box */}
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-bold text-primary uppercase">AI Multi-Factor Logic</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground italic font-medium">
                    "{signal.geminiReasoning}"
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {signal.multiFactorBasis.map((tag, tagIdx) => (
                      <Badge key={tagIdx} className="bg-white/50 text-[8px] text-muted-foreground border-none px-1.5 h-4">
                        #{tag.replace(' ', '')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Execution Footer */}
                <div className="pt-2 border-t border-dashed space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Risk : Reward</span>
                    <Badge variant="secondary" className="text-[10px] font-bold">{signal.riskRewardRatio}</Badge>
                  </div>
                  <Button 
                    className="w-full h-11 font-bold gap-2 shadow-purple group"
                    onClick={() => handleExecuteSignal(signal)}
                  >
                    <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                    EXECUTE SIGNAL NOW
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pro-Tips / Market State Bar */}
      <Card className="border-gold/20 bg-gold/5 shadow-sm overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MascotDigi expression="Coaching" size="sm" />
            <div>
              <p className="text-xs font-bold uppercase text-gold tracking-widest">Digi's Secret Sauce</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Signals with confidence {'>'} 85% and "FII Buying" as a multi-factor basis have a 22% higher strike rate in the first 2 hours of the market.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge className="bg-gold text-white font-bold text-[9px] uppercase">Market Regime: Trending</Badge>
            <div className="h-8 w-px bg-gold/20" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Next Scan in</span>
              <span className="text-xs font-bold mono-font">04:52</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
