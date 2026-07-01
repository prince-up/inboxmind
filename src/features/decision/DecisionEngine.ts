import { ActionGenerator } from './ActionGenerator';
import type { DecisionResult, IDecisionProvider } from './DecisionTypes';
import { RuleBasedDecisionProvider } from './RuleBasedDecisionProvider';
import { TimelineGenerator } from './TimelineGenerator';

export class DecisionEngine {
  private provider: IDecisionProvider;
  private actionGenerator: ActionGenerator;
  private timelineGenerator: TimelineGenerator;

  constructor(provider?: IDecisionProvider) {
    this.provider = provider ?? new RuleBasedDecisionProvider();
    this.actionGenerator = new ActionGenerator();
    this.timelineGenerator = new TimelineGenerator();
  }

  setProvider(provider: IDecisionProvider) {
    this.provider = provider;
  }

  setDebugMode(enabled: boolean) {
    if (this.provider instanceof RuleBasedDecisionProvider) {
      this.provider.setDebugMode(enabled);
    }
    this.actionGenerator.setDebugMode(enabled);
    this.timelineGenerator.setDebugMode(enabled);
  }

  async processEmail(
    subject: string,
    body: string,
    sender: string,
    emailId: string,
  ): Promise<DecisionResult | null> {
    console.log(`[PIPELINE] DecisionEngine.analyze() called for emailId: ${emailId}`);
    
    try {
      const decision = await this.provider.analyzeEmail(subject, body, sender, emailId);
      console.log(`[PIPELINE] RuleBasedDecisionProvider returned:`, decision ? 'Success' : 'Null');
      if (!decision) return null;

      decision.recommendedActions = this.actionGenerator.generateActions(decision);
      console.log(`[PIPELINE] Actions Generated:`, decision.recommendedActions.length);

      decision.timeline = this.timelineGenerator.generateTimeline(decision);
      console.log(`[PIPELINE] Timeline Generated:`, decision.timeline.length);
      console.log(`[PIPELINE] Decision Generated fully.`);

      return decision;
    } catch (err) {
      console.error(`[PIPELINE] DecisionEngine Error:`, err);
      throw err;
    }
  }
}

export const decisionEngine = new DecisionEngine();
