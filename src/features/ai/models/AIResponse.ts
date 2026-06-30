import type { AIProviderType } from '../types/AIProviderType';
import type { AIActionItem } from './AIAction';

export type AIPriority = 'high' | 'low' | 'medium';

export interface AISummary {
  readonly confidence: number;
  readonly deadline: string | null;
  readonly followUpDate: string | null;
  readonly priority: AIPriority;
  readonly summary: string;
}

export interface AIEntity {
  readonly name: string;
  readonly type:
    | 'company'
    | 'date'
    | 'location'
    | 'money'
    | 'person'
    | 'product';
}

export interface AIMetadata {
  readonly confidence: number;
  readonly entities: readonly AIEntity[];
  readonly language: string;
  readonly risk: 'high' | 'low' | 'medium';
  readonly sentiment: 'negative' | 'neutral' | 'positive';
}

export interface AIActionDetection {
  readonly actions: readonly AIActionItem[];
  readonly confidence: number;
}

export interface AIAnalysis {
  readonly actions: AIActionDetection;
  readonly metadata: AIMetadata;
  readonly summary: AISummary;
}

export interface AIHealth {
  readonly available: boolean;
  readonly checkedAt: number;
  readonly latencyMs: number | null;
  readonly provider: AIProviderType;
  readonly reason: string | null;
}

export interface AIResponse<TData> {
  readonly data: TData;
  readonly model: string;
  readonly provider: AIProviderType;
  readonly receivedAt: number;
  readonly usage: AIUsage | null;
}

export interface AIUsage {
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  readonly totalTokens: number | null;
}
