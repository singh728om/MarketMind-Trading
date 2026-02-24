"use client";

import React, { useState } from 'react';
import { 
  Check, 
  CreditCard, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  History, 
  ArrowRight, 
  Star, 
  Crown,
  Lock,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { 
  useFirebase, 
  useUser, 
  useDoc, 
  useMemoFirebase,
  setDocumentNonBlocking 
} from '@/firebase';
import { doc } from 'firebase/firestore';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for retail beginners learning the ropes.',
    features: [
      '10 AI Signals per day',
      'Basic Trade Journal',
      'NSE/BSE Daily Brief',
      'Standard Risk Guardian',
      'Community Support'
    ],
    icon: Star,
    color: 'bg-muted',
    text: 'text-muted-foreground'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 4999,
    description: 'For active traders who need an intelligent edge.',
    features: [
      'Unlimited AI Signals',
      'Real-time F&O Intelligence',
      'AI Trading Coach Analysis',
      'Advanced Revenge Shield',
      '7-Day Free Trial included'
    ],
    icon: Zap,
    color: 'bg-primary/10',
    text: 'text-primary',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29999,
    description: 'The ultimate institutional-grade AI engine.',
    features: [
      'Multi-Agent Algo Orchestrator',
      'Backtester Pro Simulation',
      'Priority Gemini 1.5 Pro Access',
      'Institutional Flow (FII/DII) Heat',
      'Dedicated Quant Manager'
    ],
    icon: Crown,
    color: 'bg-gold/10',
    text: 'text-gold'
  }
];

export default function BillingPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;

  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch User Profile for current plan
  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  const { data: profile } = useDoc(userRef);

  const handleUpgrade = (plan: any) => {
    setCheckoutPlan(plan);
  };

  const handleConfirmPayment = async () => {
    if (!firestore || !userId || !checkoutPlan) return;
    
    setIsProcessing(true);
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    setDocumentNonBlocking(userRef!, {
      plan: checkoutPlan.name,
      trialEndsAt: trialEndsAt.toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setCheckoutPlan(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Billing & Subscription</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-bull" />
              Secure Billing • Stripe & Razorpay Integrated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Plan</p>
            <Badge className="bg-primary shadow-purple font-bold uppercase text-[10px] mt-1 px-3">
              {profile?.plan || 'Free'} Tier
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "relative flex flex-col border-2 transition-all duration-300",
              plan.popular ? "border-primary shadow-xl scale-105 z-10" : "border-border shadow-sm hover:border-primary/30",
              profile?.plan === plan.name ? "bg-primary/5" : "bg-card"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white font-bold px-4 py-1 rounded-full shadow-lg border-none">
                  MOST POPULAR
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pt-8">
              <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center", plan.color)}>
                <plan.icon className={cn("w-6 h-6", plan.text)} />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">₹{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground font-bold">/mo</span>
                </div>
                {plan.price > 0 && (
                  <p className="text-[10px] font-bold text-bull uppercase tracking-widest mt-2">7-Day Free Trial Available</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pt-6">
              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-4 w-4 rounded-full bg-bull/10 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-bull" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pb-8 pt-4">
              <Button 
                className={cn(
                  "w-full h-12 font-bold gap-2",
                  plan.popular ? "shadow-purple" : ""
                )}
                variant={profile?.plan === plan.name ? "outline" : "default"}
                disabled={profile?.plan === plan.name || (profile?.plan === 'Pro' && plan.id !== 'pro')}
                onClick={() => handleUpgrade(plan)}
              >
                {profile?.plan === plan.name ? "CURRENT PLAN" : plan.price === 0 ? "GET STARTED" : "UPGRADE NOW"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Subscription Status & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">Billing History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-left">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold uppercase">INV-2024-001</td>
                      <td className="px-6 py-4 text-muted-foreground">Mar 12, 2024</td>
                      <td className="px-6 py-4">Plus Monthly</td>
                      <td className="px-6 py-4 font-bold">₹4,999.00</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-bull/10 text-bull border-none text-[9px] font-bold">PAID</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold uppercase">INV-2024-002</td>
                      <td className="px-6 py-4 text-muted-foreground">Feb 12, 2024</td>
                      <td className="px-6 py-4">Plus Monthly</td>
                      <td className="px-6 py-4 font-bold">₹4,999.00</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-bull/10 text-bull border-none text-[9px] font-bold">PAID</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Trial Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Trial Period</span>
                  <span className="text-primary">
                    {profile?.trialEndsAt ? "Active" : "Not Started"}
                  </span>
                </div>
                <Progress value={profile?.trialEndsAt ? 100 : 0} className="h-1.5" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                {profile?.trialEndsAt 
                  ? `Your trial period ends on ${new Date(profile.trialEndsAt).toLocaleDateString()}. You will be automatically charged if trial is not cancelled.`
                  : "Start any paid plan today and get full institutional AI access free for 7 days. Cancel anytime."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-gold/5 to-transparent border-gold/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gold/10">
                <div className="p-2 bg-muted/20 rounded-lg">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-tighter">Visa Ending in 4242</p>
                  <p className="text-[9px] text-muted-foreground">Expires 12/26</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase">EDIT</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={() => !isProcessing && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Your Upgrade</DialogTitle>
            <DialogDescription>
              Confirming your subscription to the **{checkoutPlan?.name}** plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>{checkoutPlan?.name} Monthly</span>
                <span>₹{checkoutPlan?.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-bull font-bold">
                <span>7-Day Free Trial</span>
                <span>- ₹{checkoutPlan?.price.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-dashed flex justify-between items-center text-base font-black">
                <span>Due Today</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground leading-relaxed text-center italic">
                By clicking confirm, you agree to our Terms of Service. Your card will be charged ₹{checkoutPlan?.price.toLocaleString()} monthly starting 7 days from now.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutPlan(null)} disabled={isProcessing}>CANCEL</Button>
            <Button onClick={handleConfirmPayment} disabled={isProcessing} className="gap-2 bg-primary shadow-purple min-w-[140px]">
              {isProcessing ? (
                <History className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isProcessing ? "SECURELY PAYING..." : "CONFIRM & UPGRADE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
