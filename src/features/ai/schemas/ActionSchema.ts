import { z } from 'zod';

import { confidenceSchema, dateOrNullSchema } from './SummarySchema';

export const actionTypeSchema = z.enum([
  'archive',
  'calendar',
  'follow_up',
  'forward',
  'reply',
  'schedule_reminder',
  'star',
]);

export const actionRiskSchema = z.enum(['high', 'low', 'medium']);

export const actionItemSchema = z.object({
  confidence: confidenceSchema,
  description: z.string().min(1),
  dueDate: dateOrNullSchema,
  risk: actionRiskSchema,
  title: z.string().min(1),
  type: actionTypeSchema,
});

export const actionSchema = z.object({
  actions: z.array(actionItemSchema),
  confidence: confidenceSchema,
});

export type ActionOutput = z.infer<typeof actionSchema>;
