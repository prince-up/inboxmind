import type { DecisionResult } from '../decision/DecisionTypes';
import type { AgentTask } from './AgentTypes';

export class TaskPlanner {
  planTasks(decision: DecisionResult): AgentTask[] {
    const tasks: AgentTask[] = [];
    let idCounter = 1;

    const pushTask = (title: string, description: string) => {
      tasks.push({
        id: `task_${decision.category}_${idCounter++}_${Date.now()}`,
        title,
        description,
        status: 'Pending',
        createdAt: Date.now(),
      });
    };

    switch (decision.category) {
      case 'Recruitment':
        if (decision.subcategory === 'Interview') {
          pushTask('Prepare interview', 'Research the company and prepare your talking points.');
          pushTask('Add reminder', 'Block your calendar for the interview slot.');
          pushTask('Reply recruiter', 'Send a confirmation email to the recruiter.');
        } else if (decision.subcategory === 'Offer') {
          pushTask('Review package', 'Read through the compensation and benefits carefully.');
          pushTask('Compare benefits', 'Weigh this offer against any other opportunities.');
          pushTask('Accept / Reject', 'Make a final decision and notify HR.');
        } else if (decision.subcategory === 'Placement') {
          pushTask('Register', 'Sign up for the placement drive.');
          pushTask('Update Resume', 'Ensure your resume is up-to-date.');
        } else if (decision.subcategory === 'Recruiter') {
          pushTask('Reply', 'Acknowledge the recruiter\'s message.');
          pushTask('Follow up', 'Schedule a quick chat to discuss the opportunity.');
        }
        break;

      case 'Exam':
        if (decision.subcategory === 'Assessment') {
          pushTask('Complete before deadline', 'Ensure you submit the assessment on time.');
          pushTask('Prepare documents', 'Have your ID and required documents ready.');
          pushTask('Open attachment', 'Review any instructions attached.');
        } else if (decision.subcategory === 'Reporting') {
          pushTask('Save Venue', 'Note down the reporting venue and time.');
          pushTask('Prepare Documents', 'Gather hall tickets or required IDs.');
        }
        break;

      case 'Personal':
        if (decision.subcategory === 'OTP') {
          pushTask('Copy OTP', 'Copy the verification code to clipboard.');
          pushTask('Expires soon', 'Use the code immediately before it expires.');
        } else if (decision.subcategory === 'Travel') {
          pushTask('Save Ticket', 'Download your boarding pass or ticket.');
          pushTask('Web Check-in', 'Complete web check-in 24 hours before departure.');
        }
        break;

      case 'Finance':
        if (decision.subcategory === 'Bank') {
          pushTask('Verify Transaction', 'Ensure you authorized this bank activity.');
          pushTask('Download Statement', 'Save a copy for your records.');
        }
        break;

      case 'Other':
        if (decision.subcategory === 'Hackathon') {
          pushTask('Register Team', 'Create or join a team for the hackathon.');
          pushTask('Review Rules', 'Read the submission guidelines and rules.');
        }
        break;

      case 'Newsletter':
      case 'Marketing':
      case 'Promotion':
        pushTask('Archive', 'Archive this email to declutter your inbox.');
        pushTask('Ignore', 'Mark as read and ignore.');
        break;

      case 'Support':
        pushTask('Check Status', 'Check if the support ticket requires action.');
        break;
        
      default:
        pushTask('Review Email', 'Read the email to determine next steps.');
        if (decision.requiresReply) {
          pushTask('Reply', 'Draft a response.');
        }
    }

    return tasks;
  }
}
