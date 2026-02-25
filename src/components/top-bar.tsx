"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Bell, 
  CreditCard, 
  ChevronDown, 
  User, 
  Check, 
  Target, 
  Trophy,
  Wallet,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useFirebase, 
  useUser, 
  useDoc, 
  setDocumentNonBlocking, 
  useMemoFirebase,
  initiateAnonymousSignIn 
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const indices = [
  { name: 'NIFTY 50', value: '22,450.30', change: '+125.40', pct: '+0.56%', trend: 'up' },
  { name: 'SENSEX', value: '74,119.00', change: '+380.20', pct: '+0.51%', trend: 'up' },
  { name: 'BANK NIFTY', value: '48,230.00', change: '-95.00', pct: '-0.19%', trend: 'down' },
  { name: 'NIFTY IT', value: '38,450.00', change: '+220.00', pct: '+0.57%', trend: 'up' },
  { name: 'INDIA VIX', value: '13.42', change: '-0.80', pct: '-0.56%', trend: 'down' },
  { name: 'NIFTY MID', value: '45,210.00', change: '+180.00', pct: '+0.40%', trend: 'up' },
];

export function TopBar() {
  const [time, setTime] = useState<Date | null>(null);
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const userId = user?.uid;

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile } = useDoc(userRef);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFundsOpen, setIsFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    experienceLevel: "Beginner",
    riskProfile: "Moderate"
  });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      setFormData({
        name: userProfile?.name || "",
        experienceLevel: userProfile?.experienceLevel || "Beginner",
        riskProfile: userProfile?.riskProfile || "Moderate"
      });
    }
  }, [userProfile, isProfileOpen]);

  const handleUpdateProfile = () => {
    if (!firestore || !userId) return;
    const displayName = formData.name.trim() || user?.email?.split('@')[0] || "Trader";
    
    setDocumentNonBlocking(userRef!, {
      ...formData,
      name: displayName,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setIsProfileOpen(false);
  };

  const handleUpdateFunds = (type: 'add' | 'withdraw') => {
    if (!firestore || !userId || !fundAmount) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount)) return;

    const currentMargin = userProfile?.availableMargin || 0;
    const newMargin = type === 'add' ? currentMargin + amount : currentMargin - amount;

    if (type === 'withdraw' && newMargin < 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "You cannot withdraw more than your available margin."
      });
      return;
    }

    setDocumentNonBlocking(userRef!, {
      availableMargin: newMargin,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: type === 'add' ? "Funds Added" : "Withdrawal Initiated",
      description: `₹${amount.toLocaleString()} has been ${type === 'add' ? 'credited to' : 'debited from'} your wallet.`
    });

    setIsFundsOpen(false);
    setFundAmount("");
  };

  return (
    <header className="fixed top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-primary" />
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow-purple transition-transform group-hover:scale-110">D</div>
          <span className="text-xl font-headline font-bold text-primary hidden md:block">TheDigiOcean</span>
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-bull/10 text-bull rounded-pill text-xs font-medium border border-bull/20">
          <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
          Market Open
        </div>
      </div>

      <div className="flex-1 mx-8 overflow-hidden hidden lg:block">
        <div className="flex items-center gap-8 animate-scroll-left whitespace-nowrap py-1">
          {indices.map((idx, i) => (
            <div key={i} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors">
              <span className="text-xs font-bold text-muted-foreground">{idx.name}</span>
              <span className="mono-font text-sm font-semibold">{idx.value}</span>
              <span className={cn(
                "mono-font text-xs",
                idx.trend === 'up' ? "text-bull" : "text-bear"
              )}>
                {idx.trend === 'up' ? '▲' : '▼'} {idx.change} ({idx.pct})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2 text-bull font-semibold text-xs bg-bull/10 px-2 py-1 rounded-pill border border-bull/20">
            <Shield className="w-3 h-3" />
            Protected
          </div>
          <span className="mono-font text-[10px] text-muted-foreground mt-0.5">
            {time ? time.toLocaleTimeString('en-IN', { hour12: true }) : '--:--:--'} IST
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-full relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-bear rounded-full" />
          </button>
          
          {/* Funds & Wallet Display */}
          <Dialog open={isFundsOpen} onOpenChange={setIsFundsOpen}>
            <DialogTrigger asChild>
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/10 cursor-pointer hover:bg-primary/20 transition-all group">
                <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold uppercase opacity-70 leading-none">Avail. Funds</span>
                  <span className="mono-font text-xs font-black">
                    ₹{(userProfile?.availableMargin || 842000000).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Manage Trading Funds
                </DialogTitle>
                <DialogDescription>Add or withdraw capital from your DigiVault.</DialogDescription>
              </DialogHeader>
              
              <div className="py-6 space-y-6">
                <div className="p-4 bg-muted/30 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Balance</p>
                  <p className="text-3xl font-black mono-font text-primary">
                    ₹{(userProfile?.availableMargin || 842000000).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Amount (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-7 h-12 text-lg font-bold mono-font" 
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleUpdateFunds('add')}
                      className="h-12 gap-2 bg-bull hover:bg-bull/90 font-bold shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      ADD FUNDS
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleUpdateFunds('withdraw')}
                      className="h-12 gap-2 border-bear/20 text-bear hover:bg-bear/5 font-bold"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      WITHDRAW
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-primary/5 rounded-xl border border-dashed flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Instant deposits via **UPI & Netbanking**. Withdrawals are processed within 24 hours to your linked primary bank account.
                  </p>
                </div>
              </div>
              
              <DialogFooter className="border-t pt-4">
                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase gap-2 h-8">
                  <History className="w-3.5 h-3.5" />
                  View Transaction Ledger
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center gap-2 pl-2 border-l border-muted cursor-pointer hover:bg-muted p-1 rounded-lg transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${userId || 'default'}/32/32`} />
                  <AvatarFallback>{userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-xs font-bold leading-none">{userProfile?.name || 'Guest Trader'}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{userProfile?.plan || 'Free Plan'}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Edit Profile
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Trophy className="w-3 h-3" /> Experience
                    </Label>
                    <Select 
                      value={formData.experienceLevel} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, experienceLevel: val }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Experienced">Experienced</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3 h-3" /> Risk Profile
                    </Label>
                    <Select 
                      value={formData.riskProfile} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, riskProfile: val }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conservative">Conservative</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-muted-foreground leading-relaxed">
                  Digi AI uses your profile data to customize trade suggestions and risk warnings. Ensure your risk profile matches your actual appetite.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateProfile} className="gap-2 bg-primary shadow-purple">
                  <Check className="w-4 h-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
