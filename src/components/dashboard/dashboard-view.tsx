"use client";

import React from 'react';
import { 
  ShieldAlert, Zap, Activity, Radio, TrendingUp, 
  ArrowUpRight, Sparkles, BrainCircuit, LineChart,
  Search, Info, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export function Dashboard() {
  // AI Status Data
  const totalPnL = 2450.50;
  const riskPercent = 32;
  const marketBias = "BULLISH";
  const fiiConviction = "HIGHLY BULLISH";
  const aiRecommendation = "BUY ON DIPS";

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
              Welcome back, Ajay! 🌊
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-bull" />
              Risk Guardian is monitoring your behavioral signals.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end bg-card border rounded-2xl p-4 shadow-sm min-w-[180px]">
            <div className={cn("mono-font text-2xl font-extrabold", totalPnL >= 0 ? "price-up" : "price-down")}>
              +{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Session P&L</p>
          </div>
        </div>
      </div>

      {/* AI Market Intel Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-bull/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bull/10 text-bull">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">FII/DII Conviction</p>
              <p className="text-sm font-bold text-bull">{fiiConviction}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">AI Recommendation</p>
              <p className="text-sm font-bold text-primary">{aiRecommendation}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gold/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Bias</p>
              <p className="text-sm font-bold text-gold">{marketBias}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Intelligence Hub */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Signal Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary animate-pulse" />
                Live AI Signals
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Explore All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { symbol: 'RELIANCE', direction: 'BUY', confidence: 92, zone: '2840-2855', type: 'Breakout' },
                { symbol: 'NIFTY 22400 CE', direction: 'BUY', confidence: 84, zone: '85-92', type: 'Option Setup' },
                { symbol: 'HDFC BANK', direction: 'WATCH', confidence: 60, zone: '1420-1435', type: 'Consolidation' },
              ].map((signal, i) => (
                <Card key={i} className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all bg-card/50 backdrop-blur-sm cursor-pointer">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    signal.direction === 'BUY' ? "bg-bull" : signal.direction === 'SELL' ? "bg-bear" : "bg-gold"
                  )} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold">{signal.symbol}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{signal.type}</p>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-bold border-none",
                        signal.direction === 'BUY' ? "bg-bull/10 text-bull" : signal.direction === 'SELL' ? "bg-bear/10 text-bear" : "bg-gold/10 text-gold"
                      )}>
                        {signal.direction}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Target Zone</p>
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

          {/* Featured AI Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-none bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Smart Screener</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Find 5-star setups across 200+ stocks.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none bg-gold/5 hover:bg-gold/10 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-gold">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm group-hover:text-gold transition-colors">Intraday Cockpit</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time pulse of the market indices.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Risk & AI Intel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Morning Briefing */}
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
                  <span className="text-muted-foreground uppercase">Institutional Data</span>
                  <span className="text-bull">NET BUYERS (₹1.2k Cr)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold p-2 bg-background/50 rounded-lg border border-primary/5">
                  <span className="text-muted-foreground uppercase">Sector Focus</span>
                  <span className="text-primary font-bold">PRIVATE BANKS</span>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl text-[11px] leading-relaxed text-muted-foreground font-medium italic border border-primary/5">
                "FII conviction is high in large-caps today. SGX Nifty points to a positive start. Support at 22,350 is strong. Avoid aggressive shorts unless 22,280 breaks."
              </div>
              <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary flex items-center gap-1 group">
                Read Detailed Narrative
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* AI Risk Guardian */}
          <Card className="shadow-sm border-primary/10 overflow-hidden">
            <div className="bg-primary px-4 py-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Risk Guardian Status
              </div>
              <Badge variant="outline" className="text-[9px] border-white/40 text-white font-bold h-5">ACTIVE</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <MascotDigi expression="Coaching" size="sm" className="shrink-0" />
                <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-primary/5 text-[11px] leading-relaxed font-medium">
                  "You're in the green today! Stick to your rules. No revenge trading if the market reverses."
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Daily Loss Utilization</span>
                  <span className="text-bull">₹0 / ₹5,000</span>
                </div>
                <Progress value={riskPercent} className="h-2 rounded-full bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Health Score</p>
                  <p className="text-sm font-bold text-bull">94%</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-muted-foreground/10 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Emotion</p>
                  <p className="text-sm font-bold">Stable</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Pulse Stats */}
          <Card className="shadow-sm border-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  <LineChart className="w-3 h-3" /> RSI (14)
                </span>
                <span className="mono-font text-primary">62.5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
