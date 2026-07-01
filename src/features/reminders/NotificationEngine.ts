import { reminderScheduler } from './ReminderScheduler';
import { reminderStore } from './ReminderStore';
import type { Reminder } from './ReminderTypes';

export class NotificationEngine {
  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof chrome !== 'undefined' && chrome.alarms) {
      chrome.alarms.onAlarm.addListener((alarm) => {
        void this.handleAlarm(alarm);
      });
      chrome.notifications.onButtonClicked.addListener((id, index) => {
        void this.handleButtonClick(id, index);
      });
      chrome.notifications.onClicked.addListener((id) => {
        void this.handleNotificationClick(id);
      });
    }
  }

  private async handleAlarm(alarm: chrome.alarms.Alarm) {
    if (alarm.name.startsWith('reminder_')) {
      const parts = alarm.name.split('_');
      const reminderId = parts[1];

      const reminders = await reminderStore.getReminders();
      const reminder = reminders.find((r) => r.id === reminderId);

      if (reminder && reminder.status === 'Pending') {
        this.triggerNotification(reminder);
      }
    }
  }

  private triggerNotification(reminder: Reminder) {
    const actions = reminder.recommendedActions ?? [];
    const firstAction = actions[0];
    const options: chrome.notifications.NotificationOptions<true> = {
      type: 'basic',
      iconUrl: 'icon-128.png', // Assuming icon exists
      title: `${reminder.category} Reminder`,
      message: reminder.subject,
      contextMessage: firstAction ? firstAction.title : 'Action Required',
      priority:
        reminder.priority === 'Critical'
          ? 2
          : reminder.priority === 'High'
            ? 1
            : 0,
      buttons: [{ title: 'Open Gmail' }, { title: 'Mark Done' }],
    };

    chrome.notifications.create(`notify_${reminder.id}`, options);
  }

  private async handleButtonClick(notificationId: string, buttonIndex: number) {
    if (!notificationId.startsWith('notify_')) return;

    const reminderId = notificationId.replace('notify_', '');

    if (buttonIndex === 0) {
      // Open Gmail - need to focus or create a tab for the thread
      const reminders = await reminderStore.getReminders();
      const reminder = reminders.find((r) => r.id === reminderId);
      if (reminder) {
        void chrome.tabs.create({
          url: `https://mail.google.com/mail/u/0/#inbox/${reminder.threadId}`,
        });
      }
    } else if (buttonIndex === 1) {
      // Mark Done
      await reminderStore.updateStatus(reminderId, 'Completed');
      reminderScheduler.clearAlarms(reminderId);
      chrome.notifications.clear(notificationId);
    }
  }

  private async handleNotificationClick(notificationId: string) {
    if (!notificationId.startsWith('notify_')) return;
    const reminderId = notificationId.replace('notify_', '');

    const reminders = await reminderStore.getReminders();
    const reminder = reminders.find((r) => r.id === reminderId);
    if (reminder) {
      void chrome.tabs.create({
        url: `https://mail.google.com/mail/u/0/#inbox/${reminder.threadId}`,
      });
      chrome.notifications.clear(notificationId);
    }
  }
}

export const notificationEngine = new NotificationEngine();
