import type { ParsedConversation, ParserResult } from '~features/parser';

import type { AIConfig } from '../config/AIConfig';
import { AIError } from '../errors/AIErrors';
import type { AIRequest } from '../models/AIRequest';
import type {
  AIActionDetection,
  AIAnalysis,
  AIHealth,
  AIMetadata,
  AISummary,
} from '../models/AIResponse';
import { actionSchema } from '../schemas/ActionSchema';
import { metadataSchema } from '../schemas/MetadataSchema';
import { summarySchema } from '../schemas/SummarySchema';
import { PromptBuilder } from '../utils/PromptBuilder';
import type { AIRegistry } from './AIRegistry';

/**
 * Coordinates parser results, prompt building, provider calls, and schemas.
 */
export class AIManager {
  public constructor(
    private readonly registry: AIRegistry,
    private readonly config: AIConfig,
    private readonly promptBuilder = new PromptBuilder(),
  ) {}

  /**
   * Runs all analysis tasks for a parsed conversation.
   */
  public async analyzeEmail(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AIAnalysis> {
    const [summary, actions, metadata] = await Promise.all([
      this.summarize(parserResult),
      this.detectActions(parserResult),
      this.extractMetadata(parserResult),
    ]);

    return {
      actions,
      metadata,
      summary,
    };
  }

  /**
   * Produces a validated summary object.
   */
  public async summarize(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AISummary> {
    const conversation = this.assertSuccessfulParserResult(parserResult);
    const response = await this.registry
      .getActiveProvider()
      .generate(
        this.createRequest(
          parserResult,
          this.promptBuilder.buildSummary(conversation),
        ),
        summarySchema,
      );

    return response.data;
  }

  /**
   * Produces validated action recommendations.
   */
  public async detectActions(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AIActionDetection> {
    const conversation = this.assertSuccessfulParserResult(parserResult);
    const response = await this.registry
      .getActiveProvider()
      .generate(
        this.createRequest(
          parserResult,
          this.promptBuilder.buildActions(conversation),
        ),
        actionSchema,
      );

    return response.data;
  }

  /**
   * Produces validated metadata extraction output.
   */
  public async extractMetadata(
    parserResult: ParserResult<ParsedConversation>,
  ): Promise<AIMetadata> {
    const conversation = this.assertSuccessfulParserResult(parserResult);
    const response = await this.registry
      .getActiveProvider()
      .generate(
        this.createRequest(
          parserResult,
          this.promptBuilder.buildMetadata(conversation),
        ),
        metadataSchema,
      );

    return response.data;
  }

  /**
   * Returns health for the active provider.
   */
  public async health(): Promise<AIHealth> {
    return this.registry.getActiveProvider().health();
  }

  /**
   * Creates a provider request.
   */
  private createRequest(
    parserResult: ParserResult<ParsedConversation>,
    prompt: AIRequest['prompt'],
  ): AIRequest {
    return {
      parserResult,
      prompt,
      timeoutMs: this.config.requestTimeoutMs,
    };
  }

  /**
   * Ensures the parser produced conversation data before invoking AI.
   */
  private assertSuccessfulParserResult(
    parserResult: ParserResult<ParsedConversation>,
  ): ParsedConversation {
    if (!parserResult.success) {
      throw new AIError(
        'VALIDATION_FAILED',
        'AI analysis requires a successful parser result.',
      );
    }

    return parserResult.data;
  }
}
