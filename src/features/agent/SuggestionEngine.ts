import type { DecisionResult } from '../decision/DecisionTypes';
import type { AgentInsight, AgentMemory } from './AgentTypes';

export class SuggestionEngine {
  generateInsights(decision: DecisionResult, memory: AgentMemory | undefined): AgentInsight[] {
    const insights: AgentInsight[] = [];
    let idCounter = 1;

    const pushInsight = (text: string, icon: string) => {
      insights.push({
        id: `insight_${idCounter++}_${Date.now()}`,
        text,
        icon,
      });
    };

    // Generic Insights
    if (decision.deadline) {
      pushInsight(`This deadline is approaching: ${decision.deadline}.`, '⏰');
    }

    if (decision.requiresReply) {
      pushInsight('This email probably needs a reply.', '↩️');
    }

    // Memory-based insights
    if (memory) {
      if (memory.completedTasks.length > 0) {
        pushInsight(`You have already completed ${memory.completedTasks.length} tasks for this thread.`, '✅');
      }

      const timeSinceLast = Date.now() - memory.lastAnalysisTimestamp;
      const daysSinceLast = Math.floor(timeSinceLast / (1000 * 60 * 60 * 24));

      if (daysSinceLast > 3 && decision.category === 'Recruitment') {
        pushInsight(`You have ignored this recruiter for ${daysSinceLast} days.`, '⚠️');
      }
    }

    // Global rules based on category
    if (decision.category === 'Recruitment' && decision.subcategory === 'Offer') {
      pushInsight('You received an offer! Make sure to review the terms carefully.', '🎉');
    }

    if (decision.category === 'Personal' && decision.subcategory === 'OTP') {
      pushInsight('This code is highly sensitive. Do not share it.', '🔒');
    }

    return insights;
  }
}
