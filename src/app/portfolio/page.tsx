"use client";

import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Target, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Zap, 
  BrainCircuit, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  RefreshCcw,
  BarChart3,
  Flame,
  Search,
  Download,
  Filter,
  Eye,
  Crosshair,
  Wind,
  Sparkles,
  ChevronRight
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
  useCollection, 
  useMemoFirebase,
  useDoc
} from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const HOLDINGS_DATA = [
  { symbol: 'RELIANCE', sector: 'Energy', weight: 25, gain: 12.4, value: 245000 },
  { symbol: 'HDFCBANK', sector: 'Banking', weight: 20, gain: -2.1, value: 198000 },
  { symbol: 'TCS', sector: 'IT', weight: 15, gain: 8.5, value: 145000 },
  { symbol: 'INFY', sector: 'IT', weight: 12, gain: 4.2, value: 118000 },
  { symbol: 'ICICIBANK', sector: 'Banking', weight: 10, gain: 15.6, value: 98000 },
  { symbol: 'ADANIENT', sector: 'Conglomerate', weight: 10, gain: 32.1, value: 95000 },
  { symbol: 'TATAMOTORS', sector: 'Auto', weight: 8, gain: 22.4, value: 78000 },
];

const SECTOR_DATA = [
  { name: 'Banking', value: 30, color: 'hsl(var(--primary))' },
  { name: 'IT', value: 27, color: 'hsl(var(--bull))' },
  { name: 'Energy', value: 25, color: 'hsl(var(--gold))' },
  { name: 'Auto', value: 8, color: 'hsl(var(--bear))' },
  { name: 'Others', value: 10, color: 'hsl(var(--muted-foreground))' },
];

export default function PortfolioXRay() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [isSimulating, setIsSimulating] = useState(false);
  const [activeView, setActiveTab] = useState("holdings");

  // AI Diagnostic Simulation
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const handleRunDiagnosis = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setDiagnosis("Your portfolio is 'Top-Heavy' with 57% exposure to Banking and IT. While these are high-conviction FII sectors, a rotation out of BFSI could trigger a 4.2% drawdown. Recommendation: Increase exposure to Pharma or FMCG for defensive hedging. Your correlation with NIFTY is 0.88, which is slightly higher than optimal for a diversified alpha-seeker.");
      setIsSimulating(false);
    }, 2000);
  };

  const totalValue = HOLDINGS_DATA.reduce((acc, curr) => acc + curr.value, 0);
  const totalGain = HOLDINGS_DATA.reduce((acc, curr) => acc + (curr.value * (curr.gain / 100)), 0);
  const gainPct = (totalGain / totalValue) * 100;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Portfolio X-Ray</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Institutional-Grade Risk Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-10 font-bold" onClick={() => {}}>
            <Download className="w-4 h-4" />
            EXPORT AUDIT
          </Button>
          <Button className="gap-2 h-10 font-bold shadow-purple" onClick={handleRunDiagnosis} disabled={isSimulating}>
            {isSimulating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
            {isSimulating ? "Analyzing..." : "RUN AI DIAGNOSIS"}
          </Button>
        </div>
      </div>

      {/* Top Value Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Net Worth</p>
              <p className="text-lg font-extrabold mono-font">₹{(totalValue / 100000).toFixed(2)}L</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", totalGain >= 0 ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}>
              {totalGain >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Unrealized P&L</p>
              <p className={cn("text-lg font-extrabold mono-font", totalGain >= 0 ? "text-bull" : "text-bear")}>
                {totalGain >= 0 ? '+' : ''}₹{(totalGain / 1000).toFixed(1)}K ({gainPct.toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Portfolio XIRR</p>
              <p className="text-lg font-extrabold mono-font text-gold">24.8%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Portfolio Beta</p>
              <p className="text-lg font-extrabold mono-font">0.88</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Diagnosis & Stress Test */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Digi's Intelligence Panel */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">AI Portfolio Diagnosis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!diagnosis && !isSimulating ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  <MascotDigi expression="Thinking" size="md" />
                  <div className="max-w-xs">
                    <p className="text-sm text-muted-foreground">Ready to scan your holdings for sector rotation risks and institutional alignment.</p>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold gap-2" onClick={handleRunDiagnosis}>
                    <Zap className="w-3 h-3 fill-current" /> START SCAN
                  </Button>
                </div>
              ) : isSimulating ? (
                <div className="flex items-start gap-6 animate-pulse">
                  <MascotDigi expression="Coaching" size="sm" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-primary/10 rounded w-3/4" />
                    <div className="h-4 bg-primary/10 rounded w-1/2" />
                    <div className="h-4 bg-primary/10 rounded w-5/6" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <MascotDigi expression="Celebrating" size="md" className="shrink-0" />
                  <div className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-2xl rounded-tl-none border border-primary/10 shadow-sm text-sm leading-relaxed text-muted-foreground font-medium italic">
                      "{diagnosis}"
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-bull/10 text-bull border-none text-[9px] font-bold">LOW VOLATILITY BIAS</Badge>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold">BFSI OVERWEIGHT</Badge>
                      <Badge className="bg-gold/10 text-gold border-none text-[9px] font-bold">INSTITUTIONAL CORE</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unique Feature: Portfolio Stress-Test Simulator */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-bear" />
                  <CardTitle className="text-lg font-bold">Market Stress-Test Simulator</CardTitle>
                </div>
                <Badge variant="outline" className="bg-bear/5 text-bear border-bear/20 text-[9px] font-bold">PREDICTIVE</Badge>
              </div>
              <CardDescription>Simulate how your current holdings respond to external shocks</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "NIFTY -5% CRASH", impact: "-₹42,450", risk: "CRITICAL", color: "text-bear" },
                  { label: "VIX SPIKE (+20%)", impact: "-₹12,200", risk: "MODERATE", color: "text-gold" },
                  { label: "INT. RATE HIKE", impact: "-₹28,500", risk: "HIGH", color: "text-bear" }
                ].map((scenario, i) => (
                  <div key={i} className="p-4 bg-muted/20 rounded-xl border border-transparent hover:border-border transition-all cursor-pointer group">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{scenario.label}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn("text-lg font-extrabold mono-font", scenario.color)}>{scenario.impact}</span>
                      <Badge className={cn("text-[8px] font-bold border-none", scenario.risk === 'CRITICAL' ? "bg-bear text-white" : "bg-gold text-white")}>
                        {scenario.risk}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-primary/5 border border-dashed border-primary/20 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-background rounded-lg text-primary shadow-sm">
                  <Info className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Calculated using individual stock **Beta** values and sector correlations. Your banking exposure makes you highly sensitive to interest rate fluctuations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Ledger */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Holding Ledger</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Showing 7 positions</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-left">
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Sector</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4">P&L (%)</th>
                      <th className="px-6 py-4 text-right">Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {HOLDINGS_DATA.map((holding) => (
                      <tr key={holding.symbol} className="border-b hover:bg-muted/5 transition-colors group">
                        <td className="px-6 py-4 font-bold">{holding.symbol}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[9px] font-bold border-primary/10 text-muted-foreground">{holding.sector}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${holding.weight}%` }} />
                            </div>
                            <span className="font-bold">{holding.weight}%</span>
                          </div>
                        </td>
                        <td className={cn("px-6 py-4 font-bold mono-font", holding.gain >= 0 ? "text-bull" : "text-bear")}>
                          {holding.gain >= 0 ? '+' : ''}{holding.gain}%
                        </td>
                        <td className="px-6 py-4 text-right font-bold mono-font">
                          ₹{holding.value.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Intel Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Concentration Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={SECTOR_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SECTOR_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {SECTOR_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-extrabold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Metrics Card */}
          <Card className="shadow-sm border-gold/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                Advanced Risk Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Drawdown Risk</span>
                  <span className="text-bull">LOW</span>
                </div>
                <Progress value={22} className="h-1.5" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Sector Concentration</span>
                  <span className="text-bear">HIGH</span>
                </div>
                <Progress value={85} className="h-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-muted/20 rounded-xl text-center">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Sharpe Ratio</p>
                  <p className="text-sm font-extrabold text-primary">1.84</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl text-center">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Volatility</p>
                  <p className="text-sm font-extrabold text-bull">12.4%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Heat */}
          <Card className="border-none shadow-sm bg-bull/5 border-l-4 border-l-bull">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-bull uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-3.5 h-3.5" />
                Institutional Alignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-bull tracking-tighter">82%</span>
                <Badge className="bg-bull text-white text-[8px] font-bold">VERY HIGH</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                "82% of your portfolio value is currently being accumulated by FIIs over the last 30 days. This indicates high liquidity and support."
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="w-full h-12 justify-between px-4 group">
              <div className="flex items-center gap-3">
                <Crosshair className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase">Optimal Rebalance</p>
                  <p className="text-[8px] text-muted-foreground">Adjust weights for next market cycle</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-30" />
            </Button>
            <Button variant="outline" className="w-full h-12 justify-between px-4 group">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase">Tax-Loss Harvesting</p>
                  <p className="text-[8px] text-muted-foreground">Identify holdings for tax optimization</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-30" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
