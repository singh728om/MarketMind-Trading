"use client";

import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Calendar,
  Info,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Target,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const MOCK_HISTORICAL_DATA = [
  { date: '12 Mar', fii: 1240, dii: -380 },
  { date: '13 Mar', fii: 850, dii: 420 },
  { date: '14 Mar', fii: -2100, dii: 1100 },
  { date: '15 Mar', fii: 1560, dii: -200 },
  { date: '18 Mar', fii: 2450, dii: 150 },
  { date: '19 Mar', fii: -450, dii: 890 },
  { date: '20 Mar', fii: 3120, dii: -120 },
];

export default function FiiDiiTracker() {
  const { firestore } = useFirebase();
  
  const fiiDiiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'fii_dii_data'), orderBy('date', 'desc'), limit(10));
  }, [firestore]);

  const { data: historicalDocs, isLoading } = useCollection(fiiDiiQuery);
  const latestData = historicalDocs?.[0] || {
    fiiCashNet: 3120.40,
    diiNet: -120.20,
    fiiFuturesLong: 72,
    fiiFuturesShort: 28,
    consecutiveBuyingDays: 3,
    date: '2024-03-20'
  };

  const convictionScore = latestData.fiiCashNet > 2000 ? "HIGH" : latestData.fiiCashNet > 0 ? "MODERATE" : "WEAK";

  return (
    <div className="space-y-6">
      {/* FII/DII Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">FII / DII Tracker</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Institutional Flow Intelligence • NSE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3 border-primary/20 bg-primary/5 text-primary font-bold">
            <Calendar className="w-3.5 h-3.5 mr-2" />
            Last Updated: {latestData.date}
          </Badge>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Cash Flow Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-bull/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">FII Cash Net</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={cn("text-3xl font-extrabold mono-font", latestData.fiiCashNet >= 0 ? "text-bull" : "text-bear")}>
                        ₹{Math.abs(latestData.fiiCashNet).toLocaleString('en-IN')} Cr
                      </span>
                      <span className="text-xs font-bold text-bull">{latestData.fiiCashNet >= 0 ? 'BUY' : 'SELL'}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-bull/10 rounded-lg text-bull">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-bull/10 text-bull border-none text-[9px] font-bold">
                    STREAK: {latestData.consecutiveBuyingDays} DAYS
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-medium">Aggressive accumulation detected</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-bear/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">DII Cash Net</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={cn("text-3xl font-extrabold mono-font", latestData.diiNet >= 0 ? "text-bull" : "text-bear")}>
                        ₹{Math.abs(latestData.diiNet).toLocaleString('en-IN')} Cr
                      </span>
                      <span className="text-xs font-bold text-bear">{latestData.diiNet >= 0 ? 'BUY' : 'SELL'}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-bear/10 rounded-lg text-bear">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-bear/10 text-bear border-none text-[9px] font-bold">
                    PROFIT BOOKING
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-medium">Domestic support cooling off</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Flow Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Institutional Cash Momentum
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">FII</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">DII</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_HISTORICAL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                    />
                    <Bar dataKey="fii" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" barSize={20} />
                    <Bar dataKey="dii" radius={[4, 4, 0, 0]} fill="hsl(var(--gold))" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Derivatives positioning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-primary" />
                  FII Index Futures Positioning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Long Exposure</span>
                    <span className="text-lg font-extrabold text-bull mono-font">{latestData.fiiFuturesLong}%</span>
                  </div>
                  <Progress value={latestData.fiiFuturesLong} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-muted/20 rounded-xl">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Long Contracts</p>
                    <p className="text-sm font-bold mono-font mt-1">1,42,500</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Short Contracts</p>
                    <p className="text-sm font-bold mono-font mt-1">54,200</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Target className="w-4 h-4 text-gold" />
                  FII Net Options Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[140px] space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-bull mono-font">BULLISH</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Net Put Writing Detected</p>
                </div>
                <Badge variant="outline" className="bg-bull/5 text-bull border-bull/20 font-bold uppercase text-[8px]">
                  Strong Support at 22,400
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Intel Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digi's Flow Analysis */}
          <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <MascotDigi expression="Coaching" size="sm" className="bg-white/20 border-none h-6 w-6" />
                Digi's Flow Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <MascotDigi expression="Thinking" size="sm" className="shrink-0" />
                <div className="bg-background/80 p-3 rounded-2xl rounded-tl-none border border-primary/10 text-[11px] leading-relaxed font-medium italic">
                  "FIIs have been net buyers for 3 consecutive days with Index Longs rising to 72%. Historically, when FII longs cross 70%, Nifty has a 78% probability of a 2% rally in the next 5 days. Avoid aggressive shorts."
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-bull/10 text-bull mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-bull uppercase">High Conviction</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">FIIs are building positions in Banking and Auto sectors. Watch for breakouts in HDFCBANK.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold mt-0.5">
                    <LineChart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gold uppercase">DII Support</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">DIIs are absorbing the minor profit booking at peaks, keeping the 22,300 base solid.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">FII Conviction</p>
                  <p className="text-sm font-extrabold mt-0.5">{convictionScore}</p>
                </div>
                <div className="h-10 w-10 rounded-full border-4 border-bull/20 flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-bull">8/10</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Retail Sentiment</p>
                  <p className="text-sm font-extrabold mt-0.5">EXTREME FEAR</p>
                </div>
                <div className="h-10 w-10 rounded-full border-4 border-bear/20 flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-bear">2/10</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Sentiment Barometer */}
          <Card className="shadow-sm border-gold/10 overflow-hidden bg-gradient-to-br from-gold/[0.03] to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Institutional Barometer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-center h-24 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Activity className="w-20 h-20 text-gold" />
                </div>
                <div className="text-center z-10">
                  <p className="text-2xl font-extrabold text-gold mono-font tracking-tighter uppercase">ACCUMULATION</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 italic">Institutions are buying the dips</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-gold/10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Large Cap Inflows</span>
                  <ArrowUpRight className="w-3 h-3 text-bull" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Mid Cap Outflows</span>
                  <ArrowDownRight className="w-3 h-3 text-bear" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
