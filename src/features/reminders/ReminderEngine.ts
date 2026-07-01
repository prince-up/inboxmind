import type { Email } from '../../types/email';
import { agentEngine } from '../agent/AgentEngine';
import { decisionEngine } from '../decision/DecisionEngine';
import { reminderScheduler } from './ReminderScheduler';
import { reminderStore } from './ReminderStore';
import type { Reminder } from './ReminderTypes';



export class ReminderEngine {
  async processParsedEmail(email: Email): Promise<void> {
    console.log(`[PIPELINE] ReminderEngine called for threadId: ${email.threadId}`);
    try {
      const decision = await decisionEngine.processEmail(
        email.subject,
        email.bodyText,
        email.sender.address,
        email.id,
      );

      if (!decision) {
        console.log(`[PIPELINE] ReminderEngine aborting: decision is null`);
        return;
      }

      const reminderId = `rem_${email.threadId}`;

      const reminder: Reminder = {
        ...decision,
        id: reminderId,
        emailId: email.id,
        threadId: email.threadId,
        subject: email.subject,
        status: 'Pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log(`[PIPELINE] Reminder Store Saving... threadId: ${reminder.threadId}`);
      await reminderStore.saveReminder(reminder);
      console.log(`[PIPELINE] Store Updated Successfully.`);
      
      reminderScheduler.scheduleAlarms(reminder);

      console.log(`[PIPELINE] Calling AgentEngine...`);
      await agentEngine.processEmail(decision, email.threadId);
      console.log(`[PIPELINE] ReminderEngine Completed for threadId: ${email.threadId}`);
    } catch (err) {
      console.error(`[PIPELINE] ReminderEngine Error:`, err);
    }
  }
}

export const reminderEngine = new ReminderEngine();
