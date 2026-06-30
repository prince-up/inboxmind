import type { AIProviderType } from './AIProviderType';

export type AIModelId =
  | 'claude-3-5-sonnet-latest'
  | 'gemini-1.5-flash'
  | 'gpt-4o-mini'
  | 'llama3.1';

export interface AIModelDefinition {
  readonly id: AIModelId;
  readonly maxInputTokens: number;
  readonly provider: AIProviderType;
}

export const AI_MODELS: Readonly<Record<AIProviderType, AIModelDefinition>> = {
  claude: {
    id: 'claude-3-5-sonnet-latest',
    maxInputTokens: 180_000,
    provider: 'claude',
  },
  gemini: {
    id: 'gemini-1.5-flash',
    maxInputTokens: 1_000_000,
    provider: 'gemini',
  },
  ollama: {
    id: 'llama3.1',
    maxInputTokens: 32_000,
    provider: 'ollama',
  },
  openai: {
    id: 'gpt-4o-mini',
    maxInputTokens: 128_000,
    provider: 'openai',
  },
};
