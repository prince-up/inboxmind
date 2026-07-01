import type { DecisionResult } from '../../decision/DecisionTypes';
import type { AgentSnapshot, IAgentProvider } from '../AgentTypes';
import { MemoryEngine } from '../MemoryEngine';
import { NotificationPlanner } from '../NotificationPlanner';
import { ReplyPlanner } from '../ReplyPlanner';
import { SuggestionEngine } from '../SuggestionEngine';
import { TaskPlanner } from '../TaskPlanner';

export class RuleBasedAgentProvider implements IAgentProvider {
  private taskPlanner = new TaskPlanner();
  private suggestionEngine = new SuggestionEngine();
  private replyPlanner = new ReplyPlanner();
  private notificationPlanner = new NotificationPlanner();
  private memoryEngine = new MemoryEngine();

  async process(decision: DecisionResult, conversationId: string): Promise<AgentSnapshot> {
    const tasks = this.taskPlanner.planTasks(decision);
    const memory = await this.memoryEngine.updateWithNewTasks(conversationId, tasks, decision);
    const insights = this.suggestionEngine.generateInsights(decision, memory);
    const suggestedReplies = this.replyPlanner.planReplies(decision);
    
    // Check if notification is needed
    const shouldNotify = this.notificationPlanner.shouldNotify(decision);
    if (shouldNotify) {
      console.log(`[NotificationPlanner] Triggering notification for highly urgent/critical task in thread ${conversationId}.`);
      // In a real app, chrome.notifications.create would be called here.
    }

    // Generate a mock Daily Digest (in reality this would scan all memories)
    const digest = {
      interviewsCount: decision.subcategory === 'Interview' ? 1 : 0,
      assessmentsCount: decision.subcategory === 'Assessment' ? 1 : 0,
      expiringOffersCount: decision.subcategory === 'Offer' ? 1 : 0,
      unreadRecruitersCount: decision.subcategory === 'Recruiter' ? 1 : 0,
      pendingRepliesCount: decision.requiresReply ? 1 : 0,
    };

    return {
      conversationId,
      dailyDigest: digest,
      pendingTasks: tasks,
      suggestedReplies,
      insights,
      memory,
    };
  }
}
