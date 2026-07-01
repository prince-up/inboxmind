import type { DecisionResult } from '../decision/DecisionTypes';

export type AgentTaskStatus = 'Pending' | 'Completed' | 'Dismissed';

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
  createdAt: number;
}

export interface ReplyIntent {
  id: string;
  intent: string;
  label: string;
  icon: string;
}

export interface AgentInsight {
  id: string;
  text: string;
  icon: string;
}

export interface AgentMemory {
  conversationId: string;
  lastAnalysisTimestamp: number;
  pendingTasks: AgentTask[];
  completedTasks: AgentTask[];
  dismissedReminders: string[];
  previousDecisions: string[];
  lastDecisionResult?: DecisionResult;
}

export interface AgentDailyDigest {
  interviewsCount: number;
  assessmentsCount: number;
  expiringOffersCount: number;
  unreadRecruitersCount: number;
  pendingRepliesCount: number;
}

export interface AgentSnapshot {
  conversationId: string;
  dailyDigest: AgentDailyDigest;
  pendingTasks: AgentTask[];
  suggestedReplies: ReplyIntent[];
  insights: AgentInsight[];
  memory: AgentMemory;
}

export interface IAgentProvider {
  process(decision: DecisionResult, conversationId: string): Promise<AgentSnapshot>;
}
