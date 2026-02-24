"use client";

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Standard TradingView Advanced Charting Widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": autosize,
      "symbol": `NSE:${symbol}`,
      "interval": "5",
      "timezone": "Asia/Kolkata",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "container_id": `tv_chart_${Math.random().toString(36).substr(2, 9)}`
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
  }, [symbol, theme, autosize]);

  return (
    <div 
      className={cn(
        "tradingview-widget-container h-full w-full overflow-hidden",
        !hideBorder && "border border-border rounded-xl shadow-sm"
      )} 
      ref={container}
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}
