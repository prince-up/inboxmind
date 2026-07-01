import type { AgentSnapshot } from './AgentTypes';

const STORAGE_KEY = 'inboxmind_agent_snapshots';

export class AgentStore {
  async getSnapshots(): Promise<AgentSnapshot[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve((result[STORAGE_KEY] as AgentSnapshot[]) ?? []);
      });
    });
  }

  async saveSnapshot(snapshot: AgentSnapshot): Promise<void> {
    const snapshots = await this.getSnapshots();
    const existingIndex = snapshots.findIndex((s) => s.conversationId === snapshot.conversationId);

    if (existingIndex >= 0) {
      snapshots[existingIndex] = snapshot;
    } else {
      snapshots.push(snapshot);
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: snapshots }, resolve);
    });
  }
}

export const agentStore = new AgentStore();
