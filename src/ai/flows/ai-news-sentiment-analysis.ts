'use server';
/**
 * @fileOverview A Genkit flow for analyzing market news headlines and social sentiment.
 * It provides an "Impact Probability" score for each headline.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsSentimentInputSchema = z.object({
  headlines: z.array(z.string()).describe('A list of recent market headlines.'),
  focusSymbol: z.string().optional().describe('An optional symbol to focus the sentiment on.'),
});

export type NewsSentimentInput = z.infer<typeof NewsSentimentInputSchema>;

const SentimentItemSchema = z.object({
  headline: z.string(),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  impactProbability: z.number().min(0).max(100).describe('Probability that this news will move the price significantly.'),
  reasoning: z.string(),
  sectorsAffected: z.array(z.string()),
});

const NewsSentimentOutputSchema = z.object({
  overallMarketSentiment: z.number().min(0).max(100).describe('0-100 score, 0 is Extreme Fear, 100 is Extreme Greed.'),
  summaryNarrative: z.string(),
  analyzedItems: z.array(SentimentItemSchema),
  globalDrivers: z.array(z.string()).describe('Major global factors impacting the sentiment (e.g. US Fed, Oil Prices).'),
});

export type NewsSentimentOutput = z.infer<typeof NewsSentimentOutputSchema>;

export async function analyzeNewsSentiment(input: NewsSentimentInput): Promise<NewsSentimentOutput> {
  return aiNewsSentimentFlow(input);
}

const aiNewsSentimentPrompt = ai.definePrompt({
  name: 'aiNewsSentimentPrompt',
  input: { schema: NewsSentimentInputSchema },
  output: { schema: NewsSentimentOutputSchema },
  prompt: `You are TheDigiOcean's Sentiment Engine. Analyze the following market news headlines and determine the overall market sentiment.

Headlines:
{{#each headlines}}
- {{{this}}}
{{/each}}

{{#if focusSymbol}}
Specifically focus on how this news affects the symbol: {{{focusSymbol}}}.
{{/if}}

For each headline, determine if it is Bullish, Bearish, or Neutral. Calculate an "Impact Probability" (0-100) based on historical sensitivity of the Indian market to such news.
Provide a summary narrative of the current "Market Vibe" and list major global drivers.

Output must be a valid JSON object conforming to the schema.`,
});

const aiNewsSentimentFlow = ai.defineFlow(
  {
    name: 'aiNewsSentimentFlow',
    inputSchema: NewsSentimentInputSchema,
    outputSchema: NewsSentimentOutputSchema,
  },
  async (input) => {
    const { output } = await aiNewsSentimentPrompt(input);
    if (!output) throw new Error('Sentiment analysis failed.');
    return output;
  }
);
