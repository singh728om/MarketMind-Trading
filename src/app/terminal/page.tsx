"use client";

import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Grid2X2, 
  Zap, 
  Activity, 
  Radio, 
  Target, 
  ShieldAlert, 
  Settings2,
  Terminal as TerminalIcon,
  Layers,
  TrendingUp,
  XCircle,
  Plus,
  RefreshCcw
} from 'lucide-react';
import { TradingViewChart } from '@/components/market/trading-view-chart';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useFirebase, 
  useUser, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking 
} from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { cn } from "@/lib/utils";

export default function TerminalPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [activeLayout, setActiveLayout] = useState<'single' | '4-grid'>('4-grid');
  const [symbols, setSymbols] = useState(['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS']);

  // Live Alerts Feed
  const alertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'signals'), limit(5));
  }, [firestore]);
  const { data: alerts, isLoading: isAlertsLoading } = useCollection(alertsQuery);

  // Active Positions
  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      where('status', '==', 'OPEN'),
      orderBy('openedAt', 'desc')
    );
  }, [firestore, userId]);
  const { data: positions } = useCollection(tradesQuery);

  const handleQuickTrade = (symbol: string) => {
    if (!firestore || !userId) return;
    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol,
      exchange: 'NSE',
      segment: 'EQUITY',
      side: 'BUY',
      qty: 10,
      entryPrice: 2950.40, // Mock price
      status: 'OPEN',
      brokerOrderId: 'TRM-' + Math.random().toString(36).substr(2, 7),
      strategyName: 'Terminal Quick Execute',
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 md:-m-6 lg:-m-8 bg-[#0D0D1A] overflow-hidden text-white border-t border-white/5">
      {/* Terminal Top Bar */}
      <div className="h-14 bg-[#161625] border-b border-white/10 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-primary font-bold">
            <div className="p-1.5 rounded bg-primary/10">
              <TerminalIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">DigiTerminal v2.4</span>
          </div>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <Button 
              size="sm" 
              variant="ghost" 
              className={cn(
                "h-7 px-3 text-[9px] font-bold uppercase rounded-lg transition-all", 
                activeLayout === 'single' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
              onClick={() => setActiveLayout('single')}
            >
              Single
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={cn(
                "h-7 px-3 text-[9px] font-bold uppercase rounded-lg transition-all", 
                activeLayout === '4-grid' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
              onClick={() => setActiveLayout('4-grid')}
            >
              4-Grid
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">NIFTY 50</p>
              <p className="text-xs font-bold text-bull mono-font">22,450.30</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">BANK NIFTY</p>
              <p className="text-xs font-bold text-bear mono-font">48,230.00</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 bg-bull hover:bg-bull/90 text-white font-black text-[10px] gap-1.5 px-4 shadow-lg shadow-bull/10">
              <Plus className="w-3.5 h-3.5" /> BUY
            </Button>
            <Button size="sm" className="h-8 bg-bear hover:bg-bear/90 text-white font-black text-[10px] gap-1.5 px-4 shadow-lg shadow-bear/10">
              <Plus className="w-3.5 h-3.5" /> SELL
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Chart Area */}
        <div className="flex-1 grid gap-px bg-white/5 relative overflow-hidden">
          {activeLayout === 'single' ? (
            <TradingViewChart symbol={symbols[0]} theme="dark" hideBorder />
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-px">
              {symbols.map((s, i) => (
                <div key={i} className="relative group overflow-hidden">
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                    <Badge className="bg-black/80 backdrop-blur-md border-white/10 text-[9px] font-bold uppercase py-0.5 px-2">
                      {s} • 5m
                    </Badge>
                  </div>
                  <TradingViewChart symbol={s} theme="dark" hideBorder />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Cockpit Panel */}
        <div className="w-80 bg-[#11111F] border-l border-white/10 flex flex-col shrink-0">
          <Tabs defaultValue="signals" className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-4 shrink-0">
              <TabsList className="w-full bg-black/40 border border-white/5 h-10 p-1 rounded-xl">
                <TabsTrigger value="signals" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">AI Signals</TabsTrigger>
                <TabsTrigger value="positions" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">Positions</TabsTrigger>
                <TabsTrigger value="risk" className="flex-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">Risk</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="signals" className="flex-1 mt-0 min-h-0">
              <ScrollArea className="h-full px-4 py-4">
                <div className="space-y-3">
                  {isAlertsLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (alerts || []).map((alert, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase">{alert.segment}</Badge>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase mono-font">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-black tracking-tight mb-1">{alert.symbol}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={cn("font-bold mono-font", alert.direction === 'BUY' ? "text-bull" : "text-bear")}>
                          {alert.direction} @ {alert.entryLow}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-primary hover:text-white transition-colors" onClick={() => handleQuickTrade(alert.symbol)}>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!alerts || alerts.length === 0) && !isAlertsLoading && (
                    <div className="text-center py-16 opacity-30">
                      <Radio className="w-10 h-10 mx-auto mb-3 animate-pulse text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Live Feed...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="positions" className="flex-1 mt-0 min-h-0">
              <ScrollArea className="h-full px-4 py-4">
                <div className="space-y-2">
                  {(positions || []).map((pos) => (
                    <div key={pos.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-colors">
                      <div>
                        <p className="text-xs font-bold tracking-tight">{pos.symbol}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">{pos.qty} Units • Buy @ {pos.entryPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-bull mono-font">+₹1,240</p>
                        <Badge variant="outline" className="text-[8px] font-bold border-bull/20 text-bull py-0 h-4">LIVE</Badge>
                      </div>
                    </div>
                  ))}
                  {(!positions || positions.length === 0) && (
                    <div className="text-center py-16 opacity-30">
                      <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Open Positions</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="risk" className="flex-1 mt-0 p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Daily Loss Cap</span>
                  <span className="text-bull mono-font">₹0 / ₹5,000</span>
                </div>
                <Progress value={0} className="h-1 bg-white/5" />
              </div>
              <div className="p-4 bg-bear/10 border border-bear/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-bear font-black text-[10px] uppercase tracking-widest">
                  <ShieldAlert className="w-4 h-4" />
                  Auto-Lock Protocol
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
                  Safe-Lock is <span className="text-bear font-bold">ARMED</span>. Execution will be suspended if daily loss exceeds ₹5,000 or if revenge patterns reach critical threshold.
                </p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                  <Activity className="w-4 h-4" />
                  Health Check
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-muted-foreground">LATENCY</span>
                  <span className="text-bull">14ms</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
            <Button className="w-full h-11 font-black bg-primary text-white shadow-lg shadow-primary/10 gap-2 text-[10px] uppercase tracking-widest">
              <Settings2 className="w-4 h-4" />
              TERMINAL SETTINGS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
