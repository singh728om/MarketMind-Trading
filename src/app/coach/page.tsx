
"use client";

import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Zap, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Smile, 
  Frown, 
  Meh, 
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Timer,
  BarChart3,
  Sparkles,
  ArrowRight,
  MessageSquareQuote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import { aiTradingCoachBehavioralAnalysis, type AITradingCoachBehavioralAnalysisOutput } from '@/ai/flows/ai-trading-coach-behavioral-analysis';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const EMOTION_DATA = [
  { name: 'Disciplined', value: 65, color: 'hsl(var(--bull))' },
  { name: 'FOMO', value: 15, color: 'hsl(var(--bear))' },
  { name: 'Revenge', value: 10, color: 'hsl(var(--danger))' },
  { name: 'Greed', value: 10, color: 'hsl(var(--gold))' },
];

export default function AITradingCoach() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AITradingCoachBehavioralAnalysisOutput | null>(null);

  // Get User Profile for risk settings
  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  const { data: userProfile } = useDoc(userRef);

  // Get Trade History
  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      orderBy('openedAt', 'desc'),
      limit(20)
    );
  }, [firestore, userId]);
  const { data: trades, isLoading: tradesLoading } = useCollection(tradesQuery);

  const handleGenerateAnalysis = async () => {
    if (!trades || trades.length === 0) return;
    setIsAnalyzing(true);
    try {
      // Mapping real data to flow inputs
      const result = await aiTradingCoachBehavioralAnalysis({
        tradeJournalEntries: trades.map(t => ({
          symbol: t.symbol,
          side: t.side as 'BUY' | 'SELL',
          qty: t.qty,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          pnl: t.pnl || 0,
          pnlPct: t.pnlPct || 0,
          openedAt: t.openedAt,
          closedAt: t.closedAt,
          emotionTag: (t.emotionTag as any) || 'None',
          followedRules: (t.followedRules as any) || 'Yes',
          strategy: t.strategyName
        })),
        pnlByTimeOfDaySummary: "Often profitable in mornings (9:30-11:00), tendency to take small losses in consolidation phase (1:00-2:00 PM).",
        emotionVsOutcomeSummary: "Disciplined trades have an 85% win rate. FOMO trades result in average 4% drawdown.",
        ruleAdherenceSummary: "Followed stop-loss rules in 18/20 trades. Failed to exit early on 2 occasions due to hope.",
        currentRiskProfile: (userProfile?.riskProfile as any) || 'Moderate',
        last30DaysPerformanceSummary: "Total PnL +₹12,450, 14 wins, 6 losses. Sharpe ratio 1.8."
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Coach Analysis Error:", error);
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
            <h1 className="text-2xl font-headline font-bold">AI Trading Coach</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Gemini-Powered Behavioral Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="gap-2 h-10 font-bold shadow-purple px-6" 
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing || tradesLoading || !trades || trades.length === 0}
          >
            {isAnalyzing ? (
              <Zap className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-current" />
            )}
            {isAnalyzing ? "Analyzing Behavior..." : "GENERATE PERFORMANCE REPORT"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Behavioral Pulse */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Smile className="w-4 h-4 text-bull" />
                Emotional Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EMOTION_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {EMOTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {EMOTION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                    <span className="text-[10px] font-bold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-primary tracking-widest">Psychological Consistency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Rule Adherence</span>
                  <span className="text-bull">90%</span>
                </div>
                <Progress value={90} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Emotional Resilience</span>
                  <span className="text-gold">72%</span>
                </div>
                <Progress value={72} className="h-1.5" />
              </div>
              <div className="p-3 bg-white/50 rounded-xl border border-primary/10">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "You maintain discipline during winning streaks, but your consistency drops by 15% after a large loss."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: The AI Coach Narrative */}
        <div className="lg:col-span-8 space-y-6">
          {!analysis ? (
            <Card className="border-none shadow-sm h-[500px] flex flex-col items-center justify-center text-center p-10 bg-muted/10">
              <MascotDigi expression="Coaching" size="lg" />
              <div className="max-w-md mt-6 space-y-4">
                <h2 className="text-xl font-bold">Meet Your AI Trading Coach</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Digi analyzes your execution history, entry timing, and emotional tags to build a unique psychological profile of your trading style.
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-3 bg-background rounded-xl border flex items-start gap-3">
                    <History className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-[10px] font-medium">Scans last 20 trades for patterns</span>
                  </div>
                  <div className="p-3 bg-background rounded-xl border flex items-start gap-3">
                    <Target className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span className="text-[10px] font-medium">Identifies strengths and blind spots</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-11 font-bold gap-2" onClick={handleGenerateAnalysis}>
                  <Zap className="w-4 h-4" />
                  START BEHAVIORAL AUDIT
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* The Narrative Report */}
              <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquareQuote className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">AI Performance Narrative</CardTitle>
                  </div>
                  <Badge className="bg-bull text-white text-[9px]">NEW REPORT</Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <MascotDigi expression="Thinking" size="md" className="shrink-0" />
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed font-medium">
                        {analysis.narrativeReport.split('\n').map((para, i) => (
                          <p key={i} className="mb-3">{para}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm border-l-4 border-l-gold bg-gold/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-gold" />
                      Suggested Discipline Rules
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold text-gold/80">Tailored to fix your detected blind spots</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.suggestedRules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gold/10">
                        <div className="h-5 w-5 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground leading-snug">{rule}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-bear/5 border-l-4 border-l-bear">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-bear">
                      <Timer className="w-4 h-4" />
                      Historical Impact Scan
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold text-bear/80">If these rules were active last 30 days...</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Capital Saved</p>
                      <p className="text-3xl font-extrabold text-bear mono-font mt-1">₹8,420.00</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                        <span>Losing Trades Prevented</span>
                        <span className="text-bear">4 Trades</span>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6,7,8].map(i => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= 4 ? "bg-bear" : "bg-muted")} />
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-10 text-[10px] font-bold border-bear/20 text-bear hover:bg-bear hover:text-white">
                      ACTIVATE THESE RULES NOW
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unique Feature: Time-of-Day Efficiency */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold">Session Efficiency Mapping</CardTitle>
          </div>
          <CardDescription>Your win-rate efficiency mapped across Indian market hours</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { time: '09:15-10:30', efficiency: 88 },
                { time: '10:30-12:00', efficiency: 65 },
                { time: '12:00-13:30', efficiency: 42 },
                { time: '13:30-15:00', efficiency: 75 },
                { time: '15:00-15:30', efficiency: 30 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  hide
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border p-2 rounded-lg shadow-xl text-[10px] font-bold">
                          Efficiency: {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} barSize={40}>
                  {[88, 65, 42, 75, 30].map((val, index) => (
                    <Cell key={`cell-${index}`} fill={val > 70 ? 'hsl(var(--bull))' : val > 50 ? 'hsl(var(--gold))' : 'hsl(var(--bear))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-primary shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Edge Identification</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Your **Golden Hour** is 09:15 to 10:30 AM. You have high focus and rule adherence here. Avoid taking new positions after 3:00 PM, as your efficiency drops by 60% due to "closing-bell anxiety."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
