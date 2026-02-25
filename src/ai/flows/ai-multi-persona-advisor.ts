'use server';
/**
 * @fileOverview A Genkit flow for the Multi-Persona AI Advisor.
 * It provides a "panel of experts" analysis for any stock symbol.
 *
 * - aiMultiPersonaAdvisor - The main function to trigger the analysis.
 * - AiAdvisorInput - The input type for the analysis.
 * - AiAdvisorOutput - The return type for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiAdvisorInputSchema = z.object({
  symbol: z.string().describe('The stock or index symbol to analyze (e.g., RELIANCE, NIFTY).'),
  timeframe: z.enum(['Intraday', 'Swing', 'Positional']).default('Intraday'),
});
export type AiAdvisorInput = z.infer<typeof AiAdvisorInputSchema>;

const AiAdvisorOutputSchema = z.object({
  consensus: z.object({
    bias: z.enum(['Strong Buy', 'Buy', 'Neutral', 'Sell', 'Strong Sell']),
    score: z.number().min(0).max(100).describe('0-100 score of conviction.'),
    narrative: z.string(),
  }),
  analysts: z.array(z.object({
    name: z.string(),
    role: z.string(),
    opinion: z.string(),
    keyFactor: z.string(),
    sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  })).min(1).describe('A list of expert opinions.'),
  tradePlan: z.object({
    entry: z.string(),
    target: z.string(),
    stoploss: z.string(),
    risk: z.string(),
  }),
});
export type AiAdvisorOutput = z.infer<typeof AiAdvisorOutputSchema>;

export async function aiMultiPersonaAdvisor(input: AiAdvisorInput): Promise<AiAdvisorOutput> {
  return aiMultiPersonaAdvisorFlow(input);
}

const aiAdvisorPrompt = ai.definePrompt({
  name: 'aiAdvisorPrompt',
  input: { 
    schema: AiAdvisorInputSchema.extend({
      rsi: z.number(),
      vix: z.number(),
      volumeIntensity: z.string(),
    }) 
  },
  output: { schema: AiAdvisorOutputSchema },
  prompt: `You are TheDigiOcean's Elite AI Advisor Panel. Analyze the symbol {{{symbol}}} for a {{{timeframe}}} horizon.

Market Context:
- RSI: {{rsi}}
- India VIX: {{vix}}
- Volume Intensity: {{{volumeIntensity}}}

Provide three distinct perspectives from your resident experts:
1. **The Quant Master**: Focus on numbers, RSI, Volatility, and Probabilities.
2. **The Sentiment Guru**: Focus on FII/DII data, News, and Market Psychology.
3. **The Trend Strategist**: Focus on Price Action, S/R levels, and Volume.

Then, provide a unified Consensus Bias and a detailed Trade Plan.

Output must be a valid JSON object conforming to the schema.`,
});

const aiMultiPersonaAdvisorFlow = ai.defineFlow(
  {
    name: 'aiMultiPersonaAdvisorFlow',
    inputSchema: AiAdvisorInputSchema,
    outputSchema: AiAdvisorOutputSchema,
  },
  async (input) => {
    // Inject realistic mock metrics for the prototype to avoid flaky tool calls
    const mockMetrics = {
      rsi: 58 + Math.random() * 10,
      vix: 13.4,
      volumeIntensity: '1.4x Avg'
    };

    const { output } = await aiAdvisorPrompt({
      ...input,
      ...mockMetrics
    });

    if (!output) throw new Error('AI Advisor failed to generate analysis.');
    return output;
  }
);
