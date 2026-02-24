"use client";

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Target, 
  Users, 
  ArrowRight,
  MessageSquare,
  Activity,
  BarChart3,
  Scale,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { aiMultiPersonaAdvisor, type AiAdvisorOutput } from '@/ai/flows/ai-multi-persona-advisor';

export default function AIAdvisorPage() {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AiAdvisorOutput | null>(null);

  const handleRunAnalysis = async () => {
    if (!symbol) return;
    setIsAnalyzing(true);
    try {
      const result = await aiMultiPersonaAdvisor({
        symbol: symbol.toUpperCase(),
        timeframe: 'Intraday'
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Advisor Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI Expert Advisor</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Consensus-Based Multi-Persona Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g. NIFTY)" 
              className="pl-9 h-10 w-48 font-bold uppercase"
            />
          </div>
          <Button 
            className="gap-2 h-10 font-bold shadow-purple" 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
            {isAnalyzing ? "Consulting Panel..." : "GET ADVICE"}
          </Button>
        </div>
      </div>

      {!analysis && !isAnalyzing ? (
        <Card className="h-[500px] flex flex-col items-center justify-center text-center p-10 bg-muted/10 border-none">
          <MascotDigi expression="Thinking" size="lg" />
          <div className="max-w-md mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Your AI Investment Committee</h2>
            <p className="text-sm text-muted-foreground">
              Input any stock or index symbol to get a combined verdict from our Quant, Sentiment, and Trend experts.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['RELIANCE', 'NIFTY', 'HDFCBANK', 'TCS'].map(s => (
                <Button key={s} variant="outline" size="sm" className="text-[10px] font-bold" onClick={() => {setSymbol(s); handleRunAnalysis();}}>
                  Analyze {s}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      ) : isAnalyzing ? (
        <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
          <MascotDigi expression="Coaching" size="lg" className="animate-bounce" />
          <div className="space-y-2 text-center">
            <p className="text-lg font-bold">Digi is convening the panel...</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Running Multi-Persona Cross-Check</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Consensus Panel */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/[0.03] to-transparent">
              <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">The Analyst Panel Discussion</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">LIVE VERDICT</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analysis.analysts.map((analyst, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          i === 0 ? "bg-blue-500" : i === 1 ? "bg-purple-500" : "bg-indigo-500"
                        )}>
                          {analyst.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{analyst.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">{analyst.role}</p>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-border/50 h-full relative group">
                        <div className={cn(
                          "absolute -top-2 -right-2 px-2 py-0.5 rounded text-[8px] font-bold text-white",
                          analyst.sentiment === 'Bullish' ? "bg-bull" : analyst.sentiment === 'Bearish' ? "bg-bear" : "bg-gold"
                        )}>
                          {analyst.sentiment.toUpperCase()}
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                          "{analyst.opinion}"
                        </p>
                        <div className="mt-3 pt-3 border-t border-dashed flex items-center gap-2">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-bold uppercase text-primary">Key: {analyst.keyFactor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consensus Summary */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Expert Consensus</p>
                      <div className={cn(
                        "text-2xl font-extrabold tracking-tighter",
                        analysis.consensus.bias.includes('Buy') ? "text-bull" : analysis.consensus.bias.includes('Sell') ? "text-bear" : "text-gold"
                      )}>
                        {analysis.consensus.bias.toUpperCase()}
                      </div>
                      <Badge className="bg-primary text-[10px] font-bold">{analysis.consensus.score}% CONFIDENCE</Badge>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-sm font-bold uppercase text-primary tracking-widest">Unified Executive Summary</p>
                      </div>
                      <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                        {analysis.consensus.narrative}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actionable Trade Plan Card */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-bull" />
                  <CardTitle className="text-lg font-bold">Actionable Pro Trade Plan</CardTitle>
                </div>
                <CardDescription>Synthesized from panel recommendations</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-bull/5 border border-bull/10 rounded-2xl text-center space-y-1">
                    <p className="text-[9px] font-bold text-bull uppercase">Recommended Entry</p>
                    <p className="text-xl font-extrabold mono-font">{analysis.tradePlan.entry}</p>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-center space-y-1">
                    <p className="text-[9px] font-bold text-primary uppercase">Primary Target</p>
                    <p className="text-xl font-extrabold mono-font">{analysis.tradePlan.target}</p>
                  </div>
                  <div className="p-4 bg-bear/5 border border-bear/10 rounded-2xl text-center space-y-1">
                    <p className="text-[9px] font-bold text-bear uppercase">Hard Stop-Loss</p>
                    <p className="text-xl font-extrabold mono-font">{analysis.tradePlan.stoploss}</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl text-center space-y-1 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Risk Rating</p>
                    <p className="text-xs font-bold uppercase text-gold">{analysis.tradePlan.risk}</p>
                  </div>
                </div>
                <Button className="w-full h-12 mt-6 font-bold shadow-purple gap-2">
                  <Zap className="w-4 h-4 fill-current" />
                  EXECUTE THIS PLAN INSTANTLY
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-6">
            {/* Market Regime */}
            <Card className="shadow-sm border-gold/10 bg-gold/5 overflow-hidden">
              <CardHeader className="bg-gold p-4">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Regime detection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-gold tracking-tighter">VOLATILE TRENDING</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">High probability of fakeouts</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-gold/10">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Volatility Risk</span>
                    <span className="text-bear">HIGH</span>
                  </div>
                  <Progress value={78} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* AI Technical Snapshot */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <BarChart3 className="w-4 h-4" />
                  Technical Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Relative Strength (RSI)</span>
                    <span className="text-xs font-bold mono-font">64.2</span>
                  </div>
                  <Progress value={64} className="h-1" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">EMA 20/50 Crossover</span>
                    <Badge className="bg-bull text-[8px] font-bold">BULLISH</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume Intensity</span>
                    <span className="text-xs font-bold text-bull">1.4x Avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Digi's Final Tip */}
            <Card className="border-primary/20 bg-primary/5 shadow-purple">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <MascotDigi expression="Coaching" size="sm" />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Digi's Secret Sauce</p>
                  <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                    "When the Quant Master and Sentiment Guru both agree on 'Bullish', the breakout probability increases by 22% based on your recent journal history."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
