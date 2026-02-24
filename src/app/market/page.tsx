"use client";

import React, { useState, useCallback } from 'react';
import { 
  Maximize2, 
  Columns, 
  Grid2X2, 
  Search, 
  TrendingUp,
  Activity,
  Expand,
  Minimize,
  Settings2
} from 'lucide-react';
import { TradingViewChart } from '@/components/market/trading-view-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LayoutMode = 'single' | 'split2' | 'split4';

const AVAILABLE_SYMBOLS = [
  { label: 'NIFTY 50', value: 'NIFTY' },
  { label: 'BANK NIFTY', value: 'BANKNIFTY' },
  { label: 'FIN NIFTY', value: 'FINNIFTY' },
  { label: 'RELIANCE', value: 'RELIANCE' },
  { label: 'HDFC BANK', value: 'HDFCBANK' },
  { label: 'ICICI BANK', value: 'ICICIBANK' },
  { label: 'TCS', value: 'TCS' },
  { label: 'INFY', value: 'INFY' },
  { label: 'ADANI ENT', value: 'ADANIENT' },
  { label: 'TATA MOTORS', value: 'TATAMOTORS' },
];

// Moving sub-component outside to prevent remounting on parent state change
const ChartWindow = React.memo(({ 
  index, 
  symbol, 
  onSymbolChange 
}: { 
  index: number, 
  symbol: string, 
  onSymbolChange: (index: number, val: string) => void 
}) => (
  <div className="relative h-full w-full bg-background flex flex-col group">
    <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <Select 
          value={symbol} 
          onValueChange={(val) => onSymbolChange(index, val)}
        >
          <SelectTrigger className="h-7 w-32 bg-background/80 backdrop-blur-sm border-none shadow-sm text-[10px] font-bold uppercase focus:ring-1 focus:ring-primary/30">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_SYMBOLS.map(s => (
              <SelectItem key={s.value} value={s.value} className="text-[10px] font-bold">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-none text-[9px] font-bold text-muted-foreground px-1.5 py-0">
          5m • NSE
        </Badge>
      </div>
      <div className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-background">
          <Settings2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
    <div className="flex-1">
      <TradingViewChart symbol={symbol} hideBorder />
    </div>
  </div>
));

ChartWindow.displayName = "ChartWindow";

export default function MarketPage() {
  const [layout, setLayout] = useState<LayoutMode>('single');
  const [isFullView, setIsFullView] = useState(true);
  
  const [chartSymbols, setChartSymbols] = useState<string[]>([
    'NIFTY',
    'BANKNIFTY',
    'RELIANCE',
    'HDFCBANK'
  ]);

  const updateChartSymbol = useCallback((index: number, newSymbol: string) => {
    setChartSymbols(prev => {
      const next = [...prev];
      next[index] = newSymbol;
      return next;
    });
  }, []);

  return (
    <div className={cn(
      "flex flex-col transition-all duration-300 overflow-hidden",
      isFullView ? "h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8" : "h-[calc(100vh-10rem)] space-y-4"
    )}>
      {/* Market Toolbar */}
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-4 bg-card border-b shadow-sm z-30 px-4 py-2",
        !isFullView && "rounded-2xl border mx-4 mt-4"
      )}>
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Quick Search..." 
              className="pl-8 h-8 text-[11px] rounded-lg border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] font-bold text-bull border-bull/20 bg-bull/5 uppercase tracking-tighter">
              Nifty @ 22,450
            </Badge>
            <Badge variant="outline" className="text-[9px] font-bold text-bear border-bear/20 bg-bear/5 uppercase tracking-tighter">
              VIX @ 13.4
            </Badge>
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
          <ChartWindow 
            index={0} 
            symbol={chartSymbols[0]} 
            onSymbolChange={updateChartSymbol} 
          />
        )}

        {layout === 'split2' && (
          <>
            <ChartWindow 
              index={0} 
              symbol={chartSymbols[0]} 
              onSymbolChange={updateChartSymbol} 
            />
            <ChartWindow 
              index={1} 
              symbol={chartSymbols[1]} 
              onSymbolChange={updateChartSymbol} 
            />
          </>
        )}

        {layout === 'split4' && (
          <>
            <ChartWindow index={0} symbol={chartSymbols[0]} onSymbolChange={updateChartSymbol} />
            <ChartWindow index={1} symbol={chartSymbols[1]} onSymbolChange={updateChartSymbol} />
            <ChartWindow index={2} symbol={chartSymbols[2]} onSymbolChange={updateChartSymbol} />
            <ChartWindow index={3} symbol={chartSymbols[3]} onSymbolChange={updateChartSymbol} />
          </>
        )}
      </div>

      {/* Ticker Footer */}
      <div className="flex items-center justify-between gap-6 px-4 py-1.5 bg-background border-t overflow-x-auto no-scrollbar z-30">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Activity className="w-3 h-3 text-bull" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">PCR:</span>
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
