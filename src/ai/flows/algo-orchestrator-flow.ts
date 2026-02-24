'use server';
/**
 * @fileOverview A Genkit flow for the Multi-Agent Algo Orchestrator.
 * It simulates signal aggregation from specialized AI agents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AlgoOrchestratorInputSchema = z.object({
  symbol: z.string().describe('Symbol to analyze (e.g. NIFTY).'),
  tradingStyle: z.enum(['Scalper', 'Trend Rider', 'Institutional']).default('Trend Rider'),
  enabledAgents: z.array(z.string()).describe('List of specialized agents to consult.'),
});

export type AlgoOrchestratorInput = z.infer<typeof AlgoOrchestratorInputSchema>;

const AgentScoreSchema = z.object({
  agentName: z.string(),
  bias: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  confidence: z.number().min(0).max(100),
  keySignal: z.string(),
});

const AlgoOrchestratorOutputSchema = z.object({
  consensus: z.object({
    direction: z.enum(['BUY', 'SELL', 'WAIT']),
    aggregatedScore: z.number(),
    reasoning: z.string(),
  }),
  agentBreakdown: z.array(AgentScoreSchema),
  riskParameters: z.object({
    suggestedLotSize: z.string(),
    stopLossZone: z.string(),
    targetZone: z.string(),
    adaptiveRiskMultiplier: z.number().describe('0.5 to 2.0 based on market volatility.'),
  }),
});

export type AlgoOrchestratorOutput = z.infer<typeof AlgoOrchestratorOutputSchema>;

export async function orchestrateAlgoAgents(input: AlgoOrchestratorInput): Promise<AlgoOrchestratorOutput> {
  return algoOrchestratorFlow(input);
}

const algoOrchestratorPrompt = ai.definePrompt({
  name: 'algoOrchestratorPrompt',
  input: { schema: AlgoOrchestratorInputSchema },
  output: { schema: AlgoOrchestratorOutputSchema },
  prompt: `You are the Meta-AI Orchestrator for TheDigiOcean's High-Frequency Trading Engine.
Analyze the symbol {{{symbol}}} using a {{{tradingStyle}}} execution profile.

Consult the following enabled agents:
{{#each enabledAgents}}
- {{{this}}}
{{/each}}

For each agent, generate a simulated high-fidelity signal based on their specialization (e.g. GEX Mapper should talk about hedging walls, Volatility Surface about Skew).
Then, aggregate these scores to provide a unified consensus and risk-adaptive position sizing parameters.

Output must be a valid JSON object conforming to the schema.`,
});

const algoOrchestratorFlow = ai.defineFlow(
  {
    name: 'algoOrchestratorFlow',
    inputSchema: AlgoOrchestratorInputSchema,
    outputSchema: AlgoOrchestratorOutputSchema,
  },
  async (input) => {
    const { output } = await algoOrchestratorPrompt(input);
    if (!output) throw new Error('Algo Orchestration failed.');
    return output;
  }
);
