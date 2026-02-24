"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Scale,
  Target,
  Info,
  RefreshCcw,
  Sparkles,
  Thermometer,
  Compass,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const SECTOR_PERFORMANCE = [
  { name: 'BANKING', gain: 1.45, trend: 'up' },
  { name: 'IT', gain: 0.82, trend: 'up' },
  { name: 'ENERGY', gain: -0.42, trend: 'down' },
  { name: 'AUTO', gain: 2.10, trend: 'up' },
  { name: 'FMCG', gain: -0.15, trend: 'down' },
  { name: 'PHARMA', gain: 0.55, trend: 'up' },
  { name: 'METALS', gain: 1.20, trend: 'up' },
  { name: 'REALTY', gain: -1.80, trend: 'down' },
];

const BREADTH_DATA = [
  { label: 'Advances', value: 1420, color: 'hsl(var(--bull))' },
  { label: 'Declines', value: 680, color: 'hsl(var(--bear))' },
  { label: 'Unchanged', value: 120, color: 'hsl(var(--muted-foreground))' },
];

const VIX_INTRADAY = [
  { time: '09:15', vix: 13.2 },
  { time: '10:00', vix: 13.5 },
  { time: '11:00', vix: 13.8 },
  { time: '12:00', vix: 13.4 },
  { time: '13:00', vix: 13.1 },
  { time: '14:00', vix: 12.9 },
  { time: '15:00', vix: 13.4 },
];

export default function MarketPulsePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sentiment, setSentiment] = useState(68); // 0-100 (Fear to Greed)

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getSentimentLabel = (val: number) => {
    if (val > 80) return { text: "EXTREME GREED", color: "text-bear", bg: "bg-bear/10" };
    if (val > 60) return { text: "GREED", color: "text-bull", bg: "bg-bull/10" };
    if (val > 40) return { text: "NEUTRAL", color: "text-gold", bg: "bg-gold/10" };
    if (val > 20) return { text: "FEAR", color: "text-bear", bg: "bg-bear/10" };
    return { text: "EXTREME FEAR", color: "text-bull", bg: "bg-bull/10" };
  };

  const sentimentLabel = getSentimentLabel(sentiment);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Market Pulse</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-bull animate-pulse" />
              Real-time Market Health & Breadth Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-bold" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            REFRESH PULSE
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sentiment & Breadth */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sentiment Gauge */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                Fear & Greed Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
              <div className="relative h-32 flex items-center justify-center">
                <div className="text-center z-10">
                  <p className={cn("text-3xl font-black tracking-tighter", sentimentLabel.color)}>
                    {sentiment}
                  </p>
                  <Badge variant="outline" className={cn("mt-1 text-[9px] font-bold border-none", sentimentLabel.bg, sentimentLabel.color)}>
                    {sentimentLabel.text}
                  </Badge>
                </div>
                {/* Visual semi-circle track can be added here with CSS */}
                <div className="absolute bottom-0 w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", sentiment > 50 ? "bg-bull" : "bg-bear")} 
                    style={{ width: `${sentiment}%` }} 
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Aggregated from Volatility, Momentum, and FII flows. Current reading suggests high bullish conviction with room for more upside.
              </p>
            </CardContent>
          </Card>

          {/* Market Breadth Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Scale className="w-4 h-4 text-gold" />
                Advance / Decline Ratio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex h-10 w-full rounded-xl overflow-hidden border border-border">
                <div className="h-full bg-bull flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '65%' }}>
                  1,420
                </div>
                <div className="h-full bg-bear flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '30%' }}>
                  680
                </div>
                <div className="h-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground" style={{ width: '5%' }}>
                  120
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/20 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Ratio</p>
                  <p className="text-lg font-extrabold text-bull">2.08</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Bias</p>
                  <p className="text-lg font-extrabold text-bull uppercase">STRONG</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volatility Status */}
          <Card className="border-none shadow-sm bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-bear" />
                Intraday Volatility (VIX)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={VIX_INTRADAY}>
                    <defs>
                      <linearGradient id="vixPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--bear))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--bear))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="vix" 
                      stroke="hsl(var(--bear))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#vixPulse)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">India VIX @ 13.42</span>
                <Badge className="bg-bull/10 text-bull border-none text-[8px] font-bold">STABLE</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Sector Heatmap */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Sector Performance Grid */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Sector Rotation Heatmap
                </CardTitle>
                <CardDescription>Intraday percentage change by NSE Sectoral Indices</CardDescription>
              </div>
              <Badge variant="outline" className="h-6 border-primary/20 text-primary uppercase font-bold text-[9px]">
                LIVE UPDATES
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SECTOR_PERFORMANCE.map((sector) => (
                  <div 
                    key={sector.name} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer group",
                      sector.trend === 'up' ? "bg-bull/[0.02] border-bull/10 hover:border-bull/30" : "bg-bear/[0.02] border-bear/10 hover:border-bear/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sector.name}</p>
                      {sector.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-bull" /> : <ArrowDownRight className="w-3 h-3 text-bear" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-xl font-black mono-font", sector.trend === 'up' ? "text-bull" : "text-bear")}>
                        {sector.gain > 0 ? '+' : ''}{sector.gain}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full mt-3 overflow-hidden">
                      <div 
                        className={cn("h-full", sector.trend === 'up' ? "bg-bull" : "bg-bear")} 
                        style={{ width: `${Math.min(Math.abs(sector.gain) * 30, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Friction Analysis */}
          <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 fill-current" />
                Digi's Pulse Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-6">
                <MascotDigi expression="Coaching" size="md" className="shrink-0" />
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed font-medium">
                    "The market pulse is currently in a <strong>Greed phase</strong>, but breadth remains healthy with a 2:1 Advance/Decline ratio. We are seeing a significant rotation into <strong>Auto and Banking</strong> sectors, while Realty is cooling off. Total volume is 1.2x of 10-day average, suggesting active institutional participation. It is an optimal environment for trend-following strategies."
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 rounded-xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase mb-1">Key Resistance</p>
                      <p className="text-xs font-extrabold mono-font">NIFTY 22,600 (Call Wall)</p>
                    </div>
                    <div className="p-3 bg-white/50 rounded-xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase mb-1">Support Floor</p>
                      <p className="text-xs font-extrabold mono-font text-bull">NIFTY 22,350 (Aggressive PE Writing)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Gainers/Losers Mini Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-bull flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top Momentum Gainers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {[
                  { sym: 'TATA MOTORS', price: '984.20', chg: '+4.2%' },
                  { sym: 'M&M', price: '1,842.00', chg: '+3.8%' },
                  { sym: 'HDFCBANK', price: '1,452.10', ch: '+2.4%' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/5">
                    <span className="text-xs font-bold">{s.sym}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold">₹{s.price}</p>
                      <p className="text-[10px] font-bold text-bull">{s.chg}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-bear flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Top Laggards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {[
                  { sym: 'DLF', price: '842.00', chg: '-3.1%' },
                  { sym: 'GRASIM', price: '2,120.00', chg: '-2.4%' },
                  { sym: 'ONGC', price: '264.50', chg: '-1.8%' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/5">
                    <span className="text-xs font-bold">{s.sym}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold">₹{s.price}</p>
                      <p className="text-[10px] font-bold text-bear">{s.chg}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
