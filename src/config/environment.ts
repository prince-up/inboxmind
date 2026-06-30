import { z } from 'zod';

const environmentSchema = z.object({
  logLevel: z
    .enum(['debug', 'info', 'warn', 'error', 'silent'])
    .default('info'),
});

/**
 * Validated build-time configuration exposed to browser extension contexts.
 */
export const environment = environmentSchema.parse({
  logLevel: process.env.PLASMO_PUBLIC_LOG_LEVEL,
});

export type Environment = z.infer<typeof environmentSchema>;
