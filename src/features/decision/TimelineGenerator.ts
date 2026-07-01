import type { DecisionResult, TimelineEvent } from './DecisionTypes';

export class TimelineGenerator {
  private debugMode = false;

  public setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  generateTimeline(decision: DecisionResult): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];
    let idCounter = 1;
    let baseTime = Date.now() - 5000;

    if (this.debugMode) {
      console.log('\n--- DEBUG MODE: TimelineGenerator ---');
    }

    const pushEvent = (title: string, description: string, status: TimelineEvent['status']) => {
      timeline.push({
        id: `tl_${decision.category}_${idCounter++}`,
        title,
        description,
        status,
        timestamp: baseTime,
      });
      baseTime += 1000;
      
      if (this.debugMode) {
        console.log(`-> Pushed Event: [${title}] - ${description}`);
      }
    };

    // 1. Email Received
    pushEvent('Email Received', 'The email was received successfully.', 'Completed');

    // 2. Email Parsed
    pushEvent('Email Parsed', 'Successfully parsed email contents and structured data.', 'Completed');

    // 3. Intent Classified
    if (decision.category === 'Unknown') {
      pushEvent('Intent Classified', 'Could not confidently classify intent automatically.', 'Missed');
    } else {
      pushEvent('Intent Classified', `Classified as ${decision.subcategory ?? decision.category} with ${Math.round(decision.confidence * 100)}% confidence.`, 'Completed');
    }

    // 4. Actions Generated
    if (decision.recommendedActions.length > 0) {
      pushEvent('Actions Generated', `Generated ${decision.recommendedActions.length} contextual actions for this thread.`, 'Completed');
    } else {
      pushEvent('Actions Generated', 'No specific actions required.', 'Completed');
    }

    // 5. Waiting for User (or completion)
    if (decision.recommendedActions.length > 0) {
      pushEvent('Waiting for User', 'Waiting for you to complete the pending actions.', 'Pending');
    } else {
      pushEvent('Completed', 'No further action required.', 'Active');
    }

    // Append Category-specific events dynamically
    if (decision.category === 'Recruitment' && decision.subcategory === 'Interview') {
      pushEvent('Interview Scheduled', 'An interview is approaching. Prepare your profile.', 'Pending');
    }

    if (this.debugMode) {
      console.log('---------------------------------------');
    }

    return timeline;
  }
}
