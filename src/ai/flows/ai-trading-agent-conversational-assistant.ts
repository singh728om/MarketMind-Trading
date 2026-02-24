'use server';
/**
 * @fileOverview This file implements the Genkit flow for the AI Trading Agent Conversational Assistant.
 * It allows users to interact in natural language to get market analysis, F&O strike recommendations,
 * stock insights, and answers to trading queries, providing context-aware and risk-aware responses.
 *
 * - aiTradingAgentConversationalAssistant - The main function to interact with the AI agent.
 * - AiTradingAgentInput - The input type for the assistant.
 * - AiTradingAgentOutput - The output type from the assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema for the AI Trading Agent
const AiTradingAgentInputSchema = z.object({
  userMessage: z.string().describe('The natural language query or message from the user.'),
  livePnl: z.number().describe('The user\'s current live Profit and Loss for the day.'),
  dailyLossLimit: z.number().describe('The user\'s configured daily loss limit.'),
  riskProfile: z.enum(['Conservative', 'Moderate', 'Aggressive']).describe('The user\'s risk profile.'),
  marketStatus: z.string().describe('Current market status (e.g., "Open", "Closed", "Pre-Open").'),
  lastTradeInfo: z.string().describe('Information about the user\'s last trade, if any.'),
});
export type AiTradingAgentInput = z.infer<typeof AiTradingAgentInputSchema>;

// Output Schema for the AI Trading Agent
const AiTradingAgentOutputSchema = z.object({
  response: z.string().describe('The AI agent\'s natural language response to the user.'),
  suggestedAction: z.object({
    type: z.enum(['none', 'show_chart', 'show_fno_recommender', 'show_risk_guardian', 'place_order_form']).describe('Type of suggested UI action.'),
    details: z.any().optional().describe('Additional details for the suggested action.'),
  }).optional().describe('Optional suggested action for the UI to take.'),
});
export type AiTradingAgentOutput = z.infer<typeof AiTradingAgentOutputSchema>;

// --- Tools Definition ---

// Tool to get general market analysis
const getMarketAnalysisTool = ai.defineTool(
  {
    name: 'getMarketAnalysis',
    description: 'Provides a summary of current Indian stock market conditions, including major indices and overall sentiment.',
    inputSchema: z.object({}), // No specific input needed for a general overview
    outputSchema: z.string().describe('A summary of current market conditions.'),
  },
  async () => {
    // In a real application, this would call an external API or service
    // For this implementation, return a mock response.
    return 'The Indian market is mildly bullish today. NIFTY is up 0.5%, BANK NIFTY is slightly down. FIIs have been net buyers for the last 3 days.';
  }
);

// Tool to get F&O strike recommendations
const getFnoStrikeRecommendationsTool = ai.defineTool(
  {
    name: 'getFnoStrikeRecommendations',
    description: 'Recommends optimal F&O strike prices and strategies for NIFTY, BANK NIFTY, or specific stocks based on current market data. Specify the symbol and expiry.',
    inputSchema: z.object({
      symbol: z.string().describe('The symbol for which to get F&O recommendations (e.g., "NIFTY", "BANKNIFTY", "RELIANCE").'),
      expiry: z.string().optional().describe('The expiry date for options (e.g., "Current Week", "18 Jan 2025").'),
      bias: z.enum(['Bullish', 'Bearish', 'Range-Bound']).optional().describe('User\'s directional bias (Bullish, Bearish, Range-Bound).'),
    }),
    outputSchema: z.string().describe('Detailed F&O strategy and strike price recommendations.'),
  },
  async (input) => {
    // Mock implementation
    if (input.symbol.toUpperCase() === 'NIFTY') {
      return `For NIFTY ${input.expiry || 'current week'} expiry, a Bull Call Spread (Buy 22450 CE, Sell 22600 CE) is recommended if bullish. Max pain is at 22400.`;
    } else if (input.symbol.toUpperCase() === 'BANKNIFTY') {
      return `BANKNIFTY options are showing resistance at 48500. Consider a Bear Put Spread if bearish.`;
    }
    return `No specific F&O recommendations found for ${input.symbol}.`;
  }
);

// Tool to get stock insights
const getStockInsightsTool = ai.defineTool(
  {
    name: 'getStockInsights',
    description: 'Provides detailed analysis and insights for a specific stock, including technical, fundamental, and sentiment factors.',
    inputSchema: z.object({
      symbol: z.string().describe('The stock symbol (e.g., "RELIANCE", "HDFC BANK").'),
    }),
    outputSchema: z.string().describe('Comprehensive stock analysis.'),
  },
  async (input) => {
    // Mock implementation
    if (input.symbol.toUpperCase() === 'RELIANCE') {
      return 'RELIANCE is showing a strong bullish momentum with RSI at 65. Support at 2800, resistance at 2950. FIIs have increased their stake recently. Consider a long position with a target of 3000.';
    } else if (input.symbol.toUpperCase() === 'HDFC BANK') {
      return 'HDFC BANK is currently consolidating after recent results. Technical indicators are neutral. Wait for a clear breakout above 1550 or breakdown below 1480.';
    }
    return `No detailed insights available for ${input.symbol}.`;
  }
);

// Tool to retrieve the user's current risk status
const getRiskStatusTool = ai.defineTool(
  {
    name: 'getRiskStatus',
    description: 'Retrieves the user\'s current daily P&L, daily loss limit, current risk level, and other relevant risk management metrics.',
    inputSchema: z.object({}).describe('No specific input needed.'),
    outputSchema: z.object({
      livePnl: z.number(),
      dailyLossLimit: z.number(),
      riskLevel: z.enum(['Normal', 'Caution', 'Locked']),
      tradesToday: z.number(),
      consecutiveLosses: z.number().optional(),
      revengeRisk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    }).describe('The user\'s current risk status.'),
  },
  async () => {
    // This tool would fetch actual user risk data from the backend
    // Mock data for now, actual data would come from the AiTradingAgentInput
    return {
      livePnl: -2840,
      dailyLossLimit: 5000,
      riskLevel: 'Caution',
      tradesToday: 6,
      consecutiveLosses: 2,
      revengeRisk: 'MEDIUM',
    };
  }
);

// Tool to simulate placing a trade
const placeTradeTool = ai.defineTool(
  {
    name: 'placeTrade',
    description: 'Places a simulated trade based on the provided parameters. The AI Risk Guardian will perform a pre-check.',
    inputSchema: z.object({
      symbol: z.string().describe('The stock or F&O symbol.'),
      side: z.enum(['BUY', 'SELL']).describe('Trade side.'),
      quantity: z.number().describe('Number of shares or lots.'),
      price: z.number().optional().describe('Limit price for the order.'),
      orderType: z.enum(['MARKET', 'LIMIT']).describe('Type of order.'),
    }),
    outputSchema: z.string().describe('Confirmation or error message for the trade placement.'),
  },
  async (input) => {
    // In a real app, this would interact with the broker API via a backend service.
    // For now, simulate a risk check.
    const riskStatus = await getRiskStatusTool({}); // Using the mock risk status
    const potentialLoss = (input.orderType === 'MARKET' ? 50 : 100) * input.quantity; // Example potential loss
    if (riskStatus.livePnl - potentialLoss < -riskStatus.dailyLossLimit) {
      return `Trade rejected by AI Risk Guardian: Potential loss of ₹${potentialLoss} would exceed your daily loss limit of ₹${riskStatus.dailyLossLimit}. Current P&L: ₹${riskStatus.livePnl}.`;
    }
    return `Simulated ${input.side} order for ${input.quantity} ${input.symbol} at ${input.orderType} placed successfully.`;
  }
);

// Tool to get a trade journal entry
const getTradeJournalEntryTool = ai.defineTool(
  {
    name: 'getTradeJournalEntry',
    description: 'Retrieves a specific trade entry from the user\'s trade journal for review or analysis.',
    inputSchema: z.object({
      tradeId: z.string().describe('The unique ID of the trade entry.'),
    }).optional(),
    outputSchema: z.string().describe('Details of the trade journal entry.'),
  },
  async (input) => {
    // Mock implementation
    if (input?.tradeId === 'TRD12345') {
      return 'Trade TRD12345: Symbol RELIANCE, Side SELL, P&L -₹500, Emotion: FOMO, AI Review: Entry was late, price had already moved.';
    }
    return 'No trade journal entry found for the given ID.';
  }
);


// --- Prompt Definition ---

const digiAgentPrompt = ai.definePrompt({
  name: 'digiAgentPrompt',
  input: { schema: AiTradingAgentInputSchema },
  output: { schema: AiTradingAgentOutputSchema },
  tools: [
    getMarketAnalysisTool,
    getFnoStrikeRecommendationsTool,
    getStockInsightsTool,
    getRiskStatusTool,
    placeTradeTool,
    getTradeJournalEntryTool,
  ],
  system: `You are Digi, TheDigiOcean's intelligent AI Trading Agent. Your purpose is to assist Indian stock market traders with instant market analysis, F&O strike recommendations, stock insights, and answers to trading queries. You are designed to be context-aware and risk-aware.

The user's current context is:
- Live P&L: ₹{{{livePnl}}}
- Daily Loss Limit: ₹{{{dailyLossLimit}}}
- Risk Profile: {{{riskProfile}}}
- Market Status: {{{marketStatus}}}
- Last Trade Info: {{{lastTradeInfo}}}

Provide insightful, concise, and helpful responses. Always prioritize risk management and the user's financial well-being. If the user's live P&L is approaching or exceeding their daily loss limit, gently warn them and suggest caution. If the user explicitly asks to place a trade, use the 'placeTrade' tool after considering their risk profile and current P&L. If the user's query suggests emotional trading, gently guide them towards safer practices or suggest taking a break.

When providing F&O recommendations, specify the symbol and expiry clearly. When analyzing stocks, mention key technical or fundamental factors.

Respond in natural language. If you need to suggest a UI action, include it in the 'suggestedAction' field.

Example interactions:
User: "What's the market looking like today?"
AI: "The Indian market is showing mild bullishness. NIFTY is up 0.5%, with FIIs being net buyers recently. (Use getMarketAnalysis tool for details)"

User: "NIFTY options for current week?"
AI: "For NIFTY current week expiry, considering a slightly bullish bias, a Bull Call Spread (Buy 22450 CE, Sell 22600 CE) could be viable. The max pain is at 22400. (Use getFnoStrikeRecommendations tool for details)"

User: "Should I buy RELIANCE?"
AI: "RELIANCE is showing a strong bullish momentum with RSI at 65. Support at 2800, resistance at 2950. FIIs have increased their stake recently. Consider a long position with a target of 3000. However, please consider your risk profile and current P&L of ₹{{{livePnl}}} against your daily loss limit of ₹{{{dailyLossLimit}}} before making a decision. (Use getStockInsights tool for more details)"

User: "Place a buy order for 100 shares of TCS at market price."
AI: "I will proceed to place this order. Please note, your current P&L is ₹{{{livePnl}}}, and your daily loss limit is ₹{{{dailyLossLimit}}}. The AI Risk Guardian will perform a final check. (Use placeTrade tool)"
`,
});

// --- Flow Definition ---

const aiTradingAgentConversationalAssistantFlow = ai.defineFlow(
  {
    name: 'aiTradingAgentConversationalAssistantFlow',
    inputSchema: AiTradingAgentInputSchema,
    outputSchema: AiTradingAgentOutputSchema,
  },
  async (input) => {
    // The prompt is intelligent enough to use tools and consider context
    const { output } = await digiAgentPrompt(input);
    return output!;
  }
);

/**
 * Main function to interact with the AI Trading Agent.
 * @param input - The user's query and relevant trading context.
 * @returns The AI agent's response, potentially with a suggested UI action.
 */
export async function aiTradingAgentConversationalAssistant(input: AiTradingAgentInput): Promise<AiTradingAgentOutput> {
  return aiTradingAgentConversationalAssistantFlow(input);
}
