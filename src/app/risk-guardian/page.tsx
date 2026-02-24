"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Target, 
  Lock, 
  Wind, 
  Thermometer,
  AlertTriangle,
  BrainCircuit,
  Scaling,
  TrendingDown,
  Timer,
  Crosshair,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const DRAWDOWN_DATA = [
  { time: '09:15', equity: 1000000 },
  { time: '10:00', equity: 1005000 },
  { time: '11:00', equity: 998000 },
  { time: '12:00', equity: 992000 },
  { time: '13:00', equity: 995000 },
  { time: '14:00', equity: 1008000 },
  { time: '15:00', equity: 1002450 },
];

export default function RiskGuardianPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [dailyLossLimit, setDailyLossLimit] = useState(5000);
  const [currentLoss, setCurrentLoss] = useState(1240);
  const [riskPerTrade, setRiskPerTrade] = useState(0.5);
  const [vixValue, setVixValue] = useState(13.4);
  const [stopLossPoints, setStopLossPoints] = useState(40);
  
  // Dynamic Calculation
  const capital = 1000000;
  const riskAmount = (capital * (riskPerTrade / 100));
  const suggestedQty = Math.floor(riskAmount / stopLossPoints);
  
  const lossProgress = (currentLoss / dailyLossLimit) * 100;
  const isHighRisk = lossProgress > 80;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            isLocked ? "bg-bear/10 text-bear" : "bg-primary/10 text-primary"
          )}>
            {isLocked ? <Lock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI Risk Guardian</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className={cn(
                "flex h-2 w-2 rounded-full animate-pulse",
                isLocked ? "bg-bear" : "bg-bull"
              )} />
              {isLocked ? "Trading Suspended • Account Locked" : "Guard Active • Real-time Monitoring"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-4 border-primary/20 bg-primary/5 text-primary font-bold">
            SAFE-LOCK: {isLocked ? "ENGAGED" : "ARMED"}
          </Badge>
          <Button 
            variant={isLocked ? "default" : "outline"} 
            className={cn(isLocked ? "bg-bear hover:bg-bear/90" : "border-bear text-bear hover:bg-bear/5")}
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? "REQUEST UNLOCK" : "MANUAL EMERGENCY LOCK"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Engine & Validation */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Position Sizing Engine */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scaling className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-bold">Dynamic Position Sizing Engine</CardTitle>
                </div>
                <Badge className="bg-primary text-white text-[10px]">AUTO-SYNCED</Badge>
              </div>
              <CardDescription>Volatility-adjusted lot calculation based on account equity</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">Risk Per Trade (%)</Label>
                      <span className="text-xs font-bold text-primary">{riskPerTrade}%</span>
                    </div>
                    <Slider 
                      value={[riskPerTrade]} 
                      max={2} 
                      step={0.1} 
                      onValueChange={(val) => setRiskPerTrade(val[0])} 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">Stop Loss Points (Points)</Label>
                      <span className="text-xs font-bold text-primary">{stopLossPoints} pts</span>
                    </div>
                    <Slider 
                      value={[stopLossPoints]} 
                      min={10}
                      max={200} 
                      step={5} 
                      onValueChange={(val) => setStopLossPoints(val[0])} 
                    />
                  </div>

                  <div className="p-4 bg-muted/20 rounded-xl border border-dashed flex items-center gap-4">
                    <div className="p-2 bg-background rounded-lg shadow-sm">
                      <Thermometer className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Market Regime</p>
                      <p className="text-xs font-bold uppercase">Trending • VIX: {vixValue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-primary/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Recommended Max Size</p>
                  <div className="space-y-1">
                    <span className="text-5xl font-extrabold mono-font text-primary">{suggestedQty}</span>
                    <p className="text-xs font-bold text-muted-foreground">UNITS / LOTS</p>
                  </div>
                  <div className="w-full pt-4 border-t border-primary/10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Risk Amount</p>
                      <p className="text-sm font-bold text-bear">₹{riskAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Leverage</p>
                      <p className="text-sm font-bold text-gold">1.5x</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drawdown Protection Visualization */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-bear" />
                  <CardTitle className="text-lg font-bold">Real-Time Drawdown Protection</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bull" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Equity Curve</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DRAWDOWN_DATA}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--bull))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--bull))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis 
                      hide
                      domain={['dataMin - 10000', 'dataMax + 10000']}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="hsl(var(--bull))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorEquity)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Peak Equity</p>
                  <p className="text-lg font-extrabold mono-font">₹10.08L</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Drawdown</p>
                  <p className="text-lg font-extrabold mono-font text-bear">0.55%</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Max Limit</p>
                  <p className="text-lg font-extrabold mono-font text-primary">3.00%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Layer */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">Pre-Trade Risk Validation Layer</CardTitle>
              </div>
              <CardDescription>Simulate a trade entry to check against active guardrails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Symbol</Label>
                  <Input placeholder="e.g. NIFTY" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Intended Qty</Label>
                  <Input type="number" placeholder="50" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">SL Distance</Label>
                  <Input type="number" placeholder="Points" className="h-10" />
                </div>
              </div>
              <Button className="w-full h-12 font-bold shadow-purple gap-2">
                <Zap className="w-4 h-4 fill-current" />
                VALIDATE TRADE SAFETY
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Status & Behavioral */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Risk Monitor */}
          <Card className={cn(
            "border-none shadow-sm overflow-hidden transition-colors",
            isHighRisk ? "bg-bear/5" : "bg-primary/5"
          )}>
            <div className={cn(
              "px-4 py-2 flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-widest",
              isHighRisk ? "bg-bear animate-pulse" : "bg-primary"
            )}>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Behavioral Risk Monitor
              </div>
              {isHighRisk && "CRITICAL"}
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <MascotDigi expression={isHighRisk ? "Sweating" : "Coaching"} size="sm" className="shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="bg-background/80 p-3 rounded-2xl rounded-tl-none border border-primary/10 text-[11px] leading-relaxed font-medium italic">
                    {isHighRisk 
                      ? "Warning! You're approaching your daily loss limit. Revenge probability is HIGH (72%). The Safe-Lock is armed."
                      : "Your trading behavior is disciplined. No signs of overtrading or FOMO detected in this session."
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Daily Loss Usage</span>
                    <span className={cn(isHighRisk ? "text-bear" : "text-primary")}>₹{currentLoss} / ₹{dailyLossLimit}</span>
                  </div>
                  <Progress value={lossProgress} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-xl border border-primary/5 flex flex-col items-center">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Revenge Risk</p>
                    <p className={cn("text-xs font-extrabold mt-1", isHighRisk ? "text-bear" : "text-bull")}>LOW</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-primary/5 flex flex-col items-center">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Speed Entry</p>
                    <p className="text-xs font-extrabold text-bull mt-1">NORMAL</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardrail Controls */}
          <Card className="shadow-sm border-gold/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold" />
                Active Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase">Overtrading Shield</span>
                  <span className="text-[9px] text-muted-foreground">Max 10 trades per session</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase">Profit Protection</span>
                  <span className="text-[9px] text-muted-foreground">Lock at 50% retracement</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase">Cool-off Timer</span>
                  <span className="text-[9px] text-muted-foreground">5 min break after 2 losses</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Market Regime */}
          <Card className="shadow-sm bg-gradient-to-br from-gold/5 to-transparent border-gold/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="inline-flex p-3 bg-gold/10 rounded-full text-gold">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volatility Status</p>
                <h3 className="text-xl font-extrabold mt-1">LOW RANGE</h3>
                <p className="text-[10px] text-muted-foreground mt-1 italic">"Optimal for mean reversion and selling options."</p>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="border-gold/20 text-gold bg-gold/5 font-bold uppercase text-[9px]">
                  India VIX @ {vixValue}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
