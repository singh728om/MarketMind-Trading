'use server';
/**
 * @fileOverview This file implements a Genkit flow for the AI Trading Coach.
 * It analyzes a trader's past performance and behavioral data to generate a
 * narrative report and suggest personalized rules for improved discipline.
 *
 * - aiTradingCoachBehavioralAnalysis - The main function to trigger the analysis.
 * - AITradingCoachBehavioralAnalysisInput - The input type for the analysis.
 * - AITradingCoachBehavioralAnalysisOutput - The return type for the analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TradeJournalEntrySchema = z.object({
  symbol: z.string().describe('The stock or instrument symbol.'),
  side: z.enum(['BUY', 'SELL']).describe('The side of the trade (BUY or SELL).'),
  qty: z.number().int().describe('Quantity traded.'),
  entryPrice: z.number().describe('Entry price of the trade.'),
  exitPrice: z.number().optional().describe('Exit price of the trade.'),
  pnl: z.number().describe('Profit or Loss for the trade in INR.'),
  pnlPct: z.number().describe('Profit or Loss for the trade as a percentage.'),
  openedAt: z.string().datetime().describe('Timestamp when the trade was opened.'),
  closedAt: z.string().datetime().optional().describe('Timestamp when the trade was closed.'),
  emotionTag: z.enum(['Disciplined', 'FOMO', 'Revenge', 'Greed', 'Overconfident', 'Patient', 'Fear', 'None']).optional().describe('Self-assigned emotion tag for the trade.'),
  followedRules: z.enum(['Yes', 'Partially', 'No']).optional().describe('Whether rules were followed for this trade.'),
  strategy: z.string().optional().describe('The strategy used for this trade.'),
}).describe('A single historical trade journal entry.');

const AITradingCoachBehavioralAnalysisInputSchema = z.object({
  tradeJournalEntries: z.array(TradeJournalEntrySchema).describe('A list of historical trade journal entries for analysis. Max 10 entries are typically considered for prompt context.'),
  pnlByTimeOfDaySummary: z.string().describe('A summary of profit/loss patterns by time of day (e.g., "Often profitable in mornings, losses in afternoon").'),
  emotionVsOutcomeSummary: z.string().describe('A summary of how different emotions correlated with trade outcomes (e.g., "FOMO trades resulted in average -5% loss").'),
  ruleAdherenceSummary: z.string().describe('A summary of the trader\'s rule adherence (e.g., "Followed rules 70% of the time, often breaking exit rules after a loss").'),
  currentRiskProfile: z.enum(['Conservative', 'Moderate', 'Aggressive']).describe('The trader\'s self-declared risk profile.'),
  last30DaysPerformanceSummary: z.string().describe('A summary of overall trading performance in the last 30 days (e.g., "Total PnL +X, Y winning trades, Z losing trades").'),
}).describe('Input data for the AI Trading Coach behavioral analysis.');
export type AITradingCoachBehavioralAnalysisInput = z.infer<typeof AITradingCoachBehavioralAnalysisInputSchema>;

const AITradingCoachBehavioralAnalysisOutputSchema = z.object({
  narrativeReport: z.string().describe('A detailed narrative report from the AI trading coach, identifying behavioral patterns, strengths, weaknesses, and insights.'),
  suggestedRules: z.array(z.string()).describe('A list of personalized suggested rules to improve trading discipline and profitability.'),
}).describe('Output from the AI Trading Coach behavioral analysis.');
export type AITradingCoachBehavioralAnalysisOutput = z.infer<typeof AITradingCoachBehavioralAnalysisOutputSchema>;

export async function aiTradingCoachBehavioralAnalysis(input: AITradingCoachBehavioralAnalysisInput): Promise<AITradingCoachBehavioralAnalysisOutput> {
  return aiTradingCoachBehavioralAnalysisFlow(input);
}

const aiTradingCoachBehavioralAnalysisPrompt = ai.definePrompt({
  name: 'aiTradingCoachBehavioralAnalysisPrompt',
  input: {schema: AITradingCoachBehavioralAnalysisInputSchema},
  output: {schema: AITradingCoachBehavioralAnalysisOutputSchema},
  prompt: `You are an expert AI Trading Coach named Gemini, specializing in behavioral finance and psychology for Indian stock market traders. Your goal is to analyze the provided trading data, identify key behavioral patterns, provide actionable insights, and suggest personalized rules to help the trader improve discipline and profitability.

Analyze the following information about the trader's historical performance and behavior:

Trader's Risk Profile: {{{currentRiskProfile}}}
Last 30 Days Performance Summary: {{{last30DaysPerformanceSummary}}}
Profit & Loss by Time of Day Summary: {{{pnlByTimeOfDaySummary}}}
Emotion vs. Outcome Summary: {{{emotionVsOutcomeSummary}}}
Rule Adherence Summary: {{{ruleAdherenceSummary}}}

Here are some of the trader's recent or significant trade journal entries for a deeper understanding (up to 10 entries for context, ensure this list is concise and representative):
{{#each tradeJournalEntries}}
  - Trade on {{openedAt}}: Symbol {{symbol}}, {{side}} {{qty}} shares/lots, Entry: {{entryPrice}}, Exit: {{exitPrice}}, P&L: {{pnl}} ({{pnlPct}}%), Emotion: {{emotionTag}}, Rules Followed: {{followedRules}}, Strategy: {{strategy}}
{{/each}}
{{#unless tradeJournalEntries}}
  No detailed trade entries provided for context.
{{/unless}}

Based on this data, provide a comprehensive narrative report and a list of specific, actionable rules.

**Narrative Report Requirements:**
1.  **Strengths:** Identify positive trading habits or areas of strong performance.
2.  **Weaknesses/Patterns:** Clearly identify negative behavioral patterns like revenge trading, FOMO, greed, overtrading, ignoring signals, or deviating from rules. Provide examples or reference points from the summaries.
3.  **Impact:** Explain the financial and psychological impact of these patterns.
4.  **Key Insights:** Offer data-backed insights, similar to the examples from the app proposal (e.g., "you recover better when you stop at this point", "win rate drops on Mondays", "avoid option buying when VIX > 17").
5.  **Tone:** Empathetic, objective, and coaching-oriented.

**Suggested Rules Requirements:**
1.  Provide a list of 3-5 concrete, personalized rules.
2.  Each rule should directly address a weakness identified in the narrative report.
3.  Rules should be actionable and specific.
4.  Consider the trader's \`currentRiskProfile\` when suggesting rules.
5.  Examples: "No trading Monday 9:15-10:00 AM", "Max 3 F&O trades per day", "No option buying when VIX > 17", "Lock profits when daily P&L > ₹X".

Return the response in the specified JSON format.`,
});

const aiTradingCoachBehavioralAnalysisFlow = ai.defineFlow(
  {
    name: 'aiTradingCoachBehavioralAnalysisFlow',
    inputSchema: AITradingCoachBehavioralAnalysisInputSchema,
    outputSchema: AITradingCoachBehavioralAnalysisOutputSchema,
  },
  async (input) => {
    // Before passing to the prompt, ensure tradeJournalEntries is not excessively large.
    // The prompt already states "up to 10 entries for context", so we can slice it here if needed.
    const limitedTradeEntries = input.tradeJournalEntries.slice(0, 10);

    const {output} = await aiTradingCoachBehavioralAnalysisPrompt({
      ...input,
      tradeJournalEntries: limitedTradeEntries, // Pass the limited entries
    });

    if (!output) {
      throw new Error('AI Trading Coach failed to generate a response.');
    }
    return output;
  }
);
