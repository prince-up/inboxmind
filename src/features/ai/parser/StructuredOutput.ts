import { z } from 'zod';

import { actionSchema } from '../schemas/ActionSchema';
import { metadataSchema } from '../schemas/MetadataSchema';
import { summarySchema } from '../schemas/SummarySchema';

export const structuredAnalysisSchema = z.object({
  actions: actionSchema,
  metadata: metadataSchema,
  summary: summarySchema,
});

export type StructuredAnalysisOutput = z.infer<typeof structuredAnalysisSchema>;

export type StructuredOutputSchema<TData> = z.ZodType<TData>;
