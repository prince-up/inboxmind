import type { ActionDef, DecisionResult } from './DecisionTypes';

export class ActionGenerator {
  private debugMode = false;

  public setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  generateActions(decision: DecisionResult): ActionDef[] {
    const actions: ActionDef[] = [];
    let idCounter = 1;

    if (this.debugMode) {
      console.log('\n--- DEBUG MODE: ActionGenerator ---');
      console.log(`Generating actions for ${decision.category} -> ${decision.subcategory}`);
    }

    const pushAction = (
      title: string,
      description: string,
      priority: ActionDef['priority'],
      icon: string,
      estimatedTime?: string,
    ) => {
      const action: ActionDef = {
        id: `action_${decision.category}_${idCounter++}`,
        title,
        description,
        priority,
        enabled: true,
        reason: `Generated from ${decision.subcategory ?? decision.category} intent.`,
        icon,
      };
      if (estimatedTime) {
        action.estimatedTime = estimatedTime;
      }
      actions.push(action);
      
      if (this.debugMode) {
        console.log(`-> Generated Action: [${title}]`);
      }
    };

    switch (decision.subcategory) {
      case 'Job Alert':
        pushAction('View Jobs', 'Review the available job postings.', 'High', '👀');
        pushAction('Save Jobs', 'Bookmark these roles for later.', 'Medium', '⭐');
        pushAction('Apply Later', 'Add to your apply queue.', 'Medium', '⏳');
        pushAction('Archive', 'Archive if not relevant.', 'Low', '🗄️');
        break;

      case 'Recruiter Outreach':
      case 'Recruiter':
        pushAction('Reply', 'Send a quick reply to the recruiter.', 'Critical', '↩️', '5 mins');
        if (decision.context?.companyName) {
          pushAction('View Company', `Research ${decision.context.companyName}.`, 'High', '🏢', '10 mins');
        } else {
          pushAction('View Company', 'Research the company.', 'High', '🏢', '10 mins');
        }
        pushAction('Schedule Follow-up', 'Set a reminder to follow up.', 'Medium', '📅');
        break;

      case 'Interview':
        pushAction('Add to Calendar', 'Add interview slot to your calendar.', 'Critical', '📅', '2 mins');
        pushAction('Prepare Interview', 'Review company profile and role requirements.', 'High', '📝', '1 hour');
        if (decision.context?.meetingLink) {
          pushAction('Open Meeting Link', 'Join the scheduled meeting.', 'Critical', '🎥');
        }
        break;

      case 'Assessment':
        pushAction('Download Instructions', 'Gather required files for the assessment.', 'High', '📄', '5 mins');
        pushAction('Start Assessment', 'Begin the test when ready.', 'Critical', '💻');
        pushAction('Set Reminder', 'Set a reminder to complete before deadline.', 'High', '⏰');
        break;
        
      case 'Offer Letter':
        pushAction('Review Offer', 'Carefully read the offer details and joining conditions.', 'Critical', '📋', '30 mins');
        pushAction('Compare Benefits', 'Analyze CTC and benefits package.', 'Medium', '📊', '45 mins');
        pushAction('Accept', 'Accept the offer.', 'Critical', '✅');
        pushAction('Reject', 'Politely decline the offer.', 'Medium', '❌');
        break;

      case 'OTP':
        if (decision.context?.otpCode) {
          pushAction('Copy OTP', `Copy code ${decision.context.otpCode} to clipboard.`, 'Critical', '📋');
        } else {
          pushAction('Copy OTP', 'Copy code to clipboard.', 'Critical', '📋');
        }
        pushAction('Open App', 'Return to the application.', 'High', '📱');
        pushAction('Security Warning', 'Never share this OTP with anyone.', 'Critical', '⚠️');
        break;

      case 'Newsletter':
      case 'Marketing':
        pushAction('Archive', 'Archive this email to declutter your inbox.', 'Low', '🗄️');
        pushAction('Unsubscribe', 'Opt-out of future emails.', 'Low', '🚫');
        pushAction('Save for Later', 'Save this to your reading list.', 'Low', '📖');
        break;
        
      case 'Banking':
        pushAction('Verify Transaction', 'Ensure this transaction was authorized by you.', 'Critical', '💳', '2 mins');
        pushAction('Download Statement', 'Save statement for your records.', 'Low', '⬇️');
        break;

      default:
        pushAction('Review Email', 'Review the contents of this email.', 'Low', '👀');
        if (decision.requiresReply) {
          pushAction('Reply', 'Draft a response.', 'Medium', '↩️');
        }
    }

    if (this.debugMode) {
      console.log('---------------------------------------');
    }

    return actions;
  }
}
