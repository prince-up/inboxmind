export type ReminderStatus = 'active' | 'completed' | 'dismissed';

/**
 * Serializable reminder associated with an email.
 */
export interface Reminder {
  readonly id: string;
  readonly emailId: string;
  readonly dueAt: string;
  readonly status: ReminderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
