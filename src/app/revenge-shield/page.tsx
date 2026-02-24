"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Timer, 
  Zap, 
  History, 
  Lock, 
  Unlock, 
  RotateCcw, 
  BrainCircuit,
  Settings2,
  Ban,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { revengeTradePrevention, type RevengeTradePreventionOutput } from '@/ai/flows/revenge-trade-prevention';

export default function RevengeShieldPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  // Local State for Detection Simulation
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<RevengeTradePreventionOutput | null>(null);
  
  // Configuration State
  const [rules, setRules] = useState({
    maxLossStreak: 3,
    coolingPeriod: 15,
    maxLotSizeCap: true,
    symbolLock: true,
    autoLockEnabled: true
  });

  // Fetch recent trades to show impact
  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      orderBy('openedAt', 'desc'),
      limit(5)
    );
  }, [firestore, userId]);

  const { data: recentTrades } = useCollection(tradesQuery);

  const handleScanRevenge = async () => {
    setIsScanning(true);
    try {
      // Simulate input data for the Genkit Flow based on current session
      const result = await revengeTradePrevention({
        dailyPnl: -2450,
        dailyPnlLimit: -5000,
        tradesToday: 8,
        maxTradesPerDay: 15,
        lastLossTimestamp: Date.now() - (10 * 60 * 1000), // 10 mins ago
        nextOrderTimestamp: Date.now(),
        averageQty: 50,
        currentOrderQty: 150, // Chasing behavior
        lastTwoTradesOutcome: ['loss', 'loss'],
        normalTradingHoursStart: '09:15',
        normalTradingHoursEnd: '15:30',
        currentTimestamp: Date.now(),
        lastLossStockSymbol: 'NIFTY',
        currentTradeStockSymbol: 'NIFTY',
        consecutiveLosses: 2,
        aiStrategyRecommendation: 'HOLD',
        userAction: 'BUY',
        tradeFrequencyInLast2Hours: 5,
        dailyAverageTradeFrequency: 10,
        currentFnoLotSize: 150,
        averageFnoLotSize: 50
      });
      setAiAnalysis(result);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const saveRules = () => {
    if (!firestore || !userId) return;
    const limitsRef = doc(firestore, 'users', userId, 'risk_limits', 'default');
    setDocumentNonBlocking(limitsRef, {
      ...rules,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-bear/10 text-bear">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Revenge Shield</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-bear animate-pulse" />
              Emotional Trading Protection Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-4 border-bear/20 bg-bear/5 text-bear font-bold uppercase tracking-tighter">
            Risk Guard: ARMED
          </Badge>
          <Button variant="outline" size="sm" className="gap-2 h-9 font-bold" onClick={saveRules}>
            <Settings2 className="w-4 h-4" />
            Save Rules
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Detection & Analysis */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Revenge Analyzer */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-bear/[0.02] to-transparent">
            <CardHeader className="bg-bear/5 border-b border-bear/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-bear" />
                  <CardTitle className="text-lg font-bold">AI Pattern Analyzer</CardTitle>
                </div>
                <Badge className="bg-bear text-white text-[10px] animate-pulse">LIVE MONITOR</Badge>
              </div>
              <CardDescription>Scanning behavioral markers for emotional trade hijacking</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!aiAnalysis ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <MascotDigi expression="Thinking" size="lg" />
                  <div className="max-w-xs">
                    <h3 className="font-bold text-lg">Ready to Scan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Run analysis to check if your recent trading patterns match emotional biases.</p>
                  </div>
                  <Button 
                    className="gap-2 bg-bear hover:bg-bear/90 shadow-lg px-8 h-12 font-bold" 
                    onClick={handleScanRevenge}
                    disabled={isScanning}
                  >
                    {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                    {isScanning ? "Analyzing Patterns..." : "SCAN FOR REVENGE PATTERNS"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <MascotDigi expression={aiAnalysis.digiExpression} size="md" className="shrink-0" />
                        <div className="bg-background/80 p-4 rounded-2xl rounded-tl-none border border-bear/10 shadow-sm">
                          <p className="text-sm font-medium leading-relaxed italic">
                            "{aiAnalysis.message}"
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/20 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Revenge Probability</span>
                          <span className={cn(
                            "text-lg font-extrabold mono-font",
                            aiAnalysis.revengeProbability > 70 ? "text-bear" : "text-gold"
                          )}>{aiAnalysis.revengeProbability}%</span>
                        </div>
                        <Progress value={aiAnalysis.revengeProbability} className="h-2" />
                      </div>
                    </div>

                    <div className="bg-bear/5 border border-bear/10 rounded-2xl p-6 flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-2 text-bear font-bold text-sm uppercase">
                        <ShieldAlert className="w-4 h-4" />
                        AI Intervention Status
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold border-b border-bear/10 pb-2">
                          <span className="text-muted-foreground uppercase">Severity Level</span>
                          <Badge variant="destructive" className="bg-bear">{aiAnalysis.interventionLevel} / 4</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold border-b border-bear/10 pb-2">
                          <span className="text-muted-foreground uppercase">Required Action</span>
                          <span className="uppercase text-bear">{aiAnalysis.actionRequired}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-muted-foreground uppercase">Pattern ID</span>
                          <span className="mono-font text-muted-foreground">REV-942-X</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full h-10 gap-2 border-bear/20 text-bear hover:bg-bear/5" onClick={() => setAiAnalysis(null)}>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hard Enforcement Rules Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Ban className="w-5 h-5 text-bear" />
                Active Restrictions & Lockdown Rules
              </CardTitle>
              <CardDescription>These rules are hard-coded into the execution engine to prevent emotional slippage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-transparent hover:border-bear/10 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight">Consecutive Loss Lock</p>
                      <p className="text-[10px] text-muted-foreground">Suspend trading after {rules.maxLossStreak} losses in a row.</p>
                    </div>
                    <Switch checked={rules.autoLockEnabled} onCheckedChange={(val) => setRules({...rules, autoLockEnabled: val})} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-transparent hover:border-bear/10 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight">Symbol Quarantine</p>
                      <p className="text-[10px] text-muted-foreground">Lock losing symbols for the rest of the session.</p>
                    </div>
                    <Switch checked={rules.symbolLock} onCheckedChange={(val) => setRules({...rules, symbolLock: val})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-transparent hover:border-bear/10 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight">Post-Loss Cooling Off</p>
                      <p className="text-[10px] text-muted-foreground">Force a {rules.coolingPeriod} min break after every loss.</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{rules.coolingPeriod}m</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-transparent hover:border-bear/10 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight">Position Size Ceiling</p>
                      <p className="text-[10px] text-muted-foreground">Disable qty scaling if net P&L is negative.</p>
                    </div>
                    <Switch checked={rules.maxLotSizeCap} onCheckedChange={(val) => setRules({...rules, maxLotSizeCap: val})} />
                  </div>
                </div>
              </div>

              <div className="bg-bear/5 border border-dashed border-bear/20 p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-background rounded-lg text-bear">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-bear">Lockdown Protocol</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">When detection triggers, your API keys are temporarily suspended for the lock duration.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Restrictions Status & History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Enforcement Status */}
          <Card className="border-none shadow-sm bg-background overflow-hidden border-l-4 border-l-bull">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-bull" />
                Execution Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-bull tracking-tighter">UNLOCKED</span>
                <Unlock className="w-6 h-6 text-bull opacity-50" />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                System status is green. No active revenge trade locks detected. You are free to execute trades according to your plan.
              </p>
              <div className="pt-2 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Session Fatigue</span>
                  <span className="text-[9px] font-bold uppercase text-bull">Low (12%)</span>
                </div>
                <Progress value={12} className="h-1 mt-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Rule Configuration Sliders */}
          <Card className="shadow-sm border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Threshold Fine-Tuning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Max Loss Streak</label>
                  <span className="text-xs font-bold text-primary">{rules.maxLossStreak} Trades</span>
                </div>
                <Slider 
                  value={[rules.maxLossStreak]} 
                  min={1} 
                  max={5} 
                  step={1} 
                  onValueChange={(val) => setRules({...rules, maxLossStreak: val[0]})} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Cooling Period</label>
                  <span className="text-xs font-bold text-primary">{rules.coolingPeriod} Mins</span>
                </div>
                <Slider 
                  value={[rules.coolingPeriod]} 
                  min={5} 
                  max={60} 
                  step={5} 
                  onValueChange={(val) => setRules({...rules, coolingPeriod: val[0]})} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Loss Pattern History */}
          <Card className="shadow-sm border-gold/10 overflow-hidden bg-gradient-to-br from-gold/[0.02] to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                Session Pattern History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-gold/5">
                  <span className="text-[10px] font-bold text-muted-foreground">CONSECUTIVE LOSSES</span>
                  <span className="text-xs font-extrabold text-bear">2</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-gold/5">
                  <span className="text-[10px] font-bold text-muted-foreground">RE-ENTRY SPEED</span>
                  <span className="text-xs font-extrabold text-gold">FAST (12m)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-gold/5">
                  <span className="text-[10px] font-bold text-muted-foreground">QTY SCALING</span>
                  <span className="text-xs font-extrabold text-bear">3.0x</span>
                </div>
              </div>
              <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "Observation: You are re-entering trades 3x faster after a loss compared to your winners. This is a classic revenge indicator."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
