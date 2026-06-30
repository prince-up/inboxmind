export { BaseAdapter, type AdapterRequest } from './adapters/BaseAdapter';
export { GeminiAdapter } from './adapters/GeminiAdapter';
export { OpenAIAdapter } from './adapters/OpenAIAdapter';
export { aiConfig, getDefaultModelId, type AIConfig } from './config/AIConfig';
export { AIEngine, aiEngine, createAIEngine } from './engine/AIEngine';
export { AIManager } from './engine/AIManager';
export {
  AbstractAIProvider,
  type AbstractAIProviderOptions,
  type AIProvider,
} from './engine/AIProvider';
export { AIRegistry, type ProviderMap } from './engine/AIRegistry';
export { AIError, isAIError, type AIErrorCode } from './errors/AIErrors';
export type {
  AIActionItem,
  AIActionRisk,
  AIActionType,
} from './models/AIAction';
export type {
  AIPrompt,
  AIPromptMessage,
  AIRequest,
  AITaskType,
} from './models/AIRequest';
export type {
  AIActionDetection,
  AIAnalysis,
  AIEntity,
  AIHealth,
  AIMetadata,
  AIPriority,
  AIResponse,
  AISummary,
  AIUsage,
} from './models/AIResponse';
export { AIResponseParser } from './parser/AIResponseParser';
export {
  structuredAnalysisSchema,
  type StructuredAnalysisOutput,
  type StructuredOutputSchema,
} from './parser/StructuredOutput';
export { buildActionPrompt } from './prompts/ActionPrompt';
export { buildMetadataPrompt } from './prompts/MetadataPrompt';
export {
  buildSummaryPrompt,
  type PromptConversationContext,
  type PromptEmailContext,
} from './prompts/SummaryPrompt';
export { ClaudeProvider } from './providers/ClaudeProvider';
export { GeminiProvider } from './providers/GeminiProvider';
export { OllamaProvider } from './providers/OllamaProvider';
export { OpenAIProvider } from './providers/OpenAIProvider';
export {
  actionItemSchema,
  actionRiskSchema,
  actionSchema,
  actionTypeSchema,
  type ActionOutput,
} from './schemas/ActionSchema';
export {
  entitySchema,
  metadataSchema,
  type MetadataOutput,
} from './schemas/MetadataSchema';
export {
  confidenceSchema,
  dateOrNullSchema,
  prioritySchema,
  summarySchema,
  type SummaryOutput,
} from './schemas/SummarySchema';
export {
  AI_MODELS,
  type AIModelDefinition,
  type AIModelId,
} from './types/AIModels';
export type { AIProviderType } from './types/AIProviderType';
export { PromptBuilder } from './utils/PromptBuilder';
export { TokenCounter } from './utils/TokenCounter';
