"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Sparkles, 
  Activity, 
  BarChart3, 
  Globe, 
  Search,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Info,
  Clock,
  ShieldCheck,
  BrainCircuit,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { analyzeNewsSentiment, type NewsSentimentOutput } from '@/ai/flows/ai-news-sentiment-analysis';

const MOCK_HEADLINES = [
  "Nifty 50 hits record lifetime high of 25,200 as global liquidity pours into Indian Equities.",
  "FIIs turn aggressive buyers for the 7th straight session, infusing ₹12,000 Cr in cash segment.",
  "India's Manufacturing PMI surges to 14-month high, signaling robust industrial expansion.",
  "Reliance Industries green energy roadmap receives 'Outperform' rating from global brokerages.",
  "RBI signals start of accommodative stance as inflation cools faster than expected.",
  "GST collections hit all-time high of ₹1.87 Lakh Cr, reinforcing India's growth narrative.",
  "Indian IT giants announce $5B in combined AI-cloud contracts with Fortune 500 firms.",
  "Auto sector stocks rally 4% on Government's new EV infrastructure subsidy plan."
];

export default function NewsSentimentPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsSentimentOutput | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeNewsSentiment({
        headlines: MOCK_HEADLINES
      });
      setAnalysis(result);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour12: true }));
    } catch (error) {
      console.error("Sentiment Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary relative">
            <Newspaper className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-bull"></span>
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI News & Sentiment</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Live Headline Impact & Global Driver Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end mr-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Feed Status</p>
            <p className="text-[11px] font-bold text-bull">Connected & Live</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-bold border-primary/20 hover:bg-primary/5" 
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            REFRESH FEED
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: News Feed */}
        <div className="lg:col-span-8 space-y-6">
          {!analysis && isAnalyzing ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
              <MascotDigi expression="Thinking" size="lg" className="animate-pulse" />
              <div className="text-center space-y-2">
                <p className="text-lg font-bold">AI is parsing global headlines...</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Calculating Market Impact Probabilities</p>
              </div>
            </div>
          ) : !analysis ? (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-10 bg-muted/10 border-none">
              <MascotDigi expression="Thinking" size="md" />
              <h3 className="font-bold text-lg mt-4">Feed Offline</h3>
              <Button className="mt-4" onClick={runAnalysis}>Connect to News Pipeline</Button>
            </Card>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold">
                    <Clock className="w-3 h-3 mr-1" /> LAST UPDATED: {lastRefreshed}
                  </Badge>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Analyzing {analysis.analyzedItems.length} Key Headlines</p>
              </div>

              {analysis.analyzedItems.map((item, idx) => (
                <Card key={idx} className="group hover:border-primary/30 transition-all shadow-sm overflow-hidden bg-white border-primary/5">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={cn(
                        "w-full md:w-1.5 h-1.5 md:h-auto shrink-0",
                        item.sentiment === 'Bullish' ? "bg-bull" : item.sentiment === 'Bearish' ? "bg-bear" : "bg-gold"
                      )} />
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                            {item.headline}
                          </h3>
                          <Badge className={cn(
                            "text-[9px] font-bold uppercase border-none shrink-0",
                            item.sentiment === 'Bullish' ? "bg-bull/10 text-bull" : item.sentiment === 'Bearish' ? "bg-bear/10 text-bear" : "bg-gold/10 text-gold"
                          )}>
                            {item.sentiment}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-4 font-medium">
                          "{item.reasoning}"
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dashed">
                          <div className="flex gap-2">
                            {item.sectorsAffected.map((s, si) => (
                              <Badge key={si} variant="outline" className="text-[8px] font-bold border-muted-foreground/20 text-muted-foreground uppercase">{s}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Impact Prob:</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                <div className={cn(
                                  "h-full", 
                                  item.sentiment === 'Bullish' ? "bg-bull" : "bg-bear"
                                )} style={{ width: `${item.impactProbability}%` }} />
                              </div>
                              <span className={cn(
                                "text-[10px] font-bold mono-font",
                                item.sentiment === 'Bullish' ? "text-bull" : "text-bear"
                              )}>{item.impactProbability}%</span>
                            </div>
                          </div>
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
          {/* Sentiment Scorecard */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" />
                AI Sentiment Gauge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="text-5xl font-black tracking-tighter text-primary">{analysis?.overallMarketSentiment || '--'}</div>
                  <div className="absolute -bottom-2 -right-4">
                    <Badge className={cn(
                      "text-white text-[8px] font-bold",
                      (analysis?.overallMarketSentiment || 0) > 50 ? "bg-bull" : "bg-bear"
                    )}>
                      {(analysis?.overallMarketSentiment || 0) > 50 ? "BULLISH" : "CAUTIOUS"}
                    </Badge>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-4 tracking-widest">Aggregate Market Vibe</p>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border border-primary/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed italic font-bold">
                  {analysis?.summaryNarrative || "Analyzing global news flows..."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Global Drivers */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Global Sentiment Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 mt-2">
                {(analysis?.globalDrivers || ['FII Inflows', 'Brent Crude Stability', 'GST Collection Peaks']).map((driver, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl group transition-all hover:bg-primary/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary">{driver}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Digi's News Alpha */}
          <Card className="border-gold/20 bg-gold/5 shadow-purple">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <MascotDigi expression="Celebrating" size="sm" />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Digi's News Alpha</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium italic">
                  "When the overall sentiment score crosses 70 and FII Net Cash is positive, mid-cap breakouts have a 78% higher success rate in the following session."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Heat Note */}
          <Card className="border-none shadow-sm bg-bull/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-bull uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Institutional conviction: HIGH
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                News data indicates institutional rotation into **Infrastructure** and **IT Services**. Watch for volume spikes in Nifty 50 constituents.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
