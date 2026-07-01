import type { DecisionResult, EmailCategory, EmailPriority, IDecisionProvider } from './DecisionTypes';

interface SignalPattern {
  pattern: RegExp;
  score: number;
  signal: string;
}

interface CategoryDef {
  category: EmailCategory;
  subcategories: {
    name: string;
    subjectPatterns: SignalPattern[];
    senderPatterns: SignalPattern[];
    bodyPatterns: SignalPattern[];
    negativePatterns: RegExp[];
  }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    category: 'Recruitment',
    subcategories: [
      {
        name: 'Job Alert',
        subjectPatterns: [
          { pattern: /job alert|job recommendations|new jobs|positions matching|interest in your profile|latest job/i, score: 50, signal: 'Job alert keywords in subject' },
          { pattern: /opportunities at|new company/i, score: 40, signal: 'Opportunities keywords in subject' }
        ],
        senderPatterns: [
          { pattern: /alert|jobs|careers|noreply/i, score: 10, signal: 'Sender implies automated jobs' }
        ],
        bodyPatterns: [
          { pattern: /jobs match your profile|interest in your profile|latest job/i, score: 30, signal: 'Profile match text' },
          { pattern: /apply now|view job|view listings/i, score: 20, signal: 'Apply call to action' }
        ],
        negativePatterns: [/interview/i, /offer/i]
      },
      {
        name: 'Recruiter Outreach',
        subjectPatterns: [
          { pattern: /reaching out|opportunity|your profile|career|interest in your profile/i, score: 40, signal: 'Recruiter outreach in subject' }
        ],
        senderPatterns: [
          { pattern: /recruiter|talent|acquisition|sourcer/i, score: 50, signal: 'Sender is a recruiter' }
        ],
        bodyPatterns: [
          { pattern: /quick chat|discuss your background|impressive profile/i, score: 30, signal: 'Recruiter chat request' },
          { pattern: /are you open to/i, score: 30, signal: 'Asking if open to roles' }
        ],
        negativePatterns: [/newsletter/i, /job alert/i]
      },
      {
        name: 'Placement',
        subjectPatterns: [
          { pattern: /campus placement|placement drive|campus recruitment/i, score: 60, signal: 'Campus placement in subject' }
        ],
        senderPatterns: [
          { pattern: /placement|tpo/i, score: 40, signal: 'Sender is placement cell' }
        ],
        bodyPatterns: [
          { pattern: /eligible students|register for/i, score: 30, signal: 'Placement registration' }
        ],
        negativePatterns: []
      },
      {
        name: 'Internship',
        subjectPatterns: [
          { pattern: /internship|intern/i, score: 50, signal: 'Internship in subject' }
        ],
        senderPatterns: [],
        bodyPatterns: [
          { pattern: /internship program|summer intern/i, score: 30, signal: 'Internship mentioned in body' }
        ],
        negativePatterns: []
      },
      {
        name: 'Interview',
        subjectPatterns: [
          { pattern: /interview|invitation to interview|schedule/i, score: 60, signal: 'Interview in subject' }
        ],
        senderPatterns: [
          { pattern: /hr|talent|recruitment/i, score: 20, signal: 'HR sender' }
        ],
        bodyPatterns: [
          { pattern: /interview with|speak with|scheduled for/i, score: 40, signal: 'Interview context in body' },
          { pattern: /zoom|google meet|teams/i, score: 20, signal: 'Meeting link presence' }
        ],
        negativePatterns: [/rejection/i, /unfortunately/i]
      },
      {
        name: 'Assessment',
        subjectPatterns: [
          { pattern: /online test|assessment|hackerrank|coderbyte|oa/i, score: 60, signal: 'Assessment in subject' }
        ],
        senderPatterns: [
          { pattern: /admin|assessments|hackerrank/i, score: 30, signal: 'Assessment platform sender' }
        ],
        bodyPatterns: [
          { pattern: /test link|complete the assessment|time limit/i, score: 40, signal: 'Assessment instructions' }
        ],
        negativePatterns: []
      },
      {
        name: 'Offer Letter',
        subjectPatterns: [
          { pattern: /offer of employment|job offer|offer letter/i, score: 70, signal: 'Offer in subject' }
        ],
        senderPatterns: [
          { pattern: /hr|people|talent/i, score: 20, signal: 'HR sender' }
        ],
        bodyPatterns: [
          { pattern: /pleased to offer|compensation|ctc|benefits/i, score: 50, signal: 'Offer details in body' },
          { pattern: /joining date|onboarding/i, score: 30, signal: 'Joining date mentioned' }
        ],
        negativePatterns: [/discount/i, /special offer/i]
      }
    ]
  },
  {
    category: 'Personal',
    subcategories: [
      {
        name: 'OTP',
        subjectPatterns: [
          { pattern: /otp|verification code|verify your/i, score: 60, signal: 'OTP in subject' }
        ],
        senderPatterns: [
          { pattern: /verify|auth|security|whatsapp/i, score: 30, signal: 'Auth sender' }
        ],
        bodyPatterns: [
          { pattern: /your code is|verification code|don't share/i, score: 50, signal: 'Code instructions' }
        ],
        negativePatterns: [/offer/i]
      },
      {
        name: 'Security Alert',
        subjectPatterns: [
          { pattern: /security alert|new login|sign-in from/i, score: 70, signal: 'Security alert in subject' }
        ],
        senderPatterns: [
          { pattern: /security|accounts|no-reply/i, score: 20, signal: 'Security sender' }
        ],
        bodyPatterns: [
          { pattern: /was this you|unrecognized device/i, score: 40, signal: 'Unrecognized activity' }
        ],
        negativePatterns: []
      }
    ]
  },
  {
    category: 'Newsletter',
    subcategories: [
      {
        name: 'Newsletter',
        subjectPatterns: [
          { pattern: /weekly|monthly|digest|edition|issue/i, score: 30, signal: 'Newsletter frequency in subject' }
        ],
        senderPatterns: [
          { pattern: /newsletter|digest/i, score: 30, signal: 'Newsletter sender' }
        ],
        bodyPatterns: [
          { pattern: /unsubscribe|manage preferences|view in browser/i, score: 40, signal: 'Unsubscribe link present' }
        ],
        negativePatterns: [/interview/i, /offer/i, /otp/i]
      },
      {
        name: 'Marketing',
        subjectPatterns: [
          { pattern: /sale|discount|off|deal/i, score: 40, signal: 'Marketing subject' }
        ],
        senderPatterns: [
          { pattern: /promo|marketing|sales/i, score: 30, signal: 'Marketing sender' }
        ],
        bodyPatterns: [
          { pattern: /shop now|limited time|save big/i, score: 40, signal: 'Marketing call to action' }
        ],
        negativePatterns: [/interview/i, /offer/i, /otp/i]
      }
    ]
  },
  {
    category: 'Finance',
    subcategories: [
      {
        name: 'Banking',
        subjectPatterns: [
          { pattern: /statement|transaction|debited|credited|account update/i, score: 50, signal: 'Banking subject' }
        ],
        senderPatterns: [
          { pattern: /bank|alerts|statements/i, score: 40, signal: 'Bank sender' }
        ],
        bodyPatterns: [
          { pattern: /account ending in|balance|amount|inr|usd/i, score: 40, signal: 'Financial details' }
        ],
        negativePatterns: [/discount/i]
      },
      {
        name: 'Billing',
        subjectPatterns: [
          { pattern: /invoice|receipt|payment received|subscription/i, score: 60, signal: 'Billing subject' }
        ],
        senderPatterns: [
          { pattern: /billing|invoice|receipts/i, score: 30, signal: 'Billing sender' }
        ],
        bodyPatterns: [
          { pattern: /total amount|paid|due date|credit card/i, score: 40, signal: 'Billing details' }
        ],
        negativePatterns: []
      }
    ]
  },
  {
    category: 'Support',
    subcategories: [
      {
        name: 'Support Ticket',
        subjectPatterns: [
          { pattern: /ticket|support|request received|case/i, score: 50, signal: 'Support ticket subject' }
        ],
        senderPatterns: [
          { pattern: /support|help|service|care/i, score: 40, signal: 'Support sender' }
        ],
        bodyPatterns: [
          { pattern: /ticket number|reference|we are reviewing/i, score: 40, signal: 'Support body context' }
        ],
        negativePatterns: []
      }
    ]
  },
  {
    category: 'Other',
    subcategories: [
      {
        name: 'Social Notifications',
        subjectPatterns: [
          { pattern: /mentioned you|liked your|commented|connection/i, score: 50, signal: 'Social subject' }
        ],
        senderPatterns: [
          { pattern: /linkedin|twitter|facebook|instagram/i, score: 50, signal: 'Social sender' }
        ],
        bodyPatterns: [
          { pattern: /view profile|reply to|see what/i, score: 30, signal: 'Social call to action' }
        ],
        negativePatterns: []
      },
      {
        name: 'Calendar Invites',
        subjectPatterns: [
          { pattern: /invitation:|accepted:|declined:/i, score: 60, signal: 'Calendar subject' }
        ],
        senderPatterns: [
          { pattern: /calendar/i, score: 40, signal: 'Calendar sender' }
        ],
        bodyPatterns: [
          { pattern: /when:|where:|who:/i, score: 50, signal: 'Calendar details' }
        ],
        negativePatterns: []
      },
      {
        name: 'Event Invitations',
        subjectPatterns: [
          { pattern: /you're invited|join us|event|webinar/i, score: 50, signal: 'Event subject' }
        ],
        senderPatterns: [
          { pattern: /events|webinar/i, score: 30, signal: 'Event sender' }
        ],
        bodyPatterns: [
          { pattern: /register now|save your spot/i, score: 40, signal: 'Event registration' }
        ],
        negativePatterns: []
      }
    ]
  }
];

export class RuleBasedDecisionProvider implements IDecisionProvider {
  private debugMode = false;

  public setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  async analyzeEmail(
    subject: string,
    body: string,
    sender: string,
    emailId: string,
  ): Promise<DecisionResult | null> {
    console.log(`[PIPELINE] RuleBasedDecisionProvider.analyzeEmail() input:`, { subject, bodyLength: body?.length, sender });
    
    await Promise.resolve();
    if (!subject && !body && !sender) {
      console.log(`[PIPELINE] RuleBasedDecisionProvider aborting: empty input`);
      return null;
    }

    if (this.debugMode) {
      console.log(`\n--- DEBUG MODE: RuleBasedDecisionProvider ---`);
      console.log(`Analyzing Email: Sub="${subject}", Sender="${sender}", ID="${emailId}"`);
    }

    let bestCategory: EmailCategory = 'Unknown';
    let bestSubcategory = 'Unknown';
    let bestScore = 0;
    let finalSignals: string[] = [];

    for (const categoryDef of CATEGORIES) {
      for (const sub of categoryDef.subcategories) {
        let score = 0;
        const matchedSignals: string[] = [];

        // Check negative patterns first
        const isNegativeMatch = sub.negativePatterns.some((pattern) =>
          pattern.test(subject) || pattern.test(body),
        );

        if (isNegativeMatch) {
          if (this.debugMode) {
            console.log(`-> Skipped [${categoryDef.category} - ${sub.name}]: Negative match.`);
          }
          continue;
        }

        // Test Subject
        for (const rule of sub.subjectPatterns) {
          if (rule.pattern.test(subject)) {
            score += rule.score;
            matchedSignals.push(`Subject: ${rule.signal}`);
          }
        }

        // Test Sender
        for (const rule of sub.senderPatterns) {
          if (rule.pattern.test(sender)) {
            score += rule.score;
            matchedSignals.push(`Sender: ${rule.signal}`);
          }
        }

        // Test Body
        for (const rule of sub.bodyPatterns) {
          if (rule.pattern.test(body)) {
            score += rule.score;
            matchedSignals.push(`Body: ${rule.signal}`);
          }
        }

        if (this.debugMode && score > 0) {
          console.log(`-> Checked [${categoryDef.category} - ${sub.name}]: Score = ${score}`);
          console.log(`   Matches: ${matchedSignals.join(', ')}`);
        }

        if (score > bestScore) {
          bestScore = score;
          bestCategory = categoryDef.category;
          bestSubcategory = sub.name;
          finalSignals = matchedSignals;
        }
      }
    }

    // Normalized Confidence (0.0 - 1.0)
    let confidence = 0;
    if (bestScore > 0) {
      confidence = bestScore / 100;
      if (confidence > 1.0) confidence = 1.0;
      if (confidence < 0.0) confidence = 0.0;
    }

    // Require at least 40 score to confidently categorize
    if (bestScore < 40) {
      if (this.debugMode) {
        console.log('=> Yielding Unknown intent (below 40 threshold).');
      }
      return {
        category: 'Unknown',
        priority: 'Low',
        confidence: 0,
        summary: 'This email could not be definitively classified into any specific category.',
        reasoning: 'No specific intent signals matched the required threshold of confidence.',
        detectedSignals: [],
        requiresReply: false,
        requiresReminder: false,
        requiresCalendar: false,
        recommendedActions: [],
        timeline: [],
        context: {}
      };
    }

    if (this.debugMode) {
      console.log(`=> Winning Category: ${bestCategory} (${bestSubcategory}) with Score = ${bestScore}`);
    }

    let priority: EmailPriority = 'Low';
    if (bestScore >= 80) priority = 'Critical';
    else if (bestScore >= 60) priority = 'High';
    else if (bestScore >= 50) priority = 'Medium';

    // Context Extraction
    const context: NonNullable<DecisionResult['context']> = {};
    
    // Extract OTP
    if (bestSubcategory === 'OTP') {
      const otpRegex = /\b\d{4,8}\b/g;
      const otps = body.match(otpRegex);
      if (otps && otps.length > 0) {
        // Find the most likely OTP (usually 6 digits)
        const bestOtp = otps.find((o) => o.length === 6) ?? otps[0];
        context.otpCode = bestOtp;
      }
    }

    // Extract Company Name
    const companyRegex = /(?:from|at)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?(?:'s)?)/g;
    const subjectMatch = subject.match(companyRegex);
    const bodyMatch = body.match(companyRegex);
    const companyMatches = bodyMatch ?? subjectMatch;
    
    if (companyMatches && companyMatches.length > 0) {
      const companyString = companyMatches[0];
      if (companyString) {
        context.companyName = companyString.replace(/from\s+|at\s+/i, '').trim();
      }
    }

    // Extract Meeting Link
    const linkRegex = /(https:\/\/(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com)\/[^\s"']+)/i;
    const linkMatch = linkRegex.exec(body);
    if (linkMatch?.[1]) {
      context.meetingLink = linkMatch[1];
    }

    // Extract Deadline
    const deadlineRegex = /(?:deadline|complete before|due by|valid until)\s*[:-]?\s*([^\n.,]+)/i;
    const deadlineMatch = deadlineRegex.exec(body);
    if (deadlineMatch?.[1]) {
      context.deadline = deadlineMatch[1].trim();
    }

    // Summary Generation
    let summary = `This email relates to ${bestSubcategory}.`;
    const companyName = context.companyName ?? '';
    const cName = companyName !== '' ? ` from ${companyName}` : '';
    
    if (companyName !== '') {
      summary = `This email from ${companyName} relates to ${bestSubcategory}.`;
    }
    
    if (bestSubcategory === 'Job Alert') {
      summary = `This email contains new job openings${cName} and recommends reviewing available positions.`;
    } else if (bestSubcategory === 'Interview') {
      summary = `This email contains an interview invitation${cName}.`;
    } else if (bestSubcategory === 'OTP') {
      summary = `This email provides a highly sensitive One-Time Password (OTP) for account verification.`;
    }

    // --- Phase 5: Smart Calendar Integration ---
    // Extract Event Information for Calendar
    const isCalendarWorthy = [
      'Interview', 'Assessment', 'Placement', 'Calendar Invites', 'Event Invitations',
      'Personal Event', 'Appointment', 'Meeting', 'Webinar', 'Hackathon', 'Exam', 'Conference'
    ].includes(bestSubcategory) || (context.deadline !== undefined) || bestCategory === 'Exam';

    if (isCalendarWorthy) {
      // Date patterns
      const datePatterns = [
        /(?:on|date:?)\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
        /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b)/i,
        /(\b\d{1,2}\/\d{1,2}\/\d{4}\b)/,
        /(\b\d{4}-\d{2}-\d{2}\b)/,
        /\b(Tomorrow)\b/i,
        /\b(Next Monday|Next Tuesday|Next Wednesday|Next Thursday|Next Friday|Next Saturday|Next Sunday)\b/i,
        /\b(Before Friday)\b/i
      ];

      // Time patterns
      const timePatterns = [
        /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*([A-Z]{2,4})?/i,
        /(\d{1,2}\s*(?:AM|PM|am|pm))\s*([A-Z]{2,4})?/i
      ];

      // Location patterns
      const locationRegex = /(?:location|venue|where):?\s*([^\n.,]+)/i;
      const genericLocations = /(Online|Office|Campus)/i;

      let extractedDate = '';
      for (const pattern of datePatterns) {
        const match = pattern.exec(subject + ' ' + body);
        if (match?.[1]) {
          extractedDate = match[1];
          break;
        }
      }

      let extractedTime = '';
      let extractedZone = '';
      for (const pattern of timePatterns) {
        const match = pattern.exec(subject + ' ' + body);
        if (match?.[1]) {
          extractedTime = match[1];
          if (match[2]) extractedZone = match[2];
          break;
        }
      }

      let extractedLocation = '';
      const locMatch = locationRegex.exec(body);
      if (locMatch?.[1]) {
        extractedLocation = locMatch[1].trim();
      } else {
        const genLocMatch = genericLocations.exec(body);
        if (genLocMatch?.[1]) extractedLocation = genLocMatch[1];
      }

      if (extractedDate || extractedTime || context.meetingLink || extractedLocation) {
        context.calendarEvent = {
          title: subject.substring(0, 100),
          date: extractedDate ? extractedDate : 'TBD',
          startTime: extractedTime ? extractedTime : 'TBD',
          timeZone: extractedZone,
          location: extractedLocation ? extractedLocation : (context.meetingLink ?? ''),
          meetingLink: context.meetingLink ?? '',
          company: context.companyName ?? '',
          description: summary ?? ''
        };
      }
    }

    // Reasoning Generation
    const reasoning = `Classified as ${bestSubcategory} because it strongly matched signals: ${finalSignals.slice(0, 2).join(', ')}.`;

    return {
      category: bestCategory,
      subcategory: bestSubcategory,
      priority,
      confidence,
      summary,
      reasoning,
      detectedSignals: finalSignals,
      requiresReply: bestCategory === 'Recruitment' && bestSubcategory !== 'Job Alert',
      requiresReminder: priority === 'Critical' || priority === 'High',
      requiresCalendar: bestSubcategory === 'Interview' || bestSubcategory === 'Calendar Invites' || bestSubcategory === 'Event Invitations',
      recommendedActions: [], // Populated later by ActionGenerator
      timeline: [], // Populated later by TimelineGenerator
      context,
      ...(context.deadline ? { deadline: context.deadline } : {})
    };
  }
}
