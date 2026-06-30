/**
 * Supported AI operation categories. Implementations are introduced in the AI
 * integration commit.
 */
export type AIActionKind =
  | 'detect-deadline'
  | 'detect-follow-up'
  | 'generate-reply'
  | 'summarize';

export type AIActionStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

/**
 * Serializable lifecycle metadata for an AI operation.
 */
export interface AIAction {
  readonly id: string;
  readonly emailId: string;
  readonly kind: AIActionKind;
  readonly status: AIActionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
