import { reminderEngine } from './src/features/reminders/ReminderEngine';
import { decisionEngine } from './src/features/decision/DecisionEngine';
import { reminderStore } from './src/features/reminders/ReminderStore';

// Mock chrome.storage
const store: Record<string, any> = {};
(global as any).chrome = {
  storage: {
    local: {
      get: (key: string, cb: any) => cb({ [key]: store[key] }),
      set: (data: any, cb: any) => {
        Object.assign(store, data);
        if (cb) cb();
      }
    }
  },
  alarms: {
    create: () => {},
    clear: () => {}
  }
};

const mockEmail = {
  id: 'test_email_1',
  threadId: 'thread_123',
  subject: 'Interview Invitation: Google',
  bodyText: 'We would like to invite you to interview. Please use this link: https://meet.google.com/abc-defg-hij',
  sender: { address: 'recruiter@google.com', name: 'Google Recruiter' },
  recipients: [],
  date: new Date().toISOString()
};

async function run() {
  console.log("=== STARTING TEST ===");
  decisionEngine.setDebugMode(true);
  
  await reminderEngine.processParsedEmail(mockEmail as any);
  
  const reminders = await reminderStore.getReminders();
  console.log("=== STORED REMINDERS ===");
  console.log(JSON.stringify(reminders, null, 2));
}

run().catch(console.error);
