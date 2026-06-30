export type AIActionType =
  | 'archive'
  | 'calendar'
  | 'follow_up'
  | 'forward'
  | 'reply'
  | 'schedule_reminder'
  | 'star';

export type AIActionRisk = 'high' | 'low' | 'medium';

export interface AIActionItem {
  readonly confidence: number;
  readonly description: string;
  readonly dueDate: string | null;
  readonly risk: AIActionRisk;
  readonly title: string;
  readonly type: AIActionType;
}
