'use server';
/**
 * @fileOverview A Genkit flow for the AI Smart Screener.
 * It allows users to find stocks using natural language queries.
 *
 * - runSmartScreener - The main function to trigger the screen.
 * - SmartScreenerInput - The input type for the screening query.
 * - SmartScreenerOutput - The return type for the screened results.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartScreenerInputSchema = z.object({
  query: z.string().describe('The natural language screening criteria (e.g., "Stocks with RSI < 30 and FII buying").'),
  segment: z.enum(['Large Cap', 'Mid Cap', 'Small Cap', 'All']).default('All'),
  sector: z.string().optional().describe('Filter by specific sector.'),
});
export type SmartScreenerInput = z.infer<typeof SmartScreenerInputSchema>;

const ScreenedStockSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  confidence: z.number().min(0).max(100),
  matchReason: z.string().describe('Why this stock matches the user query.'),
  technicalVibe: z.enum(['Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish']),
  institutionalActivity: z.string().describe('Recent FII/DII activity for this stock.'),
});

const SmartScreenerOutputSchema = z.object({
  totalFound: z.number(),
  marketRegime: z.string(),
  results: z.array(ScreenedStockSchema),
  digiObservation: z.string().describe('A high-level summary observation from the AI.'),
});
export type SmartScreenerOutput = z.infer<typeof SmartScreenerOutputSchema>;

export async function runSmartScreener(input: SmartScreenerInput): Promise<SmartScreenerOutput> {
  return smartScreenerFlow(input);
}

const smartScreenerPrompt = ai.definePrompt({
  name: 'smartScreenerPrompt',
  input: { schema: SmartScreenerInputSchema },
  output: { schema: SmartScreenerOutputSchema },
  prompt: `You are TheDigiOcean's High-Frequency Screening Engine.
The user wants to find stocks based on this criteria: "{{{query}}}"
Segment: {{{segment}}}
{{#if sector}} Sector: {{{sector}}} {{/if}}

Identify 5-8 high-fidelity matches from the Indian stock market (NSE/BSE).
For each match, provide realistic mock data for price and change based on current market trends.
Explain clearly WHY each stock matches the natural language query.
Assess institutional activity (FII/DII) and provide a "Technical Vibe".

Output must be a valid JSON object conforming to the schema.`,
});

const smartScreenerFlow = ai.defineFlow(
  {
    name: 'smartScreenerFlow',
    inputSchema: SmartScreenerInputSchema,
    outputSchema: SmartScreenerOutputSchema,
  },
  async (input) => {
    const { output } = await smartScreenerPrompt(input);
    if (!output) throw new Error('Smart Screener failed to generate results.');
    return output;
  }
);
