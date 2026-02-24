"use client";

import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Target, ShieldAlert, 
  TrendingUp, TrendingDown, Layers, 
  MousePointerClick, BarChart3, Clock,
  Flame, Crosshair, ArrowRight, Settings2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  addDocumentNonBlocking 
} from '@/firebase';
import { collection } from 'firebase/firestore';

const MOMENTUM_STOCKS = [
  { symbol: 'RELIANCE', price: 2950.40, change: '+1.2%', momentum: 88, trend: 'up', volume: '1.5x' },
  { symbol: 'HDFCBANK', price: 1450.20, change: '-0.4%', momentum: 42, trend: 'down', volume: '0.8x' },
  { symbol: 'TCS', price: 4120.00, change: '+2.1%', momentum: 94, trend: 'up', volume: '2.2x' },
  { symbol: 'INFY', price: 1640.50, change: '+0.8%', momentum: 75, trend: 'up', volume: '1.1x' },
  { symbol: 'ADANIENT', price: 3240.00, change: '+3.4%', momentum: 91, trend: 'up', volume: '3.0x' },
];

const SCANNERS = [
  { name: 'High Volume Breakout', description: 'Stocks breaking R1 with > 2x average volume.', count: 12 },
  { name: 'VWAP Reversal', description: 'Price crossing VWAP from below with bullish RSI.', count: 5 },
  { name: 'Opening Range Breakout', description: 'Breaking 15-min high/low levels.', count: 8 },
  { name: 'Short Covering', description: 'Falling OI with rising prices in F&O.', count: 4 },
];

export default function IntradayCockpit() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickTrade = (symbol: string, side: 'BUY' | 'SELL', price: number) => {
    if (!firestore || !userId) return;
    const tradesRef = collection(firestore, 'users', userId, 'trades');
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol,
      exchange: 'NSE',
      segment: 'EQUITY',
      side,
      qty: 10, // Default Intraday Qty
      entryPrice: price,
      status: 'OPEN',
      brokerOrderId: 'COCKPIT-' + Math.random().toString(36).substr(2, 7),
      strategyName: 'Intraday Momentum',
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Intraday Cockpit</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-bull animate-pulse" />
              Live Market Session • NSE / BSE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Session Timer</p>
            <p className="mono-font text-lg font-bold">
              {currentTime ? currentTime.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--'}
            </p>
          </div>
          <div className="h-10 w-px bg-border hidden md:block" />
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Sentiment</p>
            <Badge className="bg-bull/10 text-bull border-bull/20 font-bold">EXCELLENT</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Control Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Market Breadth & Heatmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-bull/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-bull" />
                  Market Breath (Advance/Decline)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-bull">38 Advance</span>
                  <span className="text-xs font-bold text-bear">12 Decline</span>
                </div>
                <div className="h-3 w-full bg-bear/20 rounded-full overflow-hidden flex">
                  <div className="h-full bg-bull" style={{ width: '76%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Strong bullish divergence detected in Midcap index.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Intraday Volume Intensity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary">High Intensity</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">TCS @ 2.2x</span>
                </div>
                <Progress value={85} className="h-3" />
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  TCS and RELIANCE driving 40% of session volume.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Momentum Scanner */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-bear" />
                  AI Momentum Scanner
                </CardTitle>
                <CardDescription className="text-xs font-medium">Real-time breakout detection</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase">
                <Settings2 className="w-3.5 h-3.5" />
                Configure
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOMENTUM_STOCKS.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                        stock.trend === 'up' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      )}>
                        {stock.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{stock.symbol}</span>
                          <Badge variant="outline" className="text-[8px] font-bold h-4 px-1">{stock.volume} VOL</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Momentum Score: {stock.momentum}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Live Price</p>
                        <p className={cn("text-xs font-bold mono-font", stock.trend === 'up' ? "text-bull" : "text-bear")}>
                          ₹{stock.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] font-bold gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                          onClick={() => handleQuickTrade(stock.symbol, stock.trend === 'up' ? 'BUY' : 'SELL', stock.price)}
                        >
                          <MousePointerClick className="w-3 h-3" />
                          QUICK
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategy Scanners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCANNERS.map((scan) => (
              <Card key={scan.name} className="group cursor-pointer border-none shadow-sm hover:shadow-md transition-all bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold">{scan.name}</h4>
                      <Badge className="bg-primary/20 text-primary border-none text-[10px]">{scan.count} Hits</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">{scan.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Cockpit Bar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Intraday Execution Terminal */}
          <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <MousePointerClick className="w-4 h-4" />
                Quick Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-background/80 p-4 rounded-xl border border-primary/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Instrument</span>
                    <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary">NSE: NIFTY 50</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="flex-1 h-12 bg-bull hover:bg-bull/90 text-white font-bold gap-2">
                      <TrendingUp className="w-4 h-4" />
                      BUY
                    </Button>
                    <Button className="flex-1 h-12 bg-bear hover:bg-bear/90 text-white font-bold gap-2">
                      <TrendingDown className="w-4 h-4" />
                      SELL
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-9 text-[10px] font-bold border-primary/10">MARKET</Button>
                  <Button variant="outline" className="h-9 text-[10px] font-bold border-primary/10">LIMIT</Button>
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-xl border border-dashed border-primary/20 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Margin Required</span>
                  <span className="text-foreground">₹28,450.00</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Available Funds</span>
                  <span className="text-bull">₹8.42 Cr</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intraday Risk Shield */}
          <Card className="shadow-sm border-bear/10 overflow-hidden">
            <div className="bg-bear px-4 py-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Intraday Risk Shield
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <MascotDigi expression="Thinking" size="sm" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-bear/5 text-[11px] leading-relaxed font-medium italic">
                  "Market volatility is rising. I recommend tightening stop-losses to 0.5%."
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Trade Capacity</span>
                    <span className="text-primary">6 / 10 Trades</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Loss Limit Buffer</span>
                    <span className="text-bull">₹5,000 Safe</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <div className="space-y-3">
             <Button variant="outline" className="w-full h-12 justify-between group shadow-sm">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Crosshair className="w-4 h-4 text-primary" />
                  Scalper Mode
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </Button>
             <Button variant="outline" className="w-full h-12 justify-between group shadow-sm">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Target className="w-4 h-4 text-primary" />
                  Day Range Tracker
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
