'use server';
/**
 * @fileOverview A Genkit flow for the AI Risk Guardian to detect and intervene in revenge trading patterns.
 *
 * - revengeTradePrevention - A function that handles the revenge trade detection and intervention process.
 * - RevengeTradePreventionInput - The input type for the revengeTradePrevention function.
 * - RevengeTradePreventionOutput - The return type for the revengeTradePrevention function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema definition
const RevengeTradePreventionInputSchema = z.object({
  dailyPnl: z.number().describe('Current daily Profit and Loss. Negative for loss.'),
  dailyPnlLimit: z.number().describe('Configured daily loss limit. This is a negative number, e.g., -5000.'),
  tradesToday: z.number().describe('Number of trades executed today.'),
  maxTradesPerDay: z.number().describe('Maximum allowed trades per day.'),
  lastLossTimestamp: z.number().nullable().describe('Timestamp of the last losing trade, in milliseconds.'),
  nextOrderTimestamp: z.number().nullable().describe('Timestamp of the next intended order, in milliseconds.'),
  averageQty: z.number().describe('User\'s average trade quantity.'),
  currentOrderQty: z.number().describe('Quantity of the current intended order.'),
  lastTwoTradesOutcome: z.array(z.enum(['win', 'loss', 'neutral'])).max(2).describe('Outcomes of the last two trades.'),
  normalTradingHoursStart: z.string().describe('User\'s normal trading hours start (HH:MM format, 24-hour).'),
  normalTradingHoursEnd: z.string().describe('User\'s normal trading hours end (HH:MM format, 24-hour).'),
  currentTimestamp: z.number().describe('Current timestamp in milliseconds.'),
  lastLossStockSymbol: z.string().nullable().describe('Symbol of the stock in the last losing trade.'),
  currentTradeStockSymbol: z.string().nullable().describe('Symbol of the stock for the current intended trade.'),
  consecutiveLosses: z.number().describe('Number of consecutive losses within the last 30 minutes.'),
  aiStrategyRecommendation: z.enum(['BUY', 'SELL', 'HOLD']).nullable().describe('AI strategy recommendation for the current trade.'),
  userAction: z.enum(['BUY', 'SELL']).nullable().describe('User\'s intended trade action.'),
  tradeFrequencyInLast2Hours: z.number().describe('Number of trades in the last 2 hours.'),
  dailyAverageTradeFrequency: z.number().describe('User\'s daily average trade frequency.'),
  currentFnoLotSize: z.number().nullable().describe('Current F&O lot size if applicable.'),
  averageFnoLotSize: z.number().nullable().describe('User\'s average F&O lot size.'),
});
export type RevengeTradePreventionInput = z.infer<typeof RevengeTradePreventionInputSchema>;

// Output schema definition
const RevengeTradePreventionOutputSchema = z.object({
  revengeProbability: z.number().min(0).max(100).describe('Calculated probability of revenge trading (0-100%).'),
  interventionLevel: z.number().min(0).max(4).describe('Recommended intervention level (0 for none, 1-4 for increasing severity).'),
  message: z.string().describe('Message to be displayed to the user.'),
  digiExpression: z.enum(['Happy', 'Sweating', 'Thinking', 'Celebrating', 'Sleeping', 'Sad', 'Focused', 'Excited', 'Alarmed', 'Locked', 'Coaching']).describe('Digi mascot expression to display.'),
  actionRequired: z.enum(['none', 'toast', 'banner', 'modal', 'lock']).describe('Specific UI action required for intervention.'),
});
export type RevengeTradePreventionOutput = z.infer<typeof RevengeTradePreventionOutputSchema>;

export async function revengeTradePrevention(input: RevengeTradePreventionInput): Promise<RevengeTradePreventionOutput> {
  return revengeTradePreventionFlow(input);
}

const revengeTradePrompt = ai.definePrompt({
  name: 'revengeTradeInterventionPrompt',
  input: {
    schema: z.object({
      revengeProbability: z.number(),
      interventionLevel: z.number(),
      dailyPnl: z.number(),
      dailyPnlLimit: z.number(),
      tradesToday: z.number(),
      maxTradesPerDay: z.number(),
      timeSinceLastLossMins: z.number().nullable(),
      currentOrderQty: z.number(),
      averageQty: z.number(),
      consecutiveLosses: z.number(),
      currentTradeStockSymbol: z.string().nullable(),
      lastLossStockSymbol: z.string().nullable(),
      aiStrategyRecommendation: z.enum(['BUY', 'SELL', 'HOLD']).nullable(),
      userAction: z.enum(['BUY', 'SELL']).nullable(),
      tradingHoursContext: z.string(), // e.g., 'within_hours', 'outside_hours_after_loss'
      tradeFrequencyContext: z.string(), // e.g., 'normal', 'high_after_loss'
      lotSizeContext: z.string().nullable(), // e.g., 'normal', 'increased_after_loss'
      pnlUsedPercent: z.number(),
      qtyMultiplier: z.number(),
    }),
  },
  output: {
    schema: RevengeTradePreventionOutputSchema,
  },
  prompt: `You are the AI Risk Guardian, an expert in preventing emotional trading.
Given the following trading context, determine the appropriate intervention message, Digi mascot expression, and UI action.

Current Context:
Revenge Probability: {{{revengeProbability}}}%
Intervention Level: {{{interventionLevel}}}
Daily P&L: ₹{{{dailyPnl}}} | Daily Loss Limit: ₹{{{dailyPnlLimit}}} ({{pnlUsedPercent}}% used)
Trades Today: {{{tradesToday}}} / {{{maxTradesPerDay}}}
Consecutive Losses: {{{consecutiveLosses}}}
Time Since Last Loss (mins): {{{timeSinceLastLossMins}}}
Current Order Quantity: {{{currentOrderQty}}} | Average Quantity: {{{averageQty}}}
Current Stock Symbol: {{{currentTradeStockSymbol}}} | Last Loss Stock Symbol: {{{lastLossStockSymbol}}}
AI Strategy Recommendation: {{{aiStrategyRecommendation}}} | User Action: {{{userAction}}}
Trading Hours Context: {{{tradingHoursContext}}}
Trade Frequency Context: {{{tradeFrequencyContext}}}
Lot Size Context: {{{lotSizeContext}}}

Instructions:
1. Determine the intervention level based on the revengeProbability and dailyPnl vs dailyPnlLimit.
2. Craft a message that corresponds to the intervention level and explains the pattern detected.
3. Choose the appropriate Digi mascot expression.
4. Specify the UI action required.

Intervention Levels:
Level 0 (None): revengeProbability < 40% and dailyPnl >= dailyPnlLimit (no significant risk)
Level 1 (Gentle Nudge): revengeProbability 40-55%
Level 2 (Firm Warning): revengeProbability 56-70%
Level 3 (Strong Intervention): revengeProbability 71-85%
Level 4 (Auto-Lock): revengeProbability >= 86% OR dailyPnl <= dailyPnlLimit (daily loss limit hit)

Digi Expressions:
Happy, Sweating, Thinking, Celebrating, Sleeping, Sad, Focused, Excited, Alarmed, Locked, Coaching

UI Actions:
none, toast, banner, modal, lock

Here are the scenarios and expected outputs:
{{#if (eq interventionLevel 0)}}
  {
    "revengeProbability": {{{revengeProbability}}},
    "interventionLevel": 0,
    "message": "All good, trader! Your trading patterns are healthy and align with your strategy.",
    "digiExpression": "Happy",
    "actionRequired": "none"
  }
{{else if (eq interventionLevel 1)}}
  {
    "revengeProbability": {{{revengeProbability}}},
    "interventionLevel": 1,
    "message": "Hey! Just checking in 🧡 You've had {{{consecutiveLosses}}} losses in a row. Take a 5-minute break before your next trade. Your best trades come from a calm mind.",
    "digiExpression": "Coaching",
    "actionRequired": "toast"
  }
{{else if (eq interventionLevel 2)}}
  {
    "revengeProbability": {{{revengeProbability}}},
    "interventionLevel": 2,
    "message": "⚠️ Revenge Trade Pattern Detected. AI has noticed you're trading faster and larger after losses. Current P&L: ₹{{{dailyPnl}}} | Trades: {{{tradesToday}}} in last {{#if timeSinceLastLossMins}}{{{timeSinceLastLossMins}}} mins{{else}}a while{{/if}}. Consider: Is this your planned strategy or emotional trading?",
    "digiExpression": "Sweating",
    "actionRequired": "banner"
  }
{{else if (eq interventionLevel 3)}}
  {
    "revengeProbability": {{{revengeProbability}}},
    "interventionLevel": 3,
    "message": "🚨 AI Risk Guardian Alert: Stop. Breathe. Look at this. Your trade pattern right now: • {{{tradesToday}}} trades in last hour • Position size increased {{{qtyMultiplier}}}x after losses • {{{consecutiveLosses}}} consecutive stop-loss hits • Current loss: ₹{{{dailyPnl}}} ({{pnlUsedPercent}}% of daily limit). Gemini AI says: 'This pattern matches revenge trading with {{{revengeProbability}}}% confidence. Traders in this state lose an avg ₹8,200 more before stopping. Your historical data: you recover better when you stop at this point.'",
    "digiExpression": "Alarmed",
    "actionRequired": "modal"
  }
{{else if (eq interventionLevel 4)}}
  {
    "revengeProbability": {{{revengeProbability}}},
    "interventionLevel": 4,
    "message": "🔴 TRADING LOCKED BY AI RISK GUARDIAN. Your trading has been automatically suspended. Reason: {{#if (lte dailyPnl dailyPnlLimit)}}☑ Daily loss limit reached: ▼ ₹{{{dailyPnlLimit}}}{{/if}} {{#if (gte revengeProbability 86)}} ☑ Revenge trade pattern: CRITICAL {{/if}}. Today's damage: P&L: ▼ ₹{{{dailyPnl}}} | Trades: {{{tradesToday}}} | Win rate: N/A. Lock duration: 24 hours (resets tomorrow 9AM). Gemini message: 'Every great trader has rules. Yours saved you today. Tomorrow is a fresh start. Rest now.'",
    "digiExpression": "Locked",
    "actionRequired": "lock"
  }
{{/if}}
`,
});

const revengeTradePreventionFlow = ai.defineFlow(
  {
    name: 'revengeTradePreventionFlow',
    inputSchema: RevengeTradePreventionInputSchema,
    outputSchema: RevengeTradePreventionOutputSchema,
  },
  async (input) => {
    let revengeProbability = 0;
    let interventionLevel = 0;

    // --- Signal Detection Logic ---

    // SIGNAL 1: Speed of re-entry
    if (input.lastLossTimestamp && input.nextOrderTimestamp && input.nextOrderTimestamp - input.lastLossTimestamp < 3 * 60 * 1000) {
      revengeProbability += 20; // High impact
    }

    // SIGNAL 2: Increasing position size after losses
    if (input.lastTwoTradesOutcome.filter(o => o === 'loss').length === 2 && input.currentOrderQty > input.averageQty * 1.5) {
      revengeProbability += 25; // Critical impact
    }

    // SIGNAL 3: Trading outside normal strategy hours
    const currentHour = new Date(input.currentTimestamp).getHours();
    const currentMinute = new Date(input.currentTimestamp).getMinutes();
    const [startHour, startMinute] = input.normalTradingHoursStart.split(':').map(Number);
    const [endHour, endMinute] = input.normalTradingHoursEnd.split(':').map(Number);

    const isOutsideHours = (
      currentHour < startHour ||
      (currentHour === startHour && currentMinute < startMinute) ||
      currentHour > endHour ||
      (currentHour === endHour && currentMinute > endMinute)
    );

    let tradingHoursContext = 'within_hours';
    if (isOutsideHours && input.consecutiveLosses > 0) { // Only a factor if coupled with losses
      revengeProbability += 15; // Medium impact
      tradingHoursContext = 'outside_hours_after_loss';
    }

    // SIGNAL 4: Repeated same stock after loss
    if (input.lastLossStockSymbol && input.currentTradeStockSymbol && input.lastLossStockSymbol === input.currentTradeStockSymbol && input.consecutiveLosses > 0) {
      revengeProbability += 20; // High impact
    }

    // SIGNAL 5: Consecutive losses pattern
    if (input.consecutiveLosses >= 3) {
      revengeProbability += 25; // Critical impact
    }

    // SIGNAL 6: Deviation from strategy
    if (input.aiStrategyRecommendation && input.userAction &&
        ((input.aiStrategyRecommendation === 'HOLD' && (input.userAction === 'BUY' || input.userAction === 'SELL')) ||
         (input.aiStrategyRecommendation === 'BUY' && input.userAction === 'SELL') ||
         (input.aiStrategyRecommendation === 'SELL' && input.userAction === 'BUY')) &&
        input.consecutiveLosses > 0) { // Only a factor after losses
      revengeProbability += 20; // High impact
    }

    // SIGNAL 7: Trade frequency anomaly
    let tradeFrequencyContext = 'normal';
    if (input.dailyAverageTradeFrequency > 0 && input.tradeFrequencyInLast2Hours > input.dailyAverageTradeFrequency * 2 && input.consecutiveLosses > 0) {
      revengeProbability += 25; // Critical impact
      tradeFrequencyContext = 'high_after_loss';
    }

    // SIGNAL 8: P&L chasing with F&O lot sizes
    let lotSizeContext = 'normal';
    if (input.currentFnoLotSize && input.averageFnoLotSize && input.averageFnoLotSize > 0 && input.currentFnoLotSize > input.averageFnoLotSize * 1.5 && input.consecutiveLosses > 0) {
      revengeProbability += 25; // Critical impact
      lotSizeContext = 'increased_after_loss';
    }

    // Cap probability at 100%
    revengeProbability = Math.min(100, revengeProbability);

    // --- Determine Intervention Level ---
    // Assuming dailyPnlLimit is a negative number (e.g., -5000), so dailyPnl <= dailyPnlLimit means limit hit
    const pnlUsedPercent = input.dailyPnlLimit !== 0 ? Math.round((input.dailyPnl / input.dailyPnlLimit) * 100) : 0;

    if (input.dailyPnl <= input.dailyPnlLimit && input.dailyPnlLimit < 0) {
        interventionLevel = 4; // Auto-lock if daily loss limit hit
    } else if (revengeProbability >= 86) {
        interventionLevel = 4;
    } else if (revengeProbability >= 71) {
        interventionLevel = 3;
    } else if (revengeProbability >= 56) {
        interventionLevel = 2;
    } else if (revengeProbability >= 40) {
        interventionLevel = 1;
    } else {
        interventionLevel = 0;
    }

    const timeSinceLastLossMins = input.lastLossTimestamp && input.nextOrderTimestamp
      ? Math.round((input.nextOrderTimestamp - input.lastLossTimestamp) / (60 * 1000))
      : null;

    const qtyMultiplier = input.averageQty > 0 ? parseFloat((input.currentOrderQty / input.averageQty).toFixed(1)) : 0;

    const { output } = await revengeTradePrompt({
      revengeProbability: Math.round(revengeProbability),
      interventionLevel: interventionLevel,
      dailyPnl: input.dailyPnl,
      dailyPnlLimit: input.dailyPnlLimit,
      tradesToday: input.tradesToday,
      maxTradesPerDay: input.maxTradesPerDay,
      timeSinceLastLossMins: timeSinceLastLossMins,
      currentOrderQty: input.currentOrderQty,
      averageQty: input.averageQty,
      consecutiveLosses: input.consecutiveLosses,
      currentTradeStockSymbol: input.currentTradeStockSymbol,
      lastLossStockSymbol: input.lastLossStockSymbol,
      aiStrategyRecommendation: input.aiStrategyRecommendation,
      userAction: input.userAction,
      tradingHoursContext: tradingHoursContext,
      tradeFrequencyContext: tradeFrequencyContext,
      lotSizeContext: lotSizeContext,
      pnlUsedPercent: pnlUsedPercent,
      qtyMultiplier: qtyMultiplier,
    });

    if (!output) {
      throw new Error('Failed to generate revenge trade prevention output.');
    }
    return output;
  }
);
