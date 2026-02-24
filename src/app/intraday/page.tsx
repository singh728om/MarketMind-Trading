"use client";

import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Target, ShieldAlert, 
  TrendingUp, TrendingDown, Layers, 
  MousePointerClick, BarChart3, Clock,
  Flame, Crosshair, ArrowRight, Settings2,
  Lock, ShieldCheck, Thermometer, AlertTriangle,
  RotateCcw, Sliders, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  { symbol: 'TCS', price: 4120.00, change: '+2.1%', momentum: 94, trend: 'up', volume: '2.2x' },
  { symbol: 'HDFCBANK', price: 1450.20, change: '-0.4%', momentum: 42, trend: 'down', volume: '0.8x' },
  { symbol: 'INFY', price: 1640.50, change: '+0.8%', momentum: 75, trend: 'up', volume: '1.1x' },
  { symbol: 'ADANIENT', price: 3240.00, change: '+3.4%', momentum: 91, trend: 'up', volume: '3.0x' },
];

const EXPOSURE_DATA = [
  { sector: 'Banking', value: 45, color: 'bg-bull' },
  { sector: 'IT', value: 25, color: 'bg-primary' },
  { sector: 'Energy', value: 15, color: 'bg-gold' },
  { sector: 'FMCG', value: 15, color: 'bg-muted' },
];

export default function IntradayCockpit() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [autoLock, setAutoLock] = useState(true);
  const [slTrailing, setSLTrailing] = useState(true);
  const [dynamicSizing, setDynamicSizing] = useState(false);

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
      qty: 10,
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Time</p>
            <p className="mono-font text-lg font-extrabold">
              {currentTime ? currentTime.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--'}
            </p>
          </div>
          <div className="h-10 w-px bg-border hidden md:block" />
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Heat</p>
            <div className="flex items-center gap-2 justify-end">
              <Thermometer className="w-3.5 h-3.5 text-bull" />
              <Badge className="bg-bull/10 text-bull border-bull/20 font-bold">OPTIMAL</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Market & Execution */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Account Risk Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Capital Deployed</p>
                  <span className="text-xs font-bold text-primary">32%</span>
                </div>
                <Progress value={32} className="h-2" />
                <p className="text-[9px] text-muted-foreground font-medium">₹2.45 Cr in active trades</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Daily Drawdown</p>
                  <span className="text-xs font-bold text-bear">0.42%</span>
                </div>
                <Progress value={15} className="h-2" />
                <p className="text-[9px] text-muted-foreground font-medium">Max Limit: 3.00% (₹5.0L)</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Risk Per Trade</p>
                  <span className="text-xs font-bold text-gold">0.5%</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={cn("h-2 flex-1 rounded-full", i <= 2 ? "bg-bull" : "bg-muted")} />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground font-medium">Dynamically adjusted for VIX</p>
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
                <CardDescription className="text-xs font-medium">Real-time breakout & volume surge detection</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase">
                <Sliders className="w-3.5 h-3.5" />
                Filters
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${stock.momentum}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground">SCORE: {stock.momentum}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Last Traded</p>
                        <p className={cn("text-xs font-bold mono-font", stock.trend === 'up' ? "text-bull" : "text-bear")}>
                          ₹{stock.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="h-8 text-[10px] font-bold gap-1.5 shadow-sm"
                          onClick={() => handleQuickTrade(stock.symbol, stock.trend === 'up' ? 'BUY' : 'SELL', stock.price)}
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          TRADE
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exposure & Correlation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Layers className="w-4 h-4 text-primary" />
                  Exposure Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-8 w-full rounded-lg overflow-hidden border border-border">
                  {EXPOSURE_DATA.map((item, i) => (
                    <div 
                      key={i} 
                      className={cn(item.color, "h-full flex items-center justify-center transition-all hover:brightness-90 cursor-help")} 
                      style={{ width: `${item.value}%` }}
                      title={`${item.sector}: ${item.value}%`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {EXPOSURE_DATA.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.sector}</span>
                      <span className="text-[10px] font-bold ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-gold" />
                  Correlation Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[100px] space-y-2">
                <div className="relative w-full flex justify-center">
                   <div className="text-center">
                      <p className="text-2xl font-extrabold text-bull mono-font">LOW</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Portfolio Diversification</p>
                   </div>
                </div>
                <Badge variant="outline" className="text-[8px] bg-bull/5 text-bull border-bull/20">
                  <ShieldCheck className="w-2.5 h-2.5 mr-1" /> No Cluster Risk Detected
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Controls & Risk */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Auto Controls Terminal */}
          <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <Sliders className="w-4 h-4" />
                Auto-Control Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase">Max Loss Lock</span>
                    <span className="text-[9px] text-muted-foreground">Auto-disable trading on limit hit</span>
                  </div>
                  <Switch checked={autoLock} onCheckedChange={setAutoLock} />
                </div>

                <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase">SL Trailing</span>
                    <span className="text-[9px] text-muted-foreground">Automated profit protection</span>
                  </div>
                  <Switch checked={slTrailing} onCheckedChange={setSLTrailing} />
                </div>

                <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase">Dynamic Sizing</span>
                    <span className="text-[9px] text-muted-foreground">Volatility-adjusted lot sizes</span>
                  </div>
                  <Switch checked={dynamicSizing} onCheckedChange={setDynamicSizing} />
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-xl border border-dashed border-primary/20 space-y-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Lot Limit</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-extrabold mono-font">500</span>
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">AUTO-CALC</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overtrading Detection */}
          <Card className="shadow-sm border-bear/10 overflow-hidden bg-gradient-to-br from-bear/[0.03] to-transparent">
            <div className="bg-bear px-4 py-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" />
                Overtrading Shield
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <MascotDigi expression="Coaching" size="sm" className="shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-bear/5 text-[11px] leading-relaxed font-medium italic">
                    "You've taken 6 trades in the last hour. Your win rate tends to drop after the 5th trade. Consider cooling off."
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Trade Fatigue</span>
                      <span className="text-bear">60% - HIGH</span>
                    </div>
                    <Progress value={60} className="h-1.5" />
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full h-10 gap-2 text-xs font-bold border-bear/20 text-bear hover:bg-bear hover:text-white">
                <RotateCcw className="w-3.5 h-3.5" />
                RESET SESSION
              </Button>
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="h-12 flex-col items-center justify-center gap-1 group">
                <Eye className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase">Watchlist</span>
             </Button>
             <Button variant="outline" className="h-12 flex-col items-center justify-center gap-1 group">
                <BarChart3 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase">P&L Heat</span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
