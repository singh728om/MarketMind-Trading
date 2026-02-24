"use client";

import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Grid2X2, 
  Search, 
  Zap, 
  Activity, 
  Radio, 
  Target, 
  ShieldAlert, 
  Settings2,
  Clock,
  Terminal as TerminalIcon,
  Layout,
  Layers,
  ArrowRight,
  TrendingUp,
  XCircle,
  Plus
} from 'lucide-react';
import { TradingViewChart } from '@/components/market/trading-view-chart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { data: alerts } = useCollection(alertsQuery);

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
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 md:-m-6 lg:-m-8 bg-[#0D0D1A] overflow-hidden text-white">
      {/* Terminal Top Bar */}
      <div className="h-12 bg-[#161625] border-b border-white/10 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">DigiTerminal v2.0</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
            <Button 
              size="sm" 
              variant="ghost" 
              className={cn("h-7 px-2 text-[10px] font-bold uppercase", activeLayout === 'single' ? "bg-primary text-white" : "text-muted-foreground")}
              onClick={() => setActiveLayout('single')}
            >
              Single
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={cn("h-7 px-2 text-[10px] font-bold uppercase", activeLayout === '4-grid' ? "bg-primary text-white" : "text-muted-foreground")}
              onClick={() => setActiveLayout('4-grid')}
            >
              4-Grid
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">NIFTY 50</p>
              <p className="text-xs font-bold text-bull mono-font">22,450.30</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">BANK NIFTY</p>
              <p className="text-xs font-bold text-bear mono-font">48,230.00</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <Button size="sm" className="h-8 bg-bull hover:bg-bull/90 text-white font-bold text-[10px] gap-1.5">
            <Plus className="w-3 h-3" /> BUY
          </Button>
          <Button size="sm" className="h-8 bg-bear hover:bg-bear/90 text-white font-bold text-[10px] gap-1.5">
            <Plus className="w-3 h-3" /> SELL
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Chart Area */}
        <div className="flex-1 grid gap-px bg-white/5 relative">
          {activeLayout === 'single' ? (
            <TradingViewChart symbol={symbols[0]} theme="dark" hideBorder />
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-px">
              {symbols.map((s, i) => (
                <div key={i} className="relative">
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] font-bold uppercase">{s} • 5m</Badge>
                  </div>
                  <TradingViewChart symbol={s} theme="dark" hideBorder />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Cockpit Panel */}
        <div className="w-80 bg-[#161625] border-l border-white/10 flex flex-col">
          <Tabs defaultValue="signals" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full bg-black/40 border border-white/10 h-9 p-1 rounded-xl">
                <TabsTrigger value="signals" className="flex-1 rounded-lg text-[9px] font-bold uppercase">AI Signals</TabsTrigger>
                <TabsTrigger value="positions" className="flex-1 rounded-lg text-[9px] font-bold uppercase">Positions</TabsTrigger>
                <TabsTrigger value="risk" className="flex-1 rounded-lg text-[9px] font-bold uppercase">Risk</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="signals" className="flex-1 mt-0">
              <ScrollArea className="h-[calc(100vh-14rem)] px-4 py-4">
                <div className="space-y-3">
                  {(alerts || []).map((alert, i) => (
                    <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold">{alert.segment}</Badge>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-bold mb-1">{alert.symbol}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={cn("font-bold", alert.direction === 'BUY' ? "text-bull" : "text-bear")}>{alert.direction} @ {alert.entryLow}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 group-hover:bg-primary group-hover:text-white transition-colors" onClick={() => handleQuickTrade(alert.symbol)}>
                          <Zap className="w-3 h-3 fill-current" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!alerts || alerts.length === 0) && (
                    <div className="text-center py-10 opacity-30">
                      <Radio className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-[10px] font-bold uppercase">Awaiting Live Signals...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="positions" className="flex-1 mt-0">
              <ScrollArea className="h-[calc(100vh-14rem)] px-4 py-4">
                <div className="space-y-2">
                  {(positions || []).map((pos) => (
                    <div key={pos.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold">{pos.symbol}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{pos.qty} Units • Buy @ {pos.entryPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-bull">+₹1,240</p>
                        <Badge variant="outline" className="text-[8px] font-bold border-bull/20 text-bull">LIVE</Badge>
                      </div>
                    </div>
                  ))}
                  {(!positions || positions.length === 0) && (
                    <div className="text-center py-10 opacity-30">
                      <Layers className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase">No Open Positions</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="risk" className="flex-1 mt-0 p-4 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Daily Loss Cap</span>
                  <span className="text-bull">₹0 / ₹5,000</span>
                </div>
                <Progress value={0} className="h-1 bg-white/5" />
              </div>
              <div className="p-4 bg-bear/10 border border-bear/20 rounded-xl">
                <div className="flex items-center gap-2 text-bear font-bold text-[10px] uppercase mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Auto-Lock Protocol
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Safe-Lock is ARMED. Execution will be suspended if daily loss exceeds ₹5,000 or if revenge trading is detected.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <Button className="w-full h-10 font-bold bg-primary text-white shadow-purple gap-2 text-xs">
              <Settings2 className="w-4 h-4" />
              TERMINAL SETTINGS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
