import type { Reminder, ReminderStatus } from './ReminderTypes';

const STORAGE_KEY = 'inboxmind_reminders';

export class ReminderStore {
  async getReminders(): Promise<Reminder[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve((result[STORAGE_KEY] as Reminder[]) ?? []);
      });
    });
  }

  async saveReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders();
    const existingIndex = reminders.findIndex((r) => r.id === reminder.id);

    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: reminders }, resolve);
    });
  }

  async updateStatus(id: string, status: ReminderStatus): Promise<void> {
    const reminders = await this.getReminders();
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      reminder.status = status;
      reminder.updatedAt = Date.now();
      await new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: reminders }, () =>
          resolve(undefined),
        );
      });
    }
  }

  async deleteReminder(id: string): Promise<void> {
    const reminders = await this.getReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: filtered }, resolve);
    });
  }
}

export const reminderStore = new ReminderStore();
