'use server';
/**
 * @fileOverview A Genkit flow for discovering Swing and Positional trade setups.
 * It focuses on "Institutional Shadowing" and fundamental catalysts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SwingPositionalInputSchema = z.object({
  timeframe: z.enum(['Swing', 'Positional']).default('Swing'),
  riskProfile: z.enum(['Conservative', 'Moderate', 'Aggressive']).default('Moderate'),
});

export type SwingPositionalInput = z.infer<typeof SwingPositionalInputSchema>;

const SetupSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  entryZone: z.string(),
  targets: z.array(z.string()),
  stoploss: z.string(),
  horizon: z.string().describe('Expected duration (e.g. 2-4 weeks).'),
  conviction: z.number().min(0).max(100),
  institutionalHeat: z.enum(['Low', 'Medium', 'High', 'Intense']),
  technicalSetup: z.string().describe('The chart pattern (e.g. Rounding Bottom, Breakout).'),
  fundamentalCatalyst: z.string().describe('The underlying reason (e.g. Earnings Growth, Capex).'),
});

const SwingPositionalOutputSchema = z.object({
  marketRegime: z.string(),
  recommendations: z.array(SetupSchema),
  digiTip: z.string(),
});

export type SwingPositionalOutput = z.infer<typeof SwingPositionalOutputSchema>;

export async function getSwingPositionalSetups(input: SwingPositionalInput): Promise<SwingPositionalOutput> {
  return swingPositionalFlow(input);
}

const swingPositionalPrompt = ai.definePrompt({
  name: 'swingPositionalPrompt',
  input: { schema: SwingPositionalInputSchema },
  output: { schema: SwingPositionalOutputSchema },
  prompt: `You are TheDigiOcean's Institutional Strategist. Generate high-conviction {{{timeframe}}} setups for the Indian stock market.
User Risk Profile: {{{riskProfile}}}

Identify stocks where technical patterns align with fundamental catalysts and "Institutional Heat" (FII/DII accumulation).
For each setup, provide an Entry Zone, Targets, Stoploss, and a clear Horizon.

Focus on stocks with liquid daily volumes.

Output must be a valid JSON object conforming to the schema.`,
});

const swingPositionalFlow = ai.defineFlow(
  {
    name: 'swingPositionalFlow',
    inputSchema: SwingPositionalInputSchema,
    outputSchema: SwingPositionalOutputSchema,
  },
  async (input) => {
    const { output } = await swingPositionalPrompt(input);
    if (!output) throw new Error('Swing discovery failed.');
    return output;
  }
);
