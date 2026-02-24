"use client";

import React, { useState } from 'react';
import { 
  Maximize2, 
  Columns, 
  Grid2X2, 
  Search, 
  TrendingUp,
  Activity,
  Expand,
  Minimize
} from 'lucide-react';
import { TradingViewChart } from '@/components/market/trading-view-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type LayoutMode = 'single' | 'split2' | 'split4';

export default function MarketPage() {
  const [layout, setLayout] = useState<LayoutMode>('single');
  const [primarySymbol, setPrimarySymbol] = useState('NIFTY');
  const [isFullView, setIsFullView] = useState(true); // Default to full view for pro feel

  const symbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY'];

  return (
    <div className={cn(
      "flex flex-col transition-all duration-300 overflow-hidden",
      isFullView ? "h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8" : "h-[calc(100vh-10rem)] space-y-4"
    )}>
      {/* Market Toolbar */}
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-4 bg-card border-b shadow-sm z-10 px-4 py-2",
        !isFullView && "rounded-2xl border mx-4 mt-4"
      )}>
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-8 h-8 text-[11px] rounded-lg border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {symbols.map(s => (
              <Badge 
                key={s} 
                variant="outline" 
                className={cn(
                  "cursor-pointer hover:bg-primary/5 transition-colors whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold",
                  primarySymbol === s ? "border-primary text-primary bg-primary/5" : "text-muted-foreground border-transparent"
                )}
                onClick={() => setPrimarySymbol(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button 
              size="sm" 
              variant={layout === 'single' ? 'default' : 'ghost'} 
              className="h-7 w-7 p-0 rounded-md shadow-none"
              onClick={() => setLayout('single')}
              title="Single Chart"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant={layout === 'split2' ? 'default' : 'ghost'} 
              className="h-7 w-7 p-0 rounded-md shadow-none"
              onClick={() => setLayout('split2')}
              title="2-Chart Split"
            >
              <Columns className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant={layout === 'split4' ? 'default' : 'ghost'} 
              className="h-7 w-7 p-0 rounded-md shadow-none"
              onClick={() => setLayout('split4')}
              title="4-Chart Grid"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            onClick={() => setIsFullView(!isFullView)}
          >
            {isFullView ? <Minimize className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            {isFullView ? 'Standard' : 'Full View'}
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={cn(
        "flex-1 grid gap-px bg-border transition-all duration-300 overflow-hidden",
        layout === 'single' ? "grid-cols-1" : 
        layout === 'split2' ? "grid-cols-1 lg:grid-cols-2" : 
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
      )}>
        {layout === 'single' && (
          <div className="h-full w-full bg-background">
            <TradingViewChart symbol={primarySymbol} hideBorder />
          </div>
        )}

        {layout === 'split2' && (
          <>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol={primarySymbol} hideBorder />
            </div>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol="BANKNIFTY" hideBorder />
            </div>
          </>
        )}

        {layout === 'split4' && (
          <>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol={primarySymbol} hideBorder />
            </div>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol="BANKNIFTY" hideBorder />
            </div>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol="RELIANCE" hideBorder />
            </div>
            <div className="h-full w-full bg-background">
              <TradingViewChart symbol="HDFCBANK" hideBorder />
            </div>
          </>
        )}
      </div>

      {/* Ticker Footer (Compact Terminal Style) */}
      <div className="flex items-center justify-between gap-6 px-4 py-1.5 bg-background border-t overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Activity className="w-3 h-3 text-bull" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">PCR (NIFTY):</span>
            <span className="mono-font text-[11px] font-bold text-bull">1.28</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
            <TrendingUp className="w-3 h-3 text-bear" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">INDIA VIX:</span>
            <span className="mono-font text-[11px] font-bold text-bear">13.42 (-0.56%)</span>
            </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">NIFTY</span>
                <span className="mono-font text-[11px] font-bold text-bull">22,450.30</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">BANKNIFTY</span>
                <span className="mono-font text-[11px] font-bold text-bear">48,230.00</span>
             </div>
        </div>
      </div>
    </div>
  );
}
