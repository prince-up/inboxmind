import { z } from 'zod';

import { confidenceSchema } from './SummarySchema';

export const entitySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['company', 'date', 'location', 'money', 'person', 'product']),
});

export const metadataSchema = z.object({
  confidence: confidenceSchema,
  entities: z.array(entitySchema),
  language: z.string().min(2),
  risk: z.enum(['high', 'low', 'medium']),
  sentiment: z.enum(['negative', 'neutral', 'positive']),
});

export type MetadataOutput = z.infer<typeof metadataSchema>;
