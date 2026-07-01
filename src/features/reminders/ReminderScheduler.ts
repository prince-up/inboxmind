import type { Reminder } from './ReminderTypes';

export class ReminderScheduler {
  scheduleAlarms(reminder: Reminder) {
    if (reminder.status !== 'Pending') return;

    // Clear existing alarms for this reminder
    this.clearAlarms(reminder.id);

    // Schedule new alarms based on the reminderStrategy
    reminder.reminderStrategy?.forEach((offsetMs: number, index: number) => {
      const alarmName = `reminder_${reminder.id}_${index}`;
      const triggerTime = reminder.createdAt + offsetMs;

      // Only schedule if it's in the future
      if (triggerTime > Date.now()) {
        void chrome.alarms.create(alarmName, {
          when: triggerTime,
        });
      }
    });
  }

  clearAlarms(reminderId: string) {
    chrome.alarms.getAll((alarms) => {
      alarms.forEach((alarm) => {
        if (alarm.name.startsWith(`reminder_${reminderId}_`)) {
          void chrome.alarms.clear(alarm.name);
        }
      });
    });
  }
}

export const reminderScheduler = new ReminderScheduler();
