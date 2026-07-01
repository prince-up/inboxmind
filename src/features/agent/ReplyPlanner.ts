import type { DecisionResult } from '../decision/DecisionTypes';
import type { ReplyIntent } from './AgentTypes';

export class ReplyPlanner {
  planReplies(decision: DecisionResult): ReplyIntent[] {
    const replies: ReplyIntent[] = [];
    let idCounter = 1;

    const pushReply = (intent: string, label: string, icon: string) => {
      replies.push({
        id: `reply_${decision.category}_${idCounter++}_${Date.now()}`,
        intent,
        label,
        icon,
      });
    };

    switch (decision.category) {
      case 'Recruitment':
        if (decision.subcategory === 'Interview') {
          pushReply('Schedule Interview', 'Schedule Interview', '📅');
          pushReply('Confirm Attendance', 'Confirm Attendance', '✅');
          pushReply('Ask Question', 'Ask Question', '❓');
        } else if (decision.subcategory === 'Offer') {
          pushReply('Accept Offer', 'Accept Offer', '🎉');
          pushReply('Decline Offer', 'Decline Offer', '❌');
          pushReply('Request Extension', 'Request Extension', '⏳');
        } else if (decision.subcategory === 'Recruiter') {
          pushReply('Reply Interested', 'Interested', '👍');
          pushReply('Reply Not Interested', 'Not Interested', '👎');
          pushReply('Follow Up', 'Follow Up', '👋');
        } else if (decision.subcategory === 'Rejection') {
          pushReply('Thank Recruiter', 'Thank Recruiter', '🙏');
          pushReply('Request Feedback', 'Ask for Feedback', '📈');
        }
        break;

      case 'Exam':
        if (decision.subcategory === 'Assessment') {
          pushReply('Confirm Receipt', 'Confirm Receipt', '✅');
          pushReply('Report Issue', 'Report Tech Issue', '⚠️');
        }
        break;

      case 'Support':
        pushReply('Provide More Info', 'Provide More Info', '📄');
        pushReply('Close Ticket', 'Close Ticket', '🔒');
        break;

      case 'Other':
        if (decision.subcategory === 'Hackathon') {
          pushReply('Confirm Registration', 'Confirm Registration', '✅');
          pushReply('Ask Question', 'Ask Question', '❓');
        }
        break;

      default:
        if (decision.requiresReply) {
          pushReply('Acknowledge', 'Acknowledge', '👍');
          pushReply('Ask Question', 'Ask Question', '❓');
        }
        break;
    }

    return replies;
  }
}
