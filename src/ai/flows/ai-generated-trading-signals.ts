'use server';
/**
 * @fileOverview A Genkit flow that generates AI-powered trading signals for equities and F&O.
 *
 * - generateTradingSignals - A function that fetches AI-generated trading signals.
 * - AIGeneratedTradingSignalsInput - The input type for the generateTradingSignals function.
 * - AIGeneratedTradingSignalsOutput - The return type for the generateTradingSignals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIGeneratedTradingSignalsInputSchema = z.object({
  segment: z
    .enum(['Equity', 'F&O', 'All'])
    .default('All')
    .describe('The market segment to generate signals for (Equity, F&O, or All).'),
  timeframe: z
    .enum(['Intraday', 'Swing', 'Positional'])
    .default('Intraday')
    .describe('The trading timeframe for the signals (Intraday, Swing, or Positional).'),
  focus: z
    .string()
    .optional()
    .describe('A specific focus for the signals, e.g., "breakout stocks" or "NIFTY options".'),
});

export type AIGeneratedTradingSignalsInput = z.infer<
  typeof AIGeneratedTradingSignalsInputSchema
>;

const AIGeneratedTradingSignalsOutputSchema = z.object({
  signals: z
    .array(
      z.object({
        symbol: z.string().describe('The trading symbol (e.g., NIFTY, RELIANCE).'),
        segment: z.enum(['Equity', 'F&O']).describe('The market segment for the signal.'),
        direction: z.enum(['BUY', 'SELL']).describe('The recommended trading direction.'),
        confidence: z.number().min(0).max(100).describe('Confidence score for the signal (0-100).'),
        entryPrice: z.number().describe('The recommended entry price.'),
        targetPrices: z.array(z.number()).min(1).max(3).describe('An array of up to three target prices (T1, T2, T3).'),
        stopLossPrice: z.number().describe('The recommended stop-loss price.'),
        riskRewardRatio: z.string().describe('The risk-reward ratio (e.g., "1:2.5").'),
        signalType: z.string().describe('The type of signal (e.g., Breakout, VWAP, Bull Call Spread).'),
        timeframe: z
          .enum(['Intraday', 'Swing', 'Positional'])
          .describe('The trading timeframe for the signal.'),
        geminiReasoning: z
          .string()
          .describe(
            'A brief explanation of the signal based on multi-factor analysis (e.g., technicals, FII/DII, option chain, news sentiment).'
          ),
        multiFactorBasis: z
          .array(z.string())
          .describe(
            'An array of factors contributing to the signal (e.g., "Technical", "FII Buying", "Option Chain", "News Sentiment").'
          ),
      })
    )
    .describe('An array of AI-generated trading signals.'),
});

export type AIGeneratedTradingSignalsOutput = z.infer<
  typeof AIGeneratedTradingSignalsOutputSchema
>;

export async function generateTradingSignals(
  input: AIGeneratedTradingSignalsInput
): Promise<AIGeneratedTradingSignalsOutput> {
  return aiGeneratedTradingSignalsFlow(input);
}

const aiGeneratedTradingSignalsPrompt = ai.definePrompt({
  name: 'aiGeneratedTradingSignalsPrompt',
  input: { schema: AIGeneratedTradingSignalsInputSchema },
  output: { schema: AIGeneratedTradingSignalsOutputSchema },
  prompt: `You are an expert Indian stock market trading analyst. Generate real-time trading signals for the Indian market.
Focus on {{{timeframe}}} trades for the {{{segment}}} segment.

{{#if focus}} The user is specifically looking for: {{{focus}}}. {{/if}}

Provide a list of high-probability trading opportunities. For each signal, include the symbol, segment, direction (BUY/SELL), a confidence score (0-100), entry price, up to three target prices (T1, T2, T3), a stop-loss price, a brief Gemini reasoning, a risk-reward ratio, the signal type, timeframe, and the multi-factor basis for the signal. The reasoning should explain why the signal is generated based on technicals, FII/DII data, option chain analysis, and/or news sentiment.

Output must be a JSON object conforming to the following schema:
`,
});

const aiGeneratedTradingSignalsFlow = ai.defineFlow(
  {
    name: 'aiGeneratedTradingSignalsFlow',
    inputSchema: AIGeneratedTradingSignalsInputSchema,
    outputSchema: AIGeneratedTradingSignalsOutputSchema,
  },
  async (input) => {
    const { output } = await aiGeneratedTradingSignalsPrompt(input);
    return output!;
  }
);
