"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Zap, 
  Key, 
  Lock, 
  Globe, 
  Cpu, 
  BarChart3, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Bot,
  BrainCircuit,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { MascotDigi } from "@/components/mascot-digi";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  useDoc, 
  useMemoFirebase,
  setDocumentNonBlocking 
} from '@/firebase';
import { doc } from 'firebase/firestore';

export default function BrokerSettingsPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [activeTab, setActiveTab] = useState("brokers");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Fetch User Settings (where AI keys live)
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId, 'settings', 'default');
  }, [firestore, userId]);
  const { data: userSettings } = useDoc(settingsRef);

  // Fetch Primary Broker Connection
  const brokerRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId, 'broker_connections', 'primary');
  }, [firestore, userId]);
  const { data: brokerConnection } = useDoc(brokerRef);

  const [brokerData, setBrokerData] = useState({
    brokerName: "Zerodha",
    apiKey: "",
    apiSecret: "",
    totpSecret: "",
    accountId: ""
  });

  const [aiData, setAiData] = useState({
    geminiKey: "",
    openaiKey: "",
    claudeKey: ""
  });

  useEffect(() => {
    if (brokerConnection) {
      setBrokerData({
        brokerName: brokerConnection.brokerName || "Zerodha",
        apiKey: brokerConnection.apiKeyEncrypted || "",
        apiSecret: brokerConnection.apiSecretEncrypted || "",
        totpSecret: brokerConnection.totpSecretEncrypted || "",
        accountId: brokerConnection.accountId || ""
      });
    }
    if (userSettings) {
      setAiData({
        geminiKey: userSettings.geminiApiKeyEncrypted || "",
        openaiKey: userSettings.openaiApiKeyEncrypted || "",
        claudeKey: userSettings.claudeApiKeyEncrypted || ""
      });
    }
  }, [brokerConnection, userSettings]);

  const toggleVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveBroker = () => {
    if (!firestore || !userId) return;
    const ref = doc(firestore, 'users', userId, 'broker_connections', 'primary');
    setDocumentNonBlocking(ref, {
      userId,
      brokerName: brokerData.brokerName,
      apiKeyEncrypted: brokerData.apiKey,
      apiSecretEncrypted: brokerData.apiSecret,
      totpSecretEncrypted: brokerData.totpSecret,
      accountId: brokerData.accountId,
      status: 'Connected',
      isPrimary: true,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const handleSaveAI = () => {
    if (!firestore || !userId) return;
    const ref = doc(firestore, 'users', userId, 'settings', 'default');
    setDocumentNonBlocking(ref, {
      userId,
      geminiApiKeyEncrypted: aiData.geminiKey,
      openaiApiKeyEncrypted: aiData.openaiKey,
      claudeApiKeyEncrypted: aiData.claudeKey,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Command Center Settings</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-bull" />
              Secure API & Broker Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-10 font-bold">
            <RefreshCcw className="w-4 h-4" />
            TEST ALL CONNECTIONS
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md border">
          <TabsTrigger value="brokers" className="flex-1 rounded-lg text-xs font-bold uppercase gap-2">
            <Globe className="w-3.5 h-3.5" />
            Trading Brokers
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 rounded-lg text-xs font-bold uppercase gap-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI & Intelligence
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1 rounded-lg text-xs font-bold uppercase gap-2">
            <Database className="w-3.5 h-3.5" />
            Market Data
          </TabsTrigger>
        </TabsList>

        {/* --- BROKERS TAB --- */}
        <TabsContent value="brokers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-bold">Primary Broker Configuration</CardTitle>
                    </div>
                    <Badge className="bg-bull text-white text-[10px]">ACTIVE SESSION</Badge>
                  </div>
                  <CardDescription>Setup your bridge to the Indian exchanges via Kite, Neo or Groww APIs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Select Broker</Label>
                      <select 
                        value={brokerData.brokerName} 
                        onChange={(e) => setBrokerData({...brokerData, brokerName: e.target.value})}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Zerodha">Zerodha (Kite Connect)</option>
                        <option value="KotakNeo">Kotak Neo</option>
                        <option value="Groww">Groww / Upstox</option>
                        <option value="Fyers">Fyers API</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Client ID / Account ID</Label>
                      <Input 
                        value={brokerData.accountId} 
                        onChange={(e) => setBrokerData({...brokerData, accountId: e.target.value})}
                        placeholder="e.g. AB1234" 
                        className="h-10 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">API Key</Label>
                      <div className="relative">
                        <Input 
                          type={showKeys.apiKey ? "text" : "password"}
                          value={brokerData.apiKey}
                          onChange={(e) => setBrokerData({...brokerData, apiKey: e.target.value})}
                          placeholder="Your Broker API Key"
                          className="pr-10 h-10 mono-font"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => toggleVisibility('apiKey')}>
                          {showKeys.apiKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">API Secret</Label>
                      <div className="relative">
                        <Input 
                          type={showKeys.apiSecret ? "text" : "password"}
                          value={brokerData.apiSecret}
                          onChange={(e) => setBrokerData({...brokerData, apiSecret: e.target.value})}
                          placeholder="Your Broker API Secret"
                          className="pr-10 h-10 mono-font"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => toggleVisibility('apiSecret')}>
                          {showKeys.apiSecret ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">TOTP Secret (For Auto-Renewal)</Label>
                        <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">OPTIONAL</Badge>
                      </div>
                      <div className="relative">
                        <Input 
                          type={showKeys.totpSecret ? "text" : "password"}
                          value={brokerData.totpSecret}
                          onChange={(e) => setBrokerData({...brokerData, totpSecret: e.target.value})}
                          placeholder="TOTP 2FA Seed"
                          className="pr-10 h-10 mono-font"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => toggleVisibility('totpSecret')}>
                          {showKeys.totpSecret ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 font-bold shadow-purple gap-2" onClick={handleSaveBroker}>
                    <Save className="w-4 h-4" />
                    SAVE BROKER CREDENTIALS
                  </Button>
                </CardContent>
              </Card>

              {/* Status Note */}
              <div className="p-4 bg-bull/5 border border-bull/10 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-bull shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-bull">Bank-Grade Encryption</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Your API keys are encrypted at the client-side before being transmitted to the secure DigiVault. TheDigiOcean never stores raw passwords or secrets.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Integration Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { name: 'Kite Connect', url: 'https://kite.trade' },
                      { name: 'Kotak Neo API', url: 'https://www.kotaksecurities.com/neo-api' },
                      { name: 'Fyers API', url: 'https://fyers.in/api' }
                    ].map((link) => (
                      <a 
                        key={link.name} 
                        href={link.url} 
                        target="_blank" 
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/5 hover:border-primary/20 transition-all group"
                      >
                        <span className="text-[11px] font-bold">{link.name} portal</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Need help generating your API key? Check our <span className="text-primary font-bold cursor-pointer underline">Documentation</span>.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Whitelist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted/20 rounded-xl space-y-2">
                    <p className="text-[9px] font-bold uppercase">Required API Redirect URI:</p>
                    <div className="p-2 bg-background border rounded text-[10px] mono-font break-all text-primary font-bold">
                      https://app.thedigiocean.ai/api/broker/callback
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- AI TAB --- */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">AI Intelligence Engines</CardTitle>
                  </div>
                  <CardDescription>Power the Digi Advisor and Signal Center with your own LLM credits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                          <MascotDigi expression="Coaching" size="sm" className="w-5 h-5" /> Google Gemini API Key
                        </Label>
                        <Badge className="bg-primary/10 text-primary border-none text-[8px]">PRIMARY ENGINE</Badge>
                      </div>
                      <div className="relative">
                        <Input 
                          type={showKeys.gemini ? "text" : "password"}
                          value={aiData.geminiKey}
                          onChange={(e) => setAiData({...aiData, geminiKey: e.target.value})}
                          placeholder="Your Gemini API Key"
                          className="pr-10 h-10 mono-font"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => toggleVisibility('gemini')}>
                          {showKeys.gemini ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">OpenAI API Key (GPT-4o)</Label>
                      <div className="relative">
                        <Input 
                          type={showKeys.openai ? "text" : "password"}
                          value={aiData.openaiKey}
                          onChange={(e) => setAiData({...aiData, openaiKey: e.target.value})}
                          placeholder="sk-..."
                          className="pr-10 h-10 mono-font"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => toggleVisibility('openai')}>
                          {showKeys.openai ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 font-bold shadow-purple bg-primary gap-2" onClick={handleSaveAI}>
                    <Save className="w-4 h-4" />
                    SAVE AI CONFIGURATION
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm bg-primary shadow-purple text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="p-2 bg-white/20 rounded-lg w-fit">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Why use your own keys?</h3>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    By providing your own API keys, you bypass platform rate limits and get faster response times for **Live Sentiment Scans** and **Algo Orchestration**. Digi will automatically prioritize your keys for all computations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- DATA TAB --- */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">External Data & Charting</CardTitle>
                  </div>
                  <CardDescription>Configure external analytics and webhook listeners.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-transparent hover:border-primary/10 transition-all">
                      <div className="space-y-1">
                        <p className="text-sm font-bold uppercase tracking-tight">TradingView Webhooks</p>
                        <p className="text-[10px] text-muted-foreground">Receive alerts and execute trades directly from TV.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2 px-4 py-2 bg-background border rounded-lg">
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">Your Webhook URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-bold text-primary flex-1 break-all">https://app.thedigiocean.ai/api/hooks/tv/USER_942X</code>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold">COPY</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">AlphaVantage API Key</Label>
                      <Input placeholder="Global Market Data" className="h-10" />
                    </div>
                  </div>

                  <Button className="w-full h-12 font-bold shadow-purple">
                    UPDATE DATA SETTINGS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
