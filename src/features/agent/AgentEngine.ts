import type { DecisionResult } from '../decision/DecisionTypes';
import { agentStore } from './AgentStore';
import type { AgentSnapshot, IAgentProvider } from './AgentTypes';
import { RuleBasedAgentProvider } from './providers/RuleBasedAgentProvider';

export class AgentEngine {
  private provider: IAgentProvider;

  constructor(provider?: IAgentProvider) {
    this.provider = provider ?? new RuleBasedAgentProvider();
  }

  setProvider(provider: IAgentProvider) {
    this.provider = provider;
  }

  async processEmail(decision: DecisionResult, conversationId: string): Promise<AgentSnapshot> {
    const snapshot = await this.provider.process(decision, conversationId);
    
    // Save to AgentStore so React UI can consume it
    await agentStore.saveSnapshot(snapshot);
    
    return snapshot;
  }
}

export const agentEngine = new AgentEngine();
