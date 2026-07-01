import { reminderEngine } from '../features/reminders/ReminderEngine';

import '../features/reminders/NotificationEngine';

import type { Email } from '../types/email';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse) => {
    const msg = message as { type?: string; payload?: unknown };
    if (msg.type === 'PROCESS_PARSED_EMAIL' && msg.payload) {
      const email = msg.payload as Email;
      void reminderEngine.processParsedEmail(email).catch(console.error);
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
  },
);
