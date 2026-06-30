import type { ParsedConversation, ParserResult } from '~features/parser';

export type AITaskType = 'actions' | 'metadata' | 'summary';

export interface AIPromptMessage {
  readonly content: string;
  readonly role: 'system' | 'user';
}

export interface AIPrompt {
  readonly messages: readonly AIPromptMessage[];
  readonly responseFormat: 'json_object';
  readonly task: AITaskType;
}

export interface AIRequest {
  readonly parserResult: ParserResult<ParsedConversation>;
  readonly prompt: AIPrompt;
  readonly timeoutMs: number;
}
