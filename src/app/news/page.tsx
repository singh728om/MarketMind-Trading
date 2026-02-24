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
  "Nifty 50 approaches lifetime high as FII inflows surge.",
  "Reserve Bank of India maintains status quo on interest rates.",
  "Global oil prices spike 3% amid Middle East tensions.",
  "Reliance Industries announces major green energy expansion.",
  "Indian IT giants report better-than-expected Q3 earnings.",
  "Consumer inflation in India hits 4-month low.",
  "US Fed signals potential rate cuts in late 2024.",
];

export default function NewsSentimentPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsSentimentOutput | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeNewsSentiment({
        headlines: MOCK_HEADLINES
      });
      setAnalysis(result);
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
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">AI News & Sentiment</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Headline Impact & Global Driver Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search news..." 
              className="pl-9 h-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-bold" 
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
              {analysis.analyzedItems.map((item, idx) => (
                <Card key={idx} className="group hover:border-primary/30 transition-all shadow-sm overflow-hidden bg-white">
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
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-4">
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
                                <div className={cn("h-full", item.impactProbability > 70 ? "bg-bear" : "bg-primary")} style={{ width: `${item.impactProbability}%` }} />
                              </div>
                              <span className="text-[10px] font-bold mono-font">{item.impactProbability}%</span>
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
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" />
                AI Sentiment Gauge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="text-4xl font-black tracking-tighter text-primary">{analysis?.overallMarketSentiment || '--'}</div>
                  <div className="absolute -bottom-2 -right-4">
                    <Badge className="bg-bull text-white text-[8px] font-bold">GREED</Badge>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-4 tracking-widest">Aggregate Market Vibe</p>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border border-primary/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium">
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
                {(analysis?.globalDrivers || ['US Fed Policy', 'Brent Crude Spikes', 'FII Rebalancing']).map((driver, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl group transition-all hover:bg-primary/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary">{driver}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact Heatmap Note */}
          <Card className="border-gold/20 bg-gold/5 shadow-purple">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <MascotDigi expression="Coaching" size="sm" />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Digi's News Alpha</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  "When FII net cash is positive and 'Inflation' headlines hit a multi-month low, Nifty Smallcap usually outperforms by 1.2% in the next session."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
