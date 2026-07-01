import type { DecisionResult } from '../decision/DecisionTypes';

export type ReminderStatus = 'Pending' | 'Completed' | 'Dismissed' | 'Snoozed';

export interface Reminder extends DecisionResult {
  id: string;
  emailId: string;
  threadId: string;
  subject: string;
  status: ReminderStatus;
  createdAt: number;
  updatedAt: number;
  snoozeUntil?: number;
}
