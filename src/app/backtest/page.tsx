"use client";

import React, { useState, useMemo } from 'react';
import { 
  History, 
  Play, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  Info, 
  Calendar, 
  ArrowRight,
  RefreshCcw,
  Target,
  Activity,
  FileSearch,
  Scale,
  Sparkles,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { analyzeBacktestResults, type BacktestAnalysisOutput } from '@/ai/flows/backtest-analysis-flow';

const MOCK_EQUITY_DATA = [
  { day: 1, equity: 1000000 },
  { day: 5, equity: 1020000 },
  { day: 10, equity: 1015000 },
  { day: 15, equity: 1045000 },
  { day: 20, equity: 1038000 },
  { day: 25, equity: 1080000 },
  { day: 30, equity: 1124500 },
];

export default function BacktesterPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<{
    stats: any;
    aiCritique: BacktestAnalysisOutput | null;
  } | null>(null);

  const [params, setParams] = useState({
    strategy: 'breakout-v2',
    symbol: 'NIFTY',
    timeframe: '5m',
    capital: 1000000,
    riskPerTrade: 1.0
  });

  const handleRunBacktest = async () => {
    setIsSimulating(true);
    // Simulate backtest processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockStats = {
      strategyName: params.strategy === 'breakout-v2' ? 'AI Breakout V2' : 'Mean Reversion Pro',
      totalPnL: 124500,
      winRate: 68,
      maxDrawdown: 4.2,
      sharpeRatio: 2.1,
      tradesCount: 42,
      marketRegime: 'Moderately Bullish / Volatile'
    };

    try {
      const critique = await analyzeBacktestResults(mockStats);
      setResults({
        stats: mockStats,
        aiCritique: critique
      });
    } catch (error) {
      console.error("Backtest Analysis Error:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI Strategy Backtester</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              NSE / BSE Historical Simulation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            className="gap-2 h-10 font-bold shadow-purple" 
            onClick={handleRunBacktest}
            disabled={isSimulating}
          >
            {isSimulating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isSimulating ? "Simulating Execution..." : "RUN BACKTEST"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Strategy</label>
                <Select value={params.strategy} onValueChange={(v) => setParams({...params, strategy: v})}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakout-v2">AI Breakout V2 (Momentum)</SelectItem>
                    <SelectItem value="mean-rev">Mean Reversion Pro</SelectItem>
                    <SelectItem value="vol-surface">Volatility Surface Hive-Mind</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Symbol</label>
                  <Input value={params.symbol} onChange={(e) => setParams({...params, symbol: e.target.value.toUpperCase()})} className="h-10 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Timeframe</label>
                  <Select value={params.timeframe} onValueChange={(v) => setParams({...params, timeframe: v})}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 min</SelectItem>
                      <SelectItem value="5m">5 min</SelectItem>
                      <SelectItem value="15m">15 min</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Simulation Capital (INR)</label>
                <Input type="number" value={params.capital} onChange={(e) => setParams({...params, capital: parseInt(e.target.value)})} className="h-10 font-bold" />
              </div>

              <div className="p-4 bg-muted/20 rounded-xl border border-dashed text-[11px] text-muted-foreground leading-relaxed">
                <Info className="w-3.5 h-3.5 text-primary inline mr-1.5" />
                Simulation uses **Tick-by-Tick** historical data with slippage estimation based on typical NSE bid-ask spreads.
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-gold/5 to-transparent border-gold/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                Backtest Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">In-Sample Data</span>
                <span className="text-xs font-bold">2023-2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Out-of-Sample</span>
                <Badge variant="outline" className="text-[8px] border-bull/20 text-bull bg-bull/5">ACTIVE</Badge>
              </div>
              <div className="pt-2 border-t border-dashed border-gold/20">
                <p className="text-[10px] text-muted-foreground italic">
                  Digi will automatically flag if the strategy performs "too well" on known historical peaks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {!results && !isSimulating ? (
            <Card className="h-[550px] flex flex-col items-center justify-center text-center p-10 bg-muted/10 border-none">
              <MascotDigi expression="Thinking" size="lg" />
              <div className="max-w-md mt-6 space-y-4">
                <h2 className="text-2xl font-bold">Quant Strategy Simulator</h2>
                <p className="text-sm text-muted-foreground">
                  Configure your strategy and capital parameters to run a historical stress-test. Digi will provide a quantitative breakdown and an AI performance critique.
                </p>
                <div className="grid grid-cols-2 gap-4 text-left pt-4">
                  <div className="p-3 bg-white rounded-xl border flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase">Equity Curve Analysis</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border flex items-center gap-3">
                    <Scale className="w-4 h-4 text-gold" />
                    <span className="text-[10px] font-bold uppercase">Drawdown Profiling</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : isSimulating ? (
            <div className="h-[550px] flex flex-col items-center justify-center space-y-8">
              <MascotDigi expression="Coaching" size="lg" className="animate-bounce" />
              <div className="space-y-4 text-center w-full max-w-xs">
                <p className="text-lg font-bold">Digi is crunching the ticks...</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Processing Simulation</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} className="h-1.5" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Running Monte Carlo Edge-Cases</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Net Realized P&L</p>
                    <p className="text-lg font-extrabold text-bull mono-font">₹{results?.stats.totalPnL.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Win Rate</p>
                    <p className="text-lg font-extrabold text-primary mono-font">{results?.stats.winRate}%</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Max Drawdown</p>
                    <p className="text-lg font-extrabold text-bear mono-font">{results?.stats.maxDrawdown}%</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Sharpe Ratio</p>
                    <p className="text-lg font-extrabold text-gold mono-font">{results?.stats.sharpeRatio}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Equity Curve Visualization */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-bull" />
                      Simulated Equity Growth
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] border-muted font-bold uppercase tracking-tighter">
                      Initial: ₹10.00L • Final: ₹11.24L
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_EQUITY_DATA}>
                        <defs>
                          <linearGradient id="backtestEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                          label={{ value: 'Trading Session Day', position: 'insideBottom', offset: -5, fontSize: 9, fontWeight: 700 }}
                        />
                        <YAxis 
                          hide
                          domain={['dataMin - 50000', 'dataMax + 50000']}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Account Equity']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="equity" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#backtestEquity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Quant Critique */}
              <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
                <CardHeader className="bg-primary p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 fill-current" />
                      Digi's Quant Intelligence Critique
                    </CardTitle>
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase text-white border-white/20",
                      results?.aiCritique?.riskOfOverfitting === 'Extreme' ? 'bg-bear' : 
                      results?.aiCritique?.riskOfOverfitting === 'High' ? 'bg-danger' : 'bg-bull'
                    )}>
                      Overfitting Risk: {results?.aiCritique?.riskOfOverfitting}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-6">
                    <MascotDigi expression="Coaching" size="md" className="shrink-0" />
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed font-medium">
                        {results?.aiCritique?.critique}
                      </div>
                      <div className="p-3 bg-white/50 rounded-xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase mb-2">Market Suitability</p>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                          "{results?.aiCritique?.marketSuitability}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Suggested Optimizations</p>
                      <div className="space-y-2">
                        {results?.aiCritique?.suggestedOptimizations.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-primary">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button className="w-full h-11 font-bold shadow-purple gap-2">
                        <ArrowRight className="w-4 h-4" />
                        AUTO-OPTIMIZE STRATEGY
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
