export type EmailCategory =
  | 'Recruitment'
  | 'Exam'
  | 'Finance'
  | 'Support'
  | 'Personal'
  | 'Newsletter'
  | 'Promotion'
  | 'Marketing'
  | 'Other'
  | 'Unknown'
  | (string & {});

export type EmailPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ActionDef {
  id: string;
  title: string;
  description: string;
  priority: EmailPriority;
  enabled: boolean;
  reason: string;
  icon?: string;
  estimatedTime?: string;
  handler?: () => void | Promise<void>;
}

export type TimelineEventStatus = 'Pending' | 'Completed' | 'Missed' | 'Active';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  status: TimelineEventStatus;
  description: string;
  type?: string;
  title?: string;
}

export interface CalendarEvent {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  timeZone?: string;
  location?: string;
  meetingLink?: string;
  organizer?: string;
  company?: string;
  description?: string;
}

export interface DecisionResult {
  category: EmailCategory;
  subcategory?: string;
  priority: EmailPriority;
  confidence: number;
  reasoning: string;
  detectedSignals: string[];
  summary: string;
  recommendedActions: ActionDef[];
  timeline: TimelineEvent[];
  requiresReply: boolean;
  requiresReminder: boolean;
  requiresCalendar: boolean;
  reminderStrategy?: number[];
  deadline?: string;
  followUpDate?: string;
  urgency?: number;
  metadata?: Record<string, unknown>;
  context?: {
    calendarEvent?: CalendarEvent;
    otpCode?: string;
    companyName?: string;
    meetingLink?: string;
    deadline?: string;
    [key: string]: unknown;
  };
}

export interface IntentResult {
  category: EmailCategory;
  confidence: number;
  signalsMatched: string[];
}

export interface IDecisionProvider {
  analyzeEmail(
    subject: string,
    body: string,
    sender: string,
    emailId: string,
  ): Promise<DecisionResult | null>;
}
