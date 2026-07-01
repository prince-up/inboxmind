import type { DecisionResult } from '../decision/DecisionTypes';
import type { AgentMemory, AgentTask } from './AgentTypes';

const STORAGE_KEY_PREFIX = 'inboxmind_agent_memory_';

export class MemoryEngine {
  async getMemory(conversationId: string): Promise<AgentMemory> {
    const key = `${STORAGE_KEY_PREFIX}${conversationId}`;
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        if (result[key]) {
          resolve(result[key] as AgentMemory);
        } else {
          // Initialize empty memory
          resolve({
            conversationId,
            lastAnalysisTimestamp: 0,
            pendingTasks: [],
            completedTasks: [],
            dismissedReminders: [],
            previousDecisions: [],
          });
        }
      });
    });
  }

  async saveMemory(memory: AgentMemory): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${memory.conversationId}`;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: memory }, resolve);
    });
  }

  async updateWithNewTasks(conversationId: string, newTasks: AgentTask[], decision: DecisionResult): Promise<AgentMemory> {
    const memory = await this.getMemory(conversationId);
    
    // Archive previous pending tasks if they are no longer relevant, or merge them.
    // For simplicity, we assume new parsing completely replaces pending tasks.
    memory.pendingTasks = newTasks;
    memory.lastAnalysisTimestamp = Date.now();
    
    if (memory.lastDecisionResult) {
      memory.previousDecisions.push(memory.lastDecisionResult.category);
    }
    memory.lastDecisionResult = decision;

    await this.saveMemory(memory);
    return memory;
  }
}
