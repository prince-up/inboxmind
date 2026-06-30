import { z } from 'zod';

import { AI_MODELS } from '../types/AIModels';
import type { AIProviderType } from '../types/AIProviderType';

const aiConfigSchema = z.object({
  anthropicApiKey: z.string().min(1).optional(),
  defaultProvider: z
    .enum(['claude', 'gemini', 'ollama', 'openai'])
    .default('gemini'),
  geminiApiKey: z.string().min(1).optional(),
  ollamaUrl: z.string().url().default('http://localhost:11434'),
  openaiApiKey: z.string().min(1).optional(),
  requestTimeoutMs: z.coerce.number().int().positive().default(30_000),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

export const aiConfig: AIConfig = aiConfigSchema.parse({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  defaultProvider: process.env.PLASMO_PUBLIC_AI_PROVIDER,
  geminiApiKey: process.env.GEMINI_API_KEY,
  ollamaUrl: process.env.OLLAMA_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  requestTimeoutMs: process.env.PLASMO_PUBLIC_AI_TIMEOUT_MS,
});

export const getDefaultModelId = (provider: AIProviderType): string =>
  AI_MODELS[provider].id;
