"use client";

import React, { useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  hideBorder?: boolean;
}

/**
 * TradingView Advanced Charting Widget
 * Optimized for Indian Markets (NSE) and Terminal-style UI.
 */
export function TradingViewChart({ 
  symbol = "NIFTY", 
  theme = "light",
  autosize = true,
  hideBorder = false
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const chartId = useId().replace(/:/g, "");

  useEffect(() => {
    // Clean up previous script if any
    if (container.current) {
      container.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Ensure symbols are strictly formatted for Indian Exchanges to avoid redirection alerts
    // For NIFTY and BANKNIFTY, NSE: prefix is the standard for free embeds
    const formattedSymbol = symbol.includes(':') ? symbol : `NSE:${symbol}`;

    const config = {
      "autosize": autosize,
      "symbol": formattedSymbol,
      "interval": "5",
      "timezone": "Asia/Kolkata",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "container_id": `tv_chart_${chartId}`,
      "allow_symbol_change": true,
      "calendar": false,
      "hide_side_toolbar": false,
      "withdateranges": true,
      "details": false,
      "hotlist": false,
      "calendar_event": false,
      "show_popup_button": false, // Suppress popup buttons
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(config);

    if (container.current) {
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
        "tradingview-widget-container h-full w-full overflow-hidden bg-background",
        !hideBorder && "border border-border rounded-xl shadow-sm"
      )} 
      ref={container}
    >
      <div id={`tv_chart_${chartId}`} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}
