"use client";

import React, { useState } from 'react';
import { 
  Maximize2, 
  Columns, 
  Grid2X2, 
  Search, 
  Star, 
  TrendingUp,
  Activity,
  ChevronDown
} from 'lucide-react';
import { TradingViewChart } from '@/components/market/trading-view-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type LayoutMode = 'single' | 'split2' | 'split4';

export default function MarketPage() {
  const [layout, setLayout] = useState<LayoutMode>('single');
  const [primarySymbol, setPrimarySymbol] = useState('NIFTY');

  const symbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY'];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      {/* Market Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-3 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Symbol..." 
              className="pl-9 h-9 text-xs rounded-xl border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
            {symbols.map(s => (
              <Badge 
                key={s} 
                variant="outline" 
                className={cn(
                  "cursor-pointer hover:bg-primary/5 transition-colors whitespace-nowrap px-3 py-1",
                  primarySymbol === s ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
                )}
                onClick={() => setPrimarySymbol(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-l pl-4 border-muted">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2 hidden sm:block">Layout</p>
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1">
            <Button 
              size="sm" 
              variant={layout === 'single' ? 'default' : 'ghost'} 
              className="h-8 w-8 p-0 rounded-lg shadow-none"
              onClick={() => setLayout('single')}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={layout === 'split2' ? 'default' : 'ghost'} 
              className="h-8 w-8 p-0 rounded-lg shadow-none"
              onClick={() => setLayout('split2')}
            >
              <Columns className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={layout === 'split4' ? 'default' : 'ghost'} 
              className="h-8 w-8 p-0 rounded-lg shadow-none"
              onClick={() => setLayout('split4')}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={cn(
        "flex-1 grid gap-4 transition-all duration-300",
        layout === 'single' ? "grid-cols-1" : 
        layout === 'split2' ? "grid-cols-1 lg:grid-cols-2" : 
        "grid-cols-1 md:grid-cols-2"
      )}>
        {layout === 'single' && (
          <TradingViewChart symbol={primarySymbol} />
        )}

        {layout === 'split2' && (
          <>
            <TradingViewChart symbol={primarySymbol} />
            <TradingViewChart symbol="BANKNIFTY" />
          </>
        )}

        {layout === 'split4' && (
          <>
            <TradingViewChart symbol={primarySymbol} />
            <TradingViewChart symbol="BANKNIFTY" />
            <TradingViewChart symbol="RELIANCE" />
            <TradingViewChart symbol="HDFCBANK" />
          </>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="flex items-center gap-6 px-4 py-2 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Activity className="w-3 h-3 text-bull" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">PCR (Nifty):</span>
          <span className="mono-font text-xs font-bold text-bull">1.28</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <TrendingUp className="w-3 h-3 text-bear" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">VIX:</span>
          <span className="mono-font text-xs font-bold text-bear">13.42 (-0.56%)</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Star className="w-3 h-3 text-gold" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Max Pain:</span>
          <span className="mono-font text-xs font-bold">22,400</span>
        </div>
      </div>
    </div>
  );
}
