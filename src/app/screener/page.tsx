"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Zap, 
  Sparkles, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Layers,
  ChevronRight,
  RefreshCcw,
  Plus,
  ArrowRight,
  Info,
  BrainCircuit,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { runSmartScreener, type SmartScreenerOutput } from '@/ai/flows/ai-smart-screener';
import { useFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function SmartScreenerPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [query, setQuery] = useState("Stocks with RSI divergence and rising institutional volume");
  const [segment, setSegment] = useState<'Large Cap' | 'Mid Cap' | 'Small Cap' | 'All'>('All');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<SmartScreenerOutput | null>(null);

  const handleRunScan = async () => {
    if (!query.trim()) return;
    setIsScanning(true);
    try {
      const result = await runSmartScreener({
        query,
        segment
      });
      setResults(result);
    } catch (error) {
      console.error("Screener Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToWatchlist = (symbol: string) => {
    if (!firestore || !userId) return;
    const watchlistRef = collection(firestore, 'users', userId, 'watchlists');
    // Simplified: in real app would find existing or create new named watchlist
    addDocumentNonBlocking(watchlistRef, {
      userId,
      name: "Screener Picks",
      symbols: [symbol],
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI Smart Screener</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Natural Language Market Discovery Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3 border-primary/20 bg-primary/5 text-primary font-bold">
            <Activity className="w-3.5 h-3.5 mr-2" />
            Scanner Status: READY
          </Badge>
        </div>
      </div>

      {/* Input Bar */}
      <Card className="border-none shadow-lg overflow-hidden bg-primary shadow-purple">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest ml-1">Screening Thesis</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Find stocks with multi-year breakouts and high FII heat..." 
                  className="pl-12 h-14 bg-white border-none text-foreground text-sm font-medium rounded-xl shadow-inner"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48 space-y-2">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest ml-1">Cap Segment</label>
              <Select value={segment} onValueChange={(v: any) => setSegment(v)}>
                <SelectTrigger className="h-14 bg-white/10 border-white/20 text-white font-bold rounded-xl focus:ring-0">
                  <SelectValue placeholder="All Caps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Assets</SelectItem>
                  <SelectItem value="Large Cap">Large Cap</SelectItem>
                  <SelectItem value="Mid Cap">Mid Cap</SelectItem>
                  <SelectItem value="Small Cap">Small Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-black rounded-xl gap-3 shadow-xl transition-all hover:scale-[1.02]"
              onClick={handleRunScan}
              disabled={isScanning}
            >
              {isScanning ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
              {isScanning ? "SCANNING..." : "RUN AI SCAN"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results Stream */}
        <div className="lg:col-span-8 space-y-6">
          {!results && !isScanning ? (
            <Card className="h-[500px] flex flex-col items-center justify-center text-center p-10 bg-muted/10 border-none rounded-3xl">
              <MascotDigi expression="Thinking" size="lg" />
              <div className="max-w-md mt-6 space-y-4">
                <h2 className="text-2xl font-bold">Discover Your Next Alpha</h2>
                <p className="text-sm text-muted-foreground">
                  Digi is ready to scan through thousands of NSE/BSE tickers using multi-factor cross-referencing.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {[
                    "Golden Crossover + FII Buy",
                    "Relative Strength Leaders",
                    "Oversold Quality Largecaps",
                    "F&O Long Buildup Scans"
                  ].map(s => (
                    <Button 
                      key={s} 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] font-bold border-primary/10 hover:bg-primary/5"
                      onClick={() => {setQuery(s);}}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ) : isScanning ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-8">
              <MascotDigi expression="Coaching" size="lg" className="animate-bounce" />
              <div className="text-center space-y-4 w-full max-w-xs">
                <p className="text-lg font-bold">Digi is parsing the tickers...</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Filtering 4,500+ Stocks</span>
                    <span>84%</span>
                  </div>
                  <Progress value={84} className="h-1.5" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Running Institutional Heat Cross-Check</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Found {results.totalFound} High-Probability Matches
                </h3>
                <Badge className="bg-bull text-white text-[9px] uppercase font-bold">Regime: {results.marketRegime}</Badge>
              </div>

              {results.results.map((stock, idx) => (
                <Card key={idx} className="group hover:border-primary/30 transition-all shadow-sm overflow-hidden bg-white border-primary/5">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={cn(
                        "w-full md:w-1.5 h-1.5 md:h-auto shrink-0",
                        stock.technicalVibe.includes('Bullish') ? "bg-bull" : "bg-bear"
                      )} />
                      <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm",
                            stock.technicalVibe.includes('Bullish') ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                          )}>
                            {stock.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                                {stock.symbol}
                              </h3>
                              <Badge variant="outline" className="text-[8px] font-bold h-4 px-1.5 border-primary/20 text-primary">
                                {stock.technicalVibe}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{stock.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:px-8 md:border-x border-dashed">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Live Price</p>
                            <p className={cn("text-sm font-extrabold mono-font", stock.change >= 0 ? "text-bull" : "text-bear")}>
                              ₹{stock.price.toLocaleString()}
                            </p>
                            <p className={cn("text-[10px] font-bold mono-font", stock.change >= 0 ? "text-bull" : "text-bear")}>
                              {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </p>
                          </div>
                          <div className="text-center min-w-[80px]">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">AI Match</p>
                            <div className="flex items-center gap-1.5 justify-center">
                              <BrainCircuit className="w-3 h-3 text-primary" />
                              <span className="text-xs font-black text-primary">{stock.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary"
                            onClick={() => handleAddToWatchlist(stock.symbol)}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <Button className="h-10 px-4 rounded-xl font-bold text-[11px] shadow-purple gap-2">
                            ANALYZE <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* Expandable Reasoning area */}
                    <div className="px-5 pb-5 pt-0 ml-1.5 md:ml-16">
                      <div className="bg-muted/30 p-3 rounded-xl border border-transparent group-hover:border-muted-foreground/5 transition-all">
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-medium italic">
                          "{stock.matchReason}"
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Target className="w-3 h-3 text-gold" />
                          <span className="text-[9px] font-bold text-gold uppercase tracking-tighter">Institutional Flow: {stock.institutionalActivity}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Intel Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digi Observation */}
          <Card className="border-primary/20 shadow-purple bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <MascotDigi expression="Coaching" size="sm" className="bg-white/20 border-none h-6 w-6" />
                Digi's Screen Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <MascotDigi expression="Thinking" size="sm" className="shrink-0" />
                <div className="bg-background/80 p-3 rounded-2xl rounded-tl-none border border-primary/10 text-[11px] leading-relaxed font-medium italic">
                  {results?.digiObservation || "Awaiting your scan query. I can analyze technical patterns, institutional flows, and volume anomalies simultaneously."}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold mt-0.5">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gold uppercase">Sector Rotation</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Automotive and Capital Goods are showing highest relative strength today.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-bull/10 text-bull mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-bull uppercase">Volume Surprise</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Midcap IT stocks are seeing 2.5x volume buildup at support levels.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Filter Presets */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Power Scan Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 mt-2">
                {[
                  { name: 'FII Shadow Scans', icon: Activity },
                  { name: '52-Week High Breakouts', icon: TrendingUp },
                  { name: 'Oversold Quality Gap-Ups', icon: Target },
                  { name: 'Low Float Volatility', icon: Zap }
                ].map((preset, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-xl group transition-all hover:bg-primary/5 cursor-pointer"
                    onClick={() => setQuery(preset.name)}
                  >
                    <div className="flex items-center gap-3">
                      <preset.icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary">{preset.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <Card className="border-gold/20 bg-gold/5 shadow-purple">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <Info className="w-6 h-6 text-gold" />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Alpha Strategy Note</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  "Combining 'RSI Oversold' with 'Positive FII Net Cash' has historically identified major reversal bottoms in the Nifty Midcap index with 72% precision."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
