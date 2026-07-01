import type { ActionDef } from './DecisionTypes';

export class ActionRegistry {
  private actions = new Map<string, ActionDef>();

  constructor() {
    this.registerDefaults();
  }

  register(action: ActionDef) {
    this.actions.set(action.id, action);
  }

  get(id: string): ActionDef | undefined {
    return this.actions.get(id);
  }

  getAll(): ActionDef[] {
    return Array.from(this.actions.values());
  }

  private registerDefaults() {
    const defaultActions: ActionDef[] = [
      {
        id: 'add-calendar',
        title: 'Add to Calendar',
        description: 'Create a calendar event.',
        reason: 'Schedule found.',
        icon: 'calendar',
        priority: 'High',
        enabled: true,
      },
      {
        id: 'prepare-interview',
        title: 'Prepare Interview',
        description: 'Review resources.',
        reason: 'Interview upcoming.',
        icon: 'book',
        priority: 'High',
        enabled: true,
      },
      {
        id: 'open-attachment',
        title: 'Open Attachment',
        description: 'View attached files.',
        reason: 'Attachments found.',
        icon: 'paperclip',
        priority: 'Medium',
        enabled: true,
      },

      {
        id: 'start-assessment',
        title: 'Start Assessment',
        description: 'Begin the test.',
        reason: 'Assessment link detected.',
        icon: 'play',
        priority: 'Critical',
        enabled: true,
      },
      {
        id: 'open-instructions',
        title: 'Open Instructions',
        description: 'View assessment rules.',
        reason: 'Assessment instructions attached.',
        icon: 'file-text',
        priority: 'Medium',
        enabled: true,
      },
      {
        id: 'set-reminder',
        title: 'Set Reminder',
        description: 'Remind me later.',
        reason: 'Deadline approaching.',
        icon: 'bell',
        priority: 'High',
        enabled: true,
      },

      {
        id: 'reply',
        title: 'Reply',
        description: 'Reply to sender.',
        reason: 'Response expected.',
        icon: 'mail-reply',
        priority: 'High',
        enabled: true,
      },
      {
        id: 'follow-up',
        title: 'Follow Up',
        description: 'Send follow-up.',
        reason: 'Waiting for response.',
        icon: 'mail-forward',
        priority: 'Medium',
        enabled: true,
      },
      {
        id: 'view-company',
        title: 'View Company',
        description: 'Research company.',
        reason: 'Recruiter reached out.',
        icon: 'briefcase',
        priority: 'Medium',
        enabled: true,
      },

      {
        id: 'register',
        title: 'Register',
        description: 'Sign up for event.',
        reason: 'Registration open.',
        icon: 'user-plus',
        priority: 'High',
        enabled: true,
      },
      {
        id: 'view-rules',
        title: 'View Rules',
        description: 'Read contest rules.',
        reason: 'Rules linked.',
        icon: 'book',
        priority: 'Medium',
        enabled: true,
      },
      {
        id: 'add-deadline',
        title: 'Add Deadline',
        description: 'Track submission date.',
        reason: 'Deadline found.',
        icon: 'calendar',
        priority: 'High',
        enabled: true,
      },
      {
        id: 'open-challenge',
        title: 'Open Challenge',
        description: 'View the problem.',
        reason: 'Challenge available.',
        icon: 'code',
        priority: 'Critical',
        enabled: true,
      },

      {
        id: 'archive',
        title: 'Archive',
        description: 'Move to archive.',
        reason: 'No action needed.',
        icon: 'archive',
        priority: 'Low',
        enabled: true,
      },
      {
        id: 'mark-read',
        title: 'Mark as Read',
        description: 'Mark as read.',
        reason: 'Newsletter.',
        icon: 'check',
        priority: 'Low',
        enabled: true,
      },
      {
        id: 'save-later',
        title: 'Save for Later',
        description: 'Read this later.',
        reason: 'Long content.',
        icon: 'bookmark',
        priority: 'Low',
        enabled: true,
      },
      {
        id: 'ignore',
        title: 'Ignore',
        description: 'Ignore this email.',
        reason: 'Not important.',
        icon: 'x',
        priority: 'Low',
        enabled: true,
      },

      {
        id: 'pay-bill',
        title: 'Pay Bill',
        description: 'Open payment portal.',
        reason: 'Unpaid invoice.',
        icon: 'credit-card',
        priority: 'Critical',
        enabled: true,
      },
      {
        id: 'download-invoice',
        title: 'Download Invoice',
        description: 'Save receipt.',
        reason: 'Invoice attached.',
        icon: 'download',
        priority: 'Medium',
        enabled: true,
      },
      {
        id: 'reminder-bill',
        title: 'Reminder',
        description: 'Remind before due date.',
        reason: 'Payment due.',
        icon: 'bell',
        priority: 'High',
        enabled: true,
      },

      {
        id: 'track-thread',
        title: 'Track Thread',
        description: 'Follow ticket status.',
        reason: 'Support ticket open.',
        icon: 'activity',
        priority: 'Medium',
        enabled: true,
      },
      {
        id: 'wait-response',
        title: 'Wait for Response',
        description: 'Pending support agent.',
        reason: 'Awaiting reply.',
        icon: 'clock',
        priority: 'Low',
        enabled: true,
      },
    ];

    for (const action of defaultActions) {
      this.register(action);
    }
  }
}

export const actionRegistry = new ActionRegistry();
