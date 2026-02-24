'use server';
/**
 * @fileOverview A Genkit flow for recommending F&O strategies and strike prices.
 *
 * - fnoStrategyRecommendation - A function that handles the F&O strategy recommendation process.
 * - FnoStrategyRecommendationInput - The input type for the fnoStrategyRecommendation function.
 * - FnoStrategyRecommendationOutput - The return type for the fnoStrategyRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FnoStrategyRecommendationInputSchema = z.object({
  index: z.string().describe('The stock market index (e.g., "NIFTY", "BANK NIFTY").'),
  expiry: z.string().describe('The expiry date for the options (e.g., "18 Jan 2025").'),
  currentMarketPrice: z.number().describe('The current market price of the index.'),
  vix: z.number().describe('The India VIX value.'),
  pcr: z.number().describe('The Put-Call Ratio.'),
  maxPain: z.number().describe('The Max Pain level for the index options.'),
  fiiDiiInterpretation: z
    .string()
    .describe(
      'A summarized interpretation of FII/DII data, e.g., "FIIs were net long in index futures for 3 days, indicating bullish sentiment."'
    ),
  optionsChainSummary: z
    .string()
    .describe(
      'A summarized key observations from the options chain, e.g., "Max CE OI at 22600, Max PE OI at 22400. ATM CE 85, PE 70. Significant OI buildup near 22500 CE."'
    ),
  technicalAnalysisSummary: z
    .string()
    .describe('Key technical indicators and their bias, e.g., "Supertrend is BULLISH, RSI is at 58, indicating moderate strength."'),
  newsSentimentSummary: z
    .string()
    .describe('Overall market news sentiment, e.g., "Neutral to slightly positive based on recent economic data."'),
});
export type FnoStrategyRecommendationInput = z.infer<typeof FnoStrategyRecommendationInputSchema>;

const StrategyLegSchema = z.object({
  type: z.enum(['BUY', 'SELL']).describe('Type of order: BUY or SELL.'),
  instrument: z.enum(['CE', 'PE']).describe('Option instrument type: Call (CE) or Put (PE).'),
  strike: z.number().describe('The strike price of the option.'),
  premium: z.number().describe('The premium price of the option at the time of recommendation.'),
});

const RecommendedStrategySchema = z.object({
  name: z.string().describe('Name of the strategy (e.g., "Bull Call Spread", "Short Iron Condor").'),
  description: z.string().describe('A brief, concise description of what the strategy entails.'),
  legs: z.array(StrategyLegSchema).describe('List of individual option trades (legs) forming the strategy.'),
  netPremium: z.number().describe('Net premium received (positive for credit) or paid (negative for debit) for the strategy.'),
  maxProfit: z.number().optional().describe('Maximum potential profit from the strategy.'),
  maxLoss: z.number().optional().describe('Maximum potential loss from the strategy.'),
  breakevenPoints: z.array(z.number()).describe('An array of breakeven point(s) for the strategy.'),
  probabilityOfProfit: z.number().describe('The estimated probability of the strategy ending in profit (0-100%).'),
  riskRewardRatio: z.string().describe('The Risk:Reward ratio, formatted as "Risk:Reward" (e.g., "1:2.4").'),
  payoffChartDescription: z
    .string()
    .describe(
      'A textual description of the strategy\'s payoff profile at expiry. Describe the shape and key points of the payoff diagram.'
    ),
});

const FnoStrategyRecommendationOutputSchema = z.object({
  marketBias: z
    .string()
    .describe('Overall market bias for the index (e.g., "MILDLY BULLISH", "BEARISH", "RANGE-BOUND").'),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe('Confidence level for the market bias as a percentage (0-100%).'),
  topRecommendedStrategies: z.array(RecommendedStrategySchema).describe('A list of top recommended F&O strategies.'),
  strikesToAvoid: z
    .array(
      z.object({
        strike: z.number().describe('The strike price to avoid.'),
        instrument: z.enum(['CE', 'PE']).optional().describe('The instrument type (CE/PE) if applicable.'),
        reason: z.string().describe('The reason why this strike should be avoided.'),
      })
    )
    .describe('A list of specific strike prices or types of strategies to avoid and the reasons why.'),
  geminiReasoning: z
    .string()
    .describe(
      'A detailed narrative from Gemini AI explaining the overall market outlook, the rationale behind the recommended strategies, and how the various data points contributed to the analysis.'
    ),
  dataInputsUsed: z
    .array(z.string())
    .describe(
      'A list of the key data inputs (e.g., "Live Options Chain OI data", "FII/DII derivatives data", "India VIX") that were primarily used for this analysis.'
    ),
});
export type FnoStrategyRecommendationOutput = z.infer<typeof FnoStrategyRecommendationOutputSchema>;

export async function fnoStrategyRecommendation(
  input: FnoStrategyRecommendationInput
): Promise<FnoStrategyRecommendationOutput> {
  return fnoStrategyRecommendationFlow(input);
}

const fnoStrategyRecommendationPrompt = ai.definePrompt({
  name: 'fnoStrategyRecommendationPrompt',
  input: {schema: FnoStrategyRecommendationInputSchema},
  output: {schema: FnoStrategyRecommendationOutputSchema},
  prompt: `You are an expert F&O analyst for the Indian stock market. Your task is to analyze the provided market data and recommend specific F&O strategies and strike prices for the given index and expiry. Provide detailed reasoning, including market bias, confidence, and risk/reward ratios.\n\nCurrent Index: {{{index}}}\nExpiry: {{{expiry}}}\nGenerated: {{time}} IST\n\nMarket Data:\n- Current Market Price (CMP): {{{currentMarketPrice}}}\n- India VIX: {{{vix}}}\n- Put-Call Ratio (PCR): {{{pcr}}}\n- Max Pain: {{{maxPain}}}\n- FII/DII Interpretation: {{{fiiDiiInterpretation}}}\n- Options Chain Summary: {{{optionsChainSummary}}}\n- Technical Analysis Summary: {{{technicalAnalysisSummary}}}\n- News Sentiment Summary: {{{newsSentimentSummary}}}\n\nBased on this data, provide your expert F&O strategy recommendation. Ensure your response is a valid JSON object matching the provided schema, including detailed reasoning for each recommendation and the overall market outlook. Explicitly list the data inputs you used for the analysis.\n`,
});

const fnoStrategyRecommendationFlow = ai.defineFlow(
  {
    name: 'fnoStrategyRecommendationFlow',
    inputSchema: FnoStrategyRecommendationInputSchema,
    outputSchema: FnoStrategyRecommendationOutputSchema,
  },
  async input => {
    // Helper to get current time for the prompt
    const currentTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata', // IST
    });

    const {output} = await fnoStrategyRecommendationPrompt({
      ...input,
      time: currentTime, // Inject current time into the prompt context
    });
    return output!;
  }
);
