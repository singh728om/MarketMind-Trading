"use client";

import React, { useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  hideBorder?: boolean;
}

export function TradingViewChart({ 
  symbol = "NIFTY", 
  theme = "light",
  autosize = true,
  hideBorder = false
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const chartId = useId().replace(/:/g, ""); // Stable ID for this component instance

  useEffect(() => {
    // Standard TradingView Advanced Charting Widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Ensure the symbol has the correct exchange prefix
    const formattedSymbol = symbol.includes(':') ? symbol : `NSE:${symbol}`;

    script.innerHTML = JSON.stringify({
      "autosize": autosize,
      "symbol": formattedSymbol,
      "interval": "5",
      "timezone": "Asia/Kolkata",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "container_id": `tv_chart_${chartId}`
    });

    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, theme, autosize, chartId]);

  return (
    <div 
      className={cn(
        "tradingview-widget-container h-full w-full overflow-hidden",
        !hideBorder && "border border-border rounded-xl shadow-sm"
      )} 
      ref={container}
    >
      <div id={`tv_chart_${chartId}`} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}
