import type { ParsedConversation, ParserResult } from '~features/parser';
import { logger } from '~utils';

import { aiConfig } from '../config/AIConfig';
import type { AIConfig } from '../config/AIConfig';
import type {
  AIActionDetection,
  AIAnalysis,
  AIHealth,
  AISummary,
} from '../models/AIResponse';
import { ClaudeProvider } from '../providers/ClaudeProvider';
import { GeminiProvider } from '../providers/GeminiProvider';
import { OllamaProvider } from '../providers/OllamaProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { AIManager } from './AIManager';
import { AIRegistry } from './AIRegistry';

/**
 * Public AI engine facade for InboxMind.
 */
export class AIEngine {
  private initialized = false;

  public constructor(
    private readonly registry: AIRegistry,
    private readonly manager: AIManager,
  ) {}

  /**
   * Initializes registered AI providers once.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Promise.all(
      this.registry.getProviders().map((provider) => provider.initialize()),
    );
    this.initialized = true;
    logger.info('AI Engine Initialized', {
      provider: this.registry.getActiveProviderType(),
    });
  }

  /**
   * Runs complete structured analysis for a parsed conversation.
   */
  public async analyzeEmail(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AIAnalysis> {
    await this.initialize();
    return this.manager.analyzeEmail(parserResult);
  }

  /**
   * Generates a validated summary for a parsed conversation.
   */
  public async summarize(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AISummary> {
    await this.initialize();
    return this.manager.summarize(parserResult);
  }

  /**
   * Detects validated actions for a parsed conversation.
   */
  public async detectActions(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AIActionDetection> {
    await this.initialize();
    return this.manager.detectActions(parserResult);
  }

  /**
   * Returns active provider health.
   */
  public async health(): Promise<AIHealth> {
    await this.initialize();
    return this.manager.health();
  }

  /**
   * Releases provider resources and resets lifecycle state.
   */
  public async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await Promise.all(
      this.registry.getProviders().map((provider) => provider.destroy()),
    );
    this.initialized = false;
    logger.info('AI Engine Destroyed');
  }
}

/**
 * Creates an AI engine with the production provider registry.
 */
export const createAIEngine = (config: AIConfig = aiConfig): AIEngine => {
  const providers = {
    claude: new ClaudeProvider(config),
    gemini: new GeminiProvider(config),
    ollama: new OllamaProvider(config),
    openai: new OpenAIProvider(config),
  };
  const registry = new AIRegistry(providers, config.defaultProvider);
  const manager = new AIManager(registry, config);

  return new AIEngine(registry, manager);
};

export const aiEngine = createAIEngine();
