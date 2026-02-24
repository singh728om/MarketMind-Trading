"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, TrendingUp, Monitor, Zap, Sparkles, Navigation, 
  ShieldAlert, BookOpen, UserCircle, Briefcase, FileText, 
  Settings, CreditCard, PieChart, Activity, Globe,
  ShieldCheck, AlertTriangle, HelpCircle, LogOut, Search,
  ChevronRight, BrainCircuit, Bot, Radio, Boxes, History
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

const navItems = [
  {
    label: "TRADING",
    items: [
      { label: "Dashboard", icon: Home, href: "/dashboard" },
      { label: "Live Market", icon: Globe, href: "/market" },
      { label: "Terminal", icon: Monitor, href: "/terminal" },
      { label: "Intraday Cockpit", icon: Zap, href: "/intraday" },
      { label: "F&O Intelligence", icon: Sparkles, href: "/fno" },
      { label: "Swing & Positional", icon: Navigation, href: "/swing" },
    ]
  },
  {
    label: "AI BRAIN",
    items: [
      { label: "AI Advisor", icon: BrainCircuit, href: "/ai-advisor" },
      { label: "AI Trading Agent", icon: Bot, href: "/agent" },
      { label: "Signal Center", icon: Radio, href: "/signals" },
      { label: "Smart Screener", icon: Search, href: "/screener" },
      { label: "Algo Builder", icon: Boxes, href: "/algo" },
      { label: "Backtester", icon: History, href: "/backtest" },
    ]
  },
  {
    label: "PROTECTION",
    items: [
      { label: "Risk Guardian", icon: ShieldCheck, href: "/risk-guardian" },
      { label: "Revenge Shield", icon: AlertTriangle, href: "/revenge-shield" },
      { label: "Trade Journal", icon: BookOpen, href: "/journal" },
      { label: "AI Trading Coach", icon: HelpCircle, href: "/coach" },
    ]
  },
  {
    label: "MARKET INTEL",
    items: [
      { label: "FII / DII Tracker", icon: Briefcase, href: "/fii-dii" },
      { label: "News & Sentiment", icon: FileText, href: "/news" },
      { label: "Market Pulse", icon: Activity, href: "/pulse" },
    ]
  },
  {
    label: "OFFICE & ACCOUNT",
    items: [
      { label: "Portfolio X-Ray", icon: PieChart, href: "/portfolio" },
      { label: "Broker Settings", icon: Settings, href: "/settings/brokers" },
      { label: "Billing & Plans", icon: CreditCard, href: "/billing" },
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="https://picsum.photos/seed/user-sidebar/40/40" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold truncate">Ajay Kumar</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-gold/10 text-gold border-gold/20">PRO PLAN</Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navItems.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200",
                        pathname === item.href ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {idx < navItems.length - 1 && <SidebarSeparator className="my-2 opacity-30" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-tight">Upgrade Your Game</p>
          <p className="text-[11px] text-muted-foreground leading-tight mb-3">Unlock Live Algo Trading with Pro access.</p>
          <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary-dark text-white text-[11px] h-8 font-bold shadow-purple">
            Get Pro Access <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton className="text-bear hover:bg-bear/10 hover:text-bear">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Button({ className, ...props }: any) {
  return <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", className)} {...props} />;
}
