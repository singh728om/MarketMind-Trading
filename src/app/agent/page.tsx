"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  BrainCircuit, 
  MessageSquare,
  History,
  Target,
  Activity,
  ArrowRight,
  Info,
  LineChart,
  BarChart3,
  RefreshCcw,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  useDoc, 
  useMemoFirebase 
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { aiTradingAgentConversationalAssistant, type AiTradingAgentInput, type AiTradingAgentOutput } from '@/ai/flows/ai-trading-agent-conversational-assistant';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: any;
  timestamp: string;
}

export default function AiAgentPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Digi, your AI Trading Agent. I'm connected to your live P&L and risk settings. How can I help you navigate the markets today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch User Context for the Agent
  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  const { data: profile } = useDoc(userRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    e?.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Call the Smart Agent Flow
      const result = await aiTradingAgentConversationalAssistant({
        userMessage: msg,
        livePnl: 2450, // Mock: Would normally be derived from active trades
        dailyLossLimit: 5000,
        riskProfile: (profile?.riskProfile as any) || 'Moderate',
        marketStatus: 'Open',
        lastTradeInfo: 'RELIANCE BUY @ 2950, P&L +₹1200'
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        suggestedAction: result.suggestedAction,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Agent Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What's the market outlook?",
    "NIFTY options strategy?",
    "Check my risk status",
    "Should I buy RELIANCE?"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary relative">
            <Bot className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-bull border-2 border-white rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Digi Smart Agent</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Gemini 1.5 Flash • Context-Aware Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agent Status</p>
            <div className="flex items-center gap-2 justify-end">
              <Badge className="bg-bull/10 text-bull border-bull/20 font-bold uppercase text-[10px]">Active & Guarding</Badge>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => setMessages(messages.slice(0, 1))}>
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Main Chat Window */}
        <Card className="lg:col-span-8 flex flex-col border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className="shrink-0 mt-1">
                    {msg.role === 'assistant' ? (
                      <MascotDigi expression="Coaching" size="sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {profile?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === 'assistant' 
                        ? "bg-white border border-primary/5 rounded-tl-none" 
                        : "bg-primary text-white rounded-tr-none"
                    )}>
                      {msg.content}
                    </div>
                    
                    {msg.suggestedAction && msg.suggestedAction.type !== 'none' && (
                      <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          Recommended Action: {msg.suggestedAction.type.replace('_', ' ').toUpperCase()}
                        </div>
                        <Button size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tight gap-1.5 shadow-purple">
                          EXECUTE NOW <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <p className={cn(
                      "text-[9px] font-bold text-muted-foreground uppercase tracking-widest",
                      msg.role === 'user' ? "text-right" : ""
                    )}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4 max-w-[80%]">
                  <MascotDigi expression="Thinking" size="sm" className="animate-pulse" />
                  <div className="bg-white/50 border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 pt-0 mt-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map(p => (
                <button 
                  key={p} 
                  className="text-[10px] font-bold px-3 py-1.5 bg-muted/50 text-muted-foreground border border-transparent hover:border-primary/20 hover:text-primary transition-all rounded-full"
                  onClick={() => handleSendMessage(undefined, p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="relative">
              <Input 
                placeholder="Ask Digi about market setups, F&O strikes, or risk..." 
                className="pr-24 h-14 rounded-2xl border-primary/10 shadow-lg text-sm bg-white focus:ring-primary/20"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="h-10 px-4 rounded-xl font-bold gap-2 shadow-purple"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">SEND</span>
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Intelligence Sidebars */}
        <div className="lg:col-span-4 space-y-6">
          {/* Real-time Brain Context */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Live Agent Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-primary/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Live P&L</p>
                  <p className="text-xs font-extrabold text-bull mt-0.5">+₹2,450</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-primary/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Risk Limit</p>
                  <p className="text-xs font-extrabold text-bear mt-0.5">₹5,000</p>
                </div>
              </div>
              <div className="p-3 bg-white/50 rounded-xl border border-primary/10 flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-gold" />
                <p className="text-[10px] font-medium leading-tight">
                  Digi is actively monitoring your session for <span className="font-bold text-gold">Revenge Patterns</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="shadow-sm border-gold/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Tools</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {[
                  { icon: Activity, label: 'Market Sentiment Analysis' },
                  { icon: Target, label: 'F&O Strike Finder' },
                  { icon: BarChart3, label: 'Stock Depth Analysis' },
                  { icon: History, label: 'Journal Pattern Scans' }
                ].map((tool, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg">
                    <tool.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground">{tool.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary shadow-purple border-none overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4 text-white">
                <div className="p-2 bg-white/20 rounded-full">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Pro Capability</p>
                  <h3 className="text-lg font-bold leading-tight">Conversational Algo Deployment</h3>
                </div>
                <p className="text-[10px] opacity-70 leading-relaxed">
                  "Digi, run a 5-minute breakout strategy on TCS with 50% capital." (Coming Soon)
                </p>
                <Button variant="secondary" className="w-full h-9 text-[10px] font-bold text-primary">
                  WHITELIST FOR BETA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
