import { z } from 'zod';

export const prioritySchema = z.enum(['high', 'low', 'medium']);

export const confidenceSchema = z.number().min(0).max(1);

export const dateOrNullSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();

export const summarySchema = z.object({
  confidence: confidenceSchema,
  deadline: dateOrNullSchema,
  followUpDate: dateOrNullSchema,
  priority: prioritySchema,
  summary: z.string().min(1),
});

export type SummaryOutput = z.infer<typeof summarySchema>;
