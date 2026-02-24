
"use client";

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  useFirebase, 
  useUser, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function TradingJournal() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userId = user?.uid;
  const [searchTerm, setSearchTerm] = useState("");

  const tradesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'trades'),
      orderBy('openedAt', 'desc')
    );
  }, [firestore, userId]);

  const { data: trades, isLoading } = useCollection(tradesQuery);

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter(t => 
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.segment.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trades, searchTerm]);

  // Performance Calculations
  const stats = useMemo(() => {
    if (!trades) return { totalPnL: 0, winRate: 0, avgRR: 0, bestTrade: 0 };
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0);
    const totalPnL = closedTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    const bestTrade = Math.max(...closedTrades.map(t => t.pnl || 0), 0);
    
    return {
      totalPnL,
      winRate,
      avgRR: 2.4, // Simplified mock for demo
      bestTrade,
      count: closedTrades.length
    };
  }, [trades]);

  const handleExportCSV = () => {
    if (!trades || trades.length === 0) return;

    const headers = [
      "Date", "Symbol", "Segment", "Side", "Qty", "Entry", "Exit", "P&L", "P&L%", "Status", "Strategy", "Emotion"
    ];

    const csvContent = [
      headers.join(","),
      ...trades.map(t => [
        t.openedAt ? format(new Date(t.openedAt), 'yyyy-MM-dd HH:mm') : 'N/A',
        t.symbol,
        t.segment,
        t.side,
        t.qty,
        t.entryPrice,
        t.exitPrice || 'Open',
        t.pnl || 0,
        t.pnlPct || 0,
        t.status,
        t.strategyName || 'None',
        t.emotionTag || 'N/A'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `TradeJournal_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Trading Journal</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
              Syncing with NSE / BSE Active Sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 h-10 font-bold border-primary/20 text-primary hover:bg-primary/5"
            onClick={handleExportCSV}
            disabled={!trades || trades.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Excel (CSV)
          </Button>
        </div>
      </div>

      {/* Performance Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-bull/10 text-bull">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Net Realized P&L</p>
              <p className={cn("text-lg font-extrabold mono-font", stats.totalPnL >= 0 ? "text-bull" : "text-bear")}>
                ₹{stats.totalPnL.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Win Rate</p>
              <p className="text-lg font-extrabold mono-font">{stats.winRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gold/10 text-gold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg R:R Ratio</p>
              <p className="text-lg font-extrabold mono-font">1:{stats.avgRR}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Trades</p>
              <p className="text-lg font-extrabold mono-font">{stats.count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Journal Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Trade History</CardTitle>
              <CardDescription className="text-xs">Comprehensive log of every execution and its behavioral context</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search symbol or segment..." 
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase py-4">Date & Time</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Symbol</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Side</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Qty</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right">Entry</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right">Exit</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right">P&L (INR)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right">Risk %</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-center">Efficiency</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart3 className="w-6 h-6 animate-pulse" />
                        <span className="font-medium">Syncing Ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      No trades found in this session.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrades.map((trade) => {
                    const isWin = (trade.pnl || 0) > 0;
                    const accountRisk = 0.5; // Mock: logic would be (Entry - SL) * Qty / Capital
                    
                    return (
                      <TableRow key={trade.id} className="hover:bg-muted/10 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{trade.openedAt ? format(new Date(trade.openedAt), 'dd MMM') : '--'}</span>
                            <span className="text-[10px] text-muted-foreground">{trade.openedAt ? format(new Date(trade.openedAt), 'HH:mm') : '--'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase">{trade.symbol}</span>
                            <Badge variant="outline" className="text-[8px] font-bold h-4 px-1 border-primary/20 text-primary">{trade.segment}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px] font-bold px-2 py-0 h-5 border-none",
                            trade.side === 'BUY' ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                          )}>
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="mono-font text-xs font-bold">{trade.qty}</TableCell>
                        <TableCell className="text-right mono-font text-xs font-medium">₹{trade.entryPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right mono-font text-xs font-medium text-muted-foreground">
                          {trade.exitPrice ? `₹${trade.exitPrice.toFixed(2)}` : '--'}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right mono-font text-xs font-bold",
                          isWin ? "text-bull" : trade.status === 'OPEN' ? "text-muted-foreground" : "text-bear"
                        )}>
                          {trade.status === 'CLOSED' ? (isWin ? `+₹${trade.pnl}` : `₹${trade.pnl}`) : '--'}
                        </TableCell>
                        <TableCell className="text-right mono-font text-[10px] font-bold text-primary">
                          {accountRisk}%
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {trade.emotionTag === 'Disciplined' ? (
                              <Badge className="bg-bull/10 text-bull border-none text-[9px] font-bold">OPTIMAL</Badge>
                            ) : trade.revengeTradeFlag ? (
                              <Badge className="bg-bear/10 text-bear border-none text-[9px] font-bold">REVENGE</Badge>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground">--</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-bold h-5 px-2",
                            trade.status === 'OPEN' ? "border-gold text-gold bg-gold/5 animate-pulse" : "border-muted text-muted-foreground"
                          )}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trade Insights Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Behavioral Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground uppercase">Disciplined Executions</span>
              <span className="text-bull font-bold">82%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-bull" style={{ width: '82%' }} />
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              AI Insight: Your discipline score is 15% higher in the morning session compared to the closing hour.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-gold" />
              Journal Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span>Rule Adherence</span>
                <span className="text-gold">HIGH</span>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= 4 ? "bg-gold" : "bg-muted")} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                You followed your Stop-Loss rules in {stats.count - 1} out of {stats.count} trades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
