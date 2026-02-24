'use server';
/**
 * @fileOverview A Genkit flow for analyzing backtest results.
 * It provides an AI-driven critique of a strategy's historical performance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BacktestAnalysisInputSchema = z.object({
  strategyName: z.string(),
  totalPnL: z.number(),
  winRate: z.number(),
  maxDrawdown: z.number(),
  sharpeRatio: z.number(),
  tradesCount: z.number(),
  marketRegime: z.string().describe('The primary market condition during backtest (e.g. Bullish, Volatile).'),
});

export type BacktestAnalysisInput = z.infer<typeof BacktestAnalysisInputSchema>;

const BacktestAnalysisOutputSchema = z.object({
  critique: z.string().describe('A detailed narrative analysis of the backtest results.'),
  riskOfOverfitting: z.enum(['Low', 'Moderate', 'High', 'Extreme']),
  marketSuitability: z.string().describe('Which live market conditions this strategy is best for.'),
  suggestedOptimizations: z.array(z.string()),
});

export type BacktestAnalysisOutput = z.infer<typeof BacktestAnalysisOutputSchema>;

export async function analyzeBacktestResults(input: BacktestAnalysisInput): Promise<BacktestAnalysisOutput> {
  return backtestAnalysisFlow(input);
}

const backtestAnalysisPrompt = ai.definePrompt({
  name: 'backtestAnalysisPrompt',
  input: { schema: BacktestAnalysisInputSchema },
  output: { schema: BacktestAnalysisOutputSchema },
  prompt: `You are TheDigiOcean's Senior Quant Strategist. Analyze the following backtest results for the strategy "{{{strategyName}}}":

Performance Stats:
- Total P&L: ₹{{{totalPnL}}}
- Win Rate: {{{winRate}}}%
- Max Drawdown: {{{maxDrawdown}}}%
- Sharpe Ratio: {{{sharpeRatio}}}
- Total Trades: {{{tradesCount}}}
- Market Context: {{{marketRegime}}}

Provide a professional critique. Be skeptical of high win rates or low drawdowns, looking for signs of overfitting or lack of statistical significance. Suggest specific optimizations for the Indian market context (NSE/BSE).

Output must be a valid JSON object conforming to the schema.`,
});

const backtestAnalysisFlow = ai.defineFlow(
  {
    name: 'backtestAnalysisFlow',
    inputSchema: BacktestAnalysisInputSchema,
    outputSchema: BacktestAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await backtestAnalysisPrompt(input);
    if (!output) throw new Error('Backtest analysis failed.');
    return output;
  }
);
