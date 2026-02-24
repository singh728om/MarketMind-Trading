"use client";

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Target, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Clock, 
  ArrowRight,
  RefreshCcw,
  Layers,
  Flame,
  Search,
  Filter,
  PieChart,
  Calendar,
  Briefcase,
  History,
  Scale,
  BrainCircuit,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { getSwingPositionalSetups, type SwingPositionalOutput } from '@/ai/flows/swing-positional-recommendations';

export default function SwingPositionalPage() {
  const [timeframe, setTimeframe] = useState<'Swing' | 'Positional'>('Swing');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<SwingPositionalOutput | null>(null);

  const fetchSetups = async () => {
    setIsRefreshing(true);
    try {
      const result = await getSwingPositionalSetups({ timeframe });
      setData(result);
    } catch (error) {
      console.error("Swing Discovery Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSetups();
  }, [timeframe]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Swing & Positional Hub</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              High-Conviction Investment Grade AI Signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
          <Button 
            variant={timeframe === 'Swing' ? 'default' : 'ghost'} 
            className={cn("h-9 px-6 rounded-lg text-xs font-bold uppercase", timeframe === 'Swing' ? "shadow-purple" : "text-muted-foreground")}
            onClick={() => setTimeframe('Swing')}
          >
            Swing (Days)
          </Button>
          <Button 
            variant={timeframe === 'Positional' ? 'default' : 'ghost'} 
            className={cn("h-9 px-6 rounded-lg text-xs font-bold uppercase", timeframe === 'Positional' ? "shadow-purple" : "text-muted-foreground")}
            onClick={() => setTimeframe('Positional')}
          >
            Positional (Weeks)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Discovery Stream */}
        <div className="lg:col-span-8 space-y-6">
          {!data && isRefreshing ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
              <MascotDigi expression="Thinking" size="lg" className="animate-bounce" />
              <div className="text-center space-y-2">
                <p className="text-lg font-bold">Scanning Institutional Buy Zones...</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Analyzing Fundamental Catalysts & Tech-Alignment</p>
              </div>
            </div>
          ) : !data ? (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-10 bg-muted/10">
              <Button onClick={fetchSetups}>Discover High-Conviction Setups</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {data.recommendations.map((setup, idx) => (
                <Card key={idx} className="group relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl bg-card">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-gold" />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight">{setup.symbol}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{setup.companyName}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "text-[9px] font-bold uppercase border-none",
                          setup.institutionalHeat === 'Intense' ? "bg-bear text-white" : "bg-bull/10 text-bull"
                        )}>
                          HEAT: {setup.institutionalHeat}
                        </Badge>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">
                          <Clock className="w-2.5 h-2.5 inline mr-1" /> {setup.horizon}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Setup Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-1">
                        <p className="text-[9px] font-bold text-primary uppercase">Entry Zone</p>
                        <p className="text-sm font-extrabold mono-font">{setup.entryZone}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Stop-Loss</p>
                        <p className="text-sm font-extrabold mono-font">{setup.stoploss}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <Target className="w-3 h-3" /> Profit Targets
                      </p>
                      <div className="flex gap-2">
                        {setup.targets.map((t, ti) => (
                          <div key={ti} className="flex-1 p-2 bg-bull/5 border border-bull/10 rounded-lg text-center">
                            <p className="text-xs font-bold mono-font text-bull">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-dashed">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-gold/10 text-gold shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gold">Fundamental Catalyst</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{setup.fundamentalCatalyst}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-primary">Technical Thesis</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{setup.technicalSetup}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 px-6">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold text-primary">{setup.conviction}% Conviction</span>
                      </div>
                      <Button size="sm" className="h-9 px-4 font-bold text-[10px] shadow-purple gap-2">
                        <Plus className="w-3.5 h-3.5" /> ADD TO PORTFOLIO
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Regime & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Market Regime */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Market Regime Detector
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-2xl font-black tracking-tighter uppercase text-primary">
                {data?.marketRegime || "Trending Strong"}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                The current environment favors **Growth over Value**. FIIs are rotating capital into Midcap leaders.
              </p>
              <div className="pt-2">
                <Badge variant="outline" className="h-6 border-bull/20 text-bull bg-bull/5 font-bold uppercase text-[9px]">
                  Optimal for Position Building
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Digi's Secret Sauce */}
          <Card className="border-primary/20 shadow-purple bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <MascotDigi expression="Coaching" size="sm" className="shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Digi's Secret Sauce</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium">
                    "{data?.digiTip || "Focus on stocks with 3+ consecutive quarters of FII accumulation."}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Heat Map (Mini) */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-bear" />
                Institutional Core Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3 mt-2">
                {[
                  { sector: 'Capital Goods', flow: '+₹1,420 Cr', heat: 'High' },
                  { sector: 'Defense', flow: '+₹840 Cr', heat: 'Medium' },
                  { sector: 'Power', flow: '+₹2,100 Cr', heat: 'Intense' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl group transition-all hover:bg-primary/5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">{s.sector}</span>
                      <span className="text-[9px] text-bull font-bold">{s.flow}</span>
                    </div>
                    <Badge className={cn(
                      "text-[8px] font-bold h-5",
                      s.heat === 'Intense' ? "bg-bear text-white" : "bg-primary/10 text-primary"
                    )}>{s.heat}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
