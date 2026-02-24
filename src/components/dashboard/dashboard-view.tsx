"use client";

import React from 'react';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  ShieldAlert, Clock, Info, ChevronRight, 
  Target, Zap, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";

export function Dashboard() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">Good morning, Ajay! 🌅</h1>
          <p className="text-muted-foreground mt-1">Your AI guardian is monitoring your session.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="mono-font text-3xl font-extrabold price-up">
            +4,230.00
          </div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Today's Net P&L (2.34%)</p>
        </div>
      </div>

      {/* AI Morning Brief Card */}
      <Card className="overflow-hidden border-none shadow-purple bg-gradient-to-br from-primary to-primary-dark text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MascotDigi expression="Focused" size="xl" className="border-none bg-transparent" />
        </div>
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <MascotDigi expression="Thinking" size="sm" className="bg-white/20 border-white/40" />
            <Badge className="bg-white/20 text-white border-white/40 backdrop-blur-sm">8:45 AM | Powered by Gemini 1.5 Pro</Badge>
          </div>
          <CardTitle className="text-xl font-headline font-bold">🧠 AI Morning Brief</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Market Direction</p>
              <p className="text-sm font-medium">NIFTY likely to open <span className="mono-font font-bold">+45 pts</span> (SGX +0.3%) based on global cues.</p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Institutional Flow</p>
              <p className="text-sm font-medium">FIIs net bought <span className="mono-font font-bold">₹1,240 Cr</span> yesterday. Institutional conviction is high.</p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">AI Stock Picks</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/10 cursor-pointer">RELIANCE (Breakout)</Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/10 cursor-pointer">TATAMOTORS (Bullish)</Badge>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
              View Full Analysis <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Middle Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Risk Guardian Bar */}
          <Card className="shadow-purple border-primary/10 overflow-hidden">
            <div className="bg-bull/5 border-b px-4 py-2 flex items-center justify-between">
               <div className="flex items-center gap-2 text-[10px] font-bold text-bull uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3" />
                  AI Risk Guardian Status: Active
               </div>
               <div className="text-[10px] font-bold text-muted-foreground uppercase">
                  Level: Normal Protected
               </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Daily Loss Limit</p>
                    <p className="text-xs text-muted-foreground">Today: <span className="price-down">-2,840</span> of <span className="mono-font">-5,000</span> limit</p>
                  </div>
                  <Badge variant="outline" className="text-neutral border-neutral/20 bg-neutral/5">🟡 Caution: ₹2,160 remaining</Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={56.8} className="h-2.5 bg-muted" />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>0%</span>
                    <span>56.8% USED</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10 text-center">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Trades</p>
                    <p className="text-lg font-bold">6/10</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10 text-center">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Conc. Losses</p>
                    <p className="text-lg font-bold text-bear">2</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10 text-center">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Revenge Risk</p>
                    <p className="text-lg font-bold text-neutral">LOW</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10 text-center">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">AI Status</p>
                    <p className="text-lg font-bold text-bull">SAFE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Signals Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold">Live AI Signals</h3>
              <button className="text-xs font-bold text-primary hover:underline">Signal Command Center →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { symbol: 'NIFTY 50', type: 'Bull Call Spread', entry: '22450', confidence: 88, target: '22600', sl: '22380' },
                { symbol: 'RELIANCE', type: 'Breakout', entry: '2985', confidence: 76, target: '3040', sl: '2960' }
              ].map((signal, i) => (
                <Card key={i} className="hover:border-primary/30 transition-all cursor-pointer group">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-bull text-white border-none uppercase text-[10px]">BUY</Badge>
                        <span className="font-bold text-sm">{signal.symbol}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-gold" />
                        <span className="text-[10px] font-bold text-gold">{signal.confidence}% Confidence</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Entry</p>
                        <p className="mono-font text-xs font-bold">{signal.entry}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Target</p>
                        <p className="mono-font text-xs font-bold text-bull">{signal.target}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Stoploss</p>
                        <p className="mono-font text-xs font-bold text-bear">{signal.sl}</p>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-muted-foreground/10 mt-2">
                      <span className="text-[10px] text-muted-foreground font-medium">{signal.type} Setup</span>
                      <button className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded hover:bg-primary text-white transition-colors">Trade Signal</button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* FII/DII Today */}
          <Card className="shadow-purple border-none bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider text-muted-foreground">FII/DII Conviction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bull/5 rounded-xl border border-bull/10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">FII Net Cash</p>
                  <p className="mono-font text-sm font-bold text-bull">₹ +1,240.45 Cr</p>
                </div>
                <TrendingUp className="w-6 h-6 text-bull/40" />
              </div>
              <div className="flex items-center justify-between p-3 bg-bear/5 rounded-xl border border-bear/10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">DII Net Cash</p>
                  <p className="mono-font text-sm font-bold text-bear">₹ -380.20 Cr</p>
                </div>
                <ArrowDownRight className="w-6 h-6 text-bear/40" />
              </div>
              <p className="text-[11px] leading-tight text-muted-foreground bg-muted/30 p-3 rounded-lg border border-primary/5">
                <MascotDigi expression="Coaching" size="sm" className="inline-block mr-2 scale-75 -ml-2" />
                FIIs long-short ratio at <span className="font-bold text-primary">1.24</span>. Bullish momentum expected in Bank Nifty today.
              </p>
            </CardContent>
          </Card>

          {/* Quick F&O Recommender */}
          <Card className="shadow-purple border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider">AI F&O Suggestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold">NIFTY 50 Expiry</span>
                <Badge variant="outline" className="text-[10px] font-bold">18 JAN 2025</Badge>
              </div>
              <div className="p-3 border rounded-xl border-bull/20 bg-bull/5 space-y-2">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-bold uppercase text-bull">Bull Call Spread</p>
                   <span className="mono-font text-[10px] font-bold">68% Conf.</span>
                </div>
                <div className="space-y-1">
                   <p className="text-xs font-medium">Buy 22,450 CE @ ₹85</p>
                   <p className="text-xs font-medium">Sell 22,600 CE @ ₹42</p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                   <span className="font-bold">Net Prem: ₹43</span>
                   <span className="text-bull font-bold">R:R 1:2.4</span>
                </div>
              </div>
              <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-purple hover:bg-primary-dark transition-colors">
                Quick Deploy Strategy
              </button>
            </CardContent>
          </Card>

          {/* Market Sentiment */}
          <Card className="shadow-purple border-none bg-surface overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-wider">Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-20 w-full flex items-center justify-center">
                {/* Simplified Gauage mockup */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-16 rounded-t-full border-[10px] border-bull/20 border-b-0 relative">
                     <div className="absolute top-0 right-0 w-16 h-16 rounded-t-full border-[10px] border-bull border-b-0 -rotate-[15deg] origin-bottom-center" />
                  </div>
                  <div className="absolute bottom-2 font-bold text-bull text-xs">72% GREED</div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase">PCR</span>
                  <span className="mono-font text-bull">1.28</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase">INDIA VIX</span>
                  <span className="mono-font text-bear">13.42</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase">MAX PAIN</span>
                  <span className="mono-font">22,400</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
