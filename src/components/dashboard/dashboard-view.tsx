"use client";

import React from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  ArrowUpRight, Sparkles, BrainCircuit, Wallet,
  Search, LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export function Dashboard() {
  // Static state for AI-focused view
  const totalPnL = 2450.50;
  const riskPercent = 32;

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <MascotDigi expression="Happy" size="md" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight">
              Good Morning, Ajay! 🌅
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-bull" />
              AI Risk Guardian is active and protecting your capital.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[200px]">
          <div className={cn("mono-font text-3xl font-extrabold", totalPnL >= 0 ? "price-up" : "price-down")}>
            +{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Today's Session P&L</p>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Market Mode', value: 'BULLISH', icon: LineChart, color: 'text-bull' },
          { label: 'Active Signals', value: '12', icon: Radio, color: 'text-primary' },
          { label: 'Health Score', value: '94/100', icon: Activity, color: 'text-bull' },
          { label: 'Risk Used', value: `${riskPercent}%`, icon: ShieldAlert, color: 'text-neutral' },
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
        {/* Left Section: AI Intelligence */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Signal Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary animate-pulse" />
                AI Signal Center
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider text-primary">
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { symbol: 'RELIANCE', direction: 'BUY', confidence: 88, zone: '2840-2855', type: 'Breakout' },
                { symbol: 'NIFTY 22400 CE', direction: 'BUY', confidence: 74, zone: '85-92', type: 'Option Setup' },
                { symbol: 'TCS', direction: 'SELL', confidence: 65, zone: '3920-3940', type: 'Mean Reversion' },
              ].map((signal, i) => (
                <Card key={i} className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all bg-card/50 backdrop-blur-sm cursor-pointer">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    signal.direction === 'BUY' ? "bg-bull" : "bg-bear"
                  )} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold">{signal.symbol}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{signal.type}</p>
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
                        <p className="text-xs font-bold mono-font">₹{signal.zone}</p>
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

          {/* Quick Actions / Featured Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-none bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Smart Screener</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Find high-conviction trades in seconds.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-bold text-sm group-hover:text-gold transition-colors">Intraday Cockpit</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time pulse of the market indices.</p>
                </div>
              </CardContent>
            </Card>
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
              <Badge variant="outline" className="text-[9px] border-white/40 text-white font-bold h-5">ACTIVE</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <MascotDigi expression="Coaching" size="md" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-xs leading-relaxed font-medium">
                  "Market sentiment is positive. Your current exposure is well within limits. Stick to your A-plus setups only today!"
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase text-muted-foreground">
                  <span>Daily Loss Utilization</span>
                  <span className="text-bull">₹0 / ₹5,000</span>
                </div>
                <Progress value={riskPercent} className="h-3 rounded-full bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Trades Remaining</p>
                  <p className="text-sm font-bold">15 / 15</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Emotion Score</p>
                  <p className="text-sm font-bold text-bull">Stable</p>
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
