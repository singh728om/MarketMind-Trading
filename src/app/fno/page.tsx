"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Activity, Target, ShieldAlert, 
  TrendingUp, TrendingDown, Layers, 
  BarChart3, Clock,
  Flame, Crosshair, ArrowRight, Settings2,
  Zap, Info, LineChart, Timer,
  ArrowUpRight, ArrowDownRight,
  BrainCircuit, RefreshCcw
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
  addDocumentNonBlocking 
} from '@/firebase';
import { collection } from 'firebase/firestore';
import { fnoStrategyRecommendation, type FnoStrategyRecommendationOutput } from '@/ai/flows/fno-strategy-recommendation';

const OI_BUILDUP = [
  { strike: 22400, callOI: 4520, putOI: 8450, status: 'Strong Support' },
  { strike: 22500, callOI: 6240, putOI: 5120, status: 'Straddle Zone' },
  { strike: 22600, callOI: 9850, putOI: 2450, status: 'Heavy Resistance' },
  { strike: 22700, callOI: 7450, putOI: 1200, status: 'Wall' },
];

export default function FnoIntelligence() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;
  
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [intelligence, setIntelligence] = useState<FnoStrategyRecommendationOutput | null>(null);

  const fetchFnoIntelligence = async () => {
    setIsRefreshing(true);
    try {
      const result = await fnoStrategyRecommendation({
        index: selectedIndex,
        expiry: 'Current Week',
        currentMarketPrice: selectedIndex === 'NIFTY' ? 22450 : 48200,
        vix: 13.42,
        pcr: 1.28,
        maxPain: selectedIndex === 'NIFTY' ? 22450 : 48000,
        fiiDiiInterpretation: "FIIs are building long positions in index futures. Net buyers in cash.",
        optionsChainSummary: "Significant OI buildup at 22,400 PE. Call writing observed at 22,600.",
        technicalAnalysisSummary: "Supertrend is BULLISH on 15m. RSI at 64.",
        newsSentimentSummary: "Positive global cues. GDP growth beats expectations."
      });
      setIntelligence(result);
    } catch (error) {
      console.error("F&O Fetch Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFnoIntelligence();
  }, [selectedIndex]);

  const handleQuickStrategy = (strategy: any) => {
    if (!firestore || !userId) return;
    const tradesRef = collection(firestore, 'users', userId, 'trades');
    
    // Simulate primary leg execution
    addDocumentNonBlocking(tradesRef, {
      userId,
      symbol: `${selectedIndex} ${strategy.legs[0].strike} ${strategy.legs[0].instrument}`,
      exchange: 'NSE',
      segment: 'F&O',
      side: strategy.legs[0].type,
      qty: 50,
      entryPrice: strategy.legs[0].premium,
      status: 'OPEN',
      brokerOrderId: 'FNO-' + Math.random().toString(36).substr(2, 7),
      strategyName: strategy.name,
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* F&O Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">F&O Intelligence Hub</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Real-time Option Chain & AI Strategies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={selectedIndex} onValueChange={setSelectedIndex} className="w-full md:w-auto">
            <TabsList className="bg-muted/50 p-1 rounded-xl border">
              <TabsTrigger value="NIFTY" className="rounded-lg text-[10px] font-bold px-4 h-8 uppercase">NIFTY</TabsTrigger>
              <TabsTrigger value="BANKNIFTY" className="rounded-lg text-[10px] font-bold px-4 h-8 uppercase">BANK NIFTY</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl" 
            onClick={fetchFnoIntelligence}
            disabled={isRefreshing}
          >
            <RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analysis Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* F&O Market Pulse Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-bull/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">PCR (Put-Call Ratio)</p>
                <div className="flex items-end justify-between mt-2">
                   <span className="text-xl font-extrabold mono-font text-bull">1.28</span>
                   <Badge className="bg-bull/10 text-bull border-none text-[8px]">BULLISH</Badge>
                </div>
                <Progress value={65} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-bear/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">India VIX</p>
                <div className="flex items-end justify-between mt-2">
                   <span className="text-xl font-extrabold mono-font text-bear">13.42</span>
                   <span className="text-[9px] font-bold text-bear">-0.56%</span>
                </div>
                <Progress value={32} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-gold/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Max Pain</p>
                <div className="flex items-end justify-between mt-2">
                   <span className="text-xl font-extrabold mono-font text-gold">{selectedIndex === 'NIFTY' ? '22,450' : '48,000'}</span>
                   <Target className="w-4 h-4 text-gold opacity-50" />
                </div>
                <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">Expiry Anchor Strike</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Expiry</p>
                <div className="flex items-end justify-between mt-2">
                   <span className="text-xl font-extrabold mono-font text-primary">21 MAR</span>
                   <Timer className="w-4 h-4 text-primary opacity-50" />
                </div>
                <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">3 Days Remaining</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Strategy Recommendations */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-primary" />
                 AI Strategy Recommendations
               </h3>
               {intelligence && (
                 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase font-bold text-[10px]">
                   Bias: {intelligence.marketBias}
                 </Badge>
               )}
             </div>

             {!intelligence || isRefreshing ? (
               <div className="h-[300px] flex flex-col items-center justify-center space-y-4 bg-muted/10 rounded-3xl border border-dashed">
                 <MascotDigi expression="Thinking" size="md" className="animate-bounce" />
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Digi is analyzing the options chain...</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {intelligence.topRecommendedStrategies.map((strategy, idx) => (
                    <Card key={idx} className="group relative overflow-hidden border-primary/10 hover:border-primary transition-all shadow-sm bg-card">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase">
                            {strategy.probabilityOfProfit}% POP
                          </Badge>
                          <div className="flex items-center gap-1.5 text-primary">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{intelligence.confidence}% Confidence</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-bold mt-1">{strategy.name}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
                          {strategy.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {strategy.legs.map((leg, li) => (
                            <div key={li} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-[11px] font-medium">
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-[9px] px-1 h-4", leg.type === 'BUY' ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>
                                  {leg.type}
                                </Badge>
                                <span>{leg.strike} {leg.instrument}</span>
                              </div>
                              <span className="mono-font font-bold">₹{leg.premium}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-dashed">
                          <div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Max Profit</p>
                            <p className="text-xs font-bold text-bull">₹{strategy.maxProfit?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Max Loss</p>
                            <p className="text-xs font-bold text-bear">₹{strategy.maxLoss?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Risk:Reward</p>
                            <p className="text-xs font-bold text-primary">{strategy.riskRewardRatio}</p>
                          </div>
                        </div>

                        <Button 
                          className="w-full h-10 font-bold text-xs gap-2 shadow-sm"
                          onClick={() => handleQuickStrategy(strategy)}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          EXECUTE STRATEGY
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
               </div>
             )}
          </div>

          {/* OI Analytics Table */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Open Interest Buildup Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Strike Price</span>
                  <span>Call OI (Lakhs)</span>
                  <span>Put OI (Lakhs)</span>
                  <span className="text-right">Interpretation</span>
                </div>
                {OI_BUILDUP.map((row) => (
                  <div key={row.strike} className="grid grid-cols-4 items-center p-3 px-4 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-all group">
                    <span className="text-sm font-bold mono-font">{row.strike}</span>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 bg-bear/20 rounded-full flex-1 overflow-hidden">
                          <div className="h-full bg-bear" style={{ width: `${(row.callOI / 10000) * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-bold mono-font">{row.callOI}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 bg-bull/20 rounded-full flex-1 overflow-hidden">
                          <div className="h-full bg-bull" style={{ width: `${(row.putOI / 10000) * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-bold mono-font">{row.putOI}</span>
                    </div>
                    <div className="text-right">
                       <Badge variant="outline" className={cn(
                         "text-[8px] font-bold border-none px-1.5 h-5",
                         row.status.includes('Support') ? "bg-bull/10 text-bull" : 
                         row.status.includes('Resistance') ? "bg-bear/10 text-bear" : 
                         "bg-gold/10 text-gold"
                       )}>
                         {row.status}
                       </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Intel Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digi's F&O Wisdom */}
          <Card className="border-primary/20 bg-primary/5 overflow-hidden shadow-sm">
            <CardHeader className="bg-primary p-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <MascotDigi expression="Coaching" size="sm" className="bg-white/20 border-none h-6 w-6" />
                Digi's F&O Wisdom
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <MascotDigi expression="Thinking" size="sm" className="shrink-0" />
                <div className="bg-background/80 p-3 rounded-2xl rounded-tl-none border border-primary/10 text-[11px] leading-relaxed font-medium italic">
                  {intelligence?.geminiReasoning || "Analyzing live delta and theta decay across the chain. One moment..."}
                </div>
              </div>

              {intelligence && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-bull/10 text-bull mt-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-bull uppercase">Data Input: OI Buildup</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Bullish divergence on the 15m timeframe confirmed by PE writing.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-bear/10 text-bear mt-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-bear uppercase">Strike to Avoid</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {intelligence.strikesToAvoid[0]?.strike} {intelligence.strikesToAvoid[0]?.instrument}: {intelligence.strikesToAvoid[0]?.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Striker Tool */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase">
                 <Crosshair className="w-4 h-4 text-primary" />
                 Quick Striker
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Base Instrument</label>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-9 text-[10px] font-bold border-primary/20 bg-primary/5">ATM CE</Button>
                    <Button variant="outline" className="h-9 text-[10px] font-bold border-primary/20">ATM PE</Button>
                 </div>
               </div>
               
               <div className="p-4 bg-muted/20 rounded-xl border border-dashed text-center space-y-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Suggested ATM Strike</p>
                  <p className="text-lg font-extrabold mono-font">{selectedIndex === 'NIFTY' ? '22,450' : '48,200'}</p>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="text-center">
                       <p className="text-[8px] font-bold text-muted-foreground uppercase">Call LTP</p>
                       <p className="text-xs font-bold text-bull">₹145.20</p>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="text-center">
                       <p className="text-[8px] font-bold text-muted-foreground uppercase">Put LTP</p>
                       <p className="text-xs font-bold text-bear">₹112.40</p>
                    </div>
                  </div>
               </div>

               <Button className="w-full h-11 font-bold text-xs gap-2 shadow-sm">
                 <LineChart className="w-4 h-4" />
                 Open Advanced Option Chain
               </Button>
            </CardContent>
          </Card>

          {/* Risk Note */}
          {intelligence && (
            <Card className="shadow-sm border-gold/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gold font-bold text-[10px] uppercase tracking-widest mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  Risk Exposure Note
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  VIX is at {intelligence.confidence < 80 ? 'elevated' : 'stable'} levels. Maintain strict stop-losses on debit spreads. Current market confidence: {intelligence.confidence}%.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
