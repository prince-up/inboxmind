import type { DecisionResult } from '../decision/DecisionTypes';

export class NotificationPlanner {
  shouldNotify(decision: DecisionResult): boolean {
    // Only trigger high priority or deadline driven notifications to avoid spam
    if (decision.priority === 'Critical') {
      return true;
    }
    
    if (decision.requiresReminder && decision.urgency && decision.urgency > 8) {
      return true;
    }

    if (decision.category === 'Personal' && decision.subcategory === 'OTP') {
      return true;
    }

    return false;
  }
}
