import { z } from 'zod';

import { accountSummarySchema, loopAccountSelectionSchema } from './accounts.js';
import { bpLoopStateResponseSchema, bpLoopTaskSchema } from './bp-loop.js';
import { generalLoopStateResponseSchema, generalLoopTaskSchema } from './general-loop.js';
import { imLoopStateResponseSchema, imLoopTaskSchema } from './im-loop.js';
import { lowestLoopQueueItemSchema, lowestLoopStateResponseSchema } from './lowest-loop.js';

export const macroDetailOverviewKindSchema = z.enum(['general-loop', 'bp-loop', 'im-loop']);

export const generalMacroDetailOverviewResponseSchema = z.object({
  kind: z.literal('general-loop'),
  accounts: z.array(accountSummarySchema),
  selection: loopAccountSelectionSchema,
  state: generalLoopStateResponseSchema,
  tasks: z.array(generalLoopTaskSchema),
});

export const bpMacroDetailOverviewResponseSchema = z.object({
  kind: z.literal('bp-loop'),
  accounts: z.array(accountSummarySchema),
  selection: loopAccountSelectionSchema,
  state: bpLoopStateResponseSchema,
  tasks: z.array(bpLoopTaskSchema),
});

export const imMacroDetailOverviewResponseSchema = z.object({
  kind: z.literal('im-loop'),
  accounts: z.array(accountSummarySchema),
  selection: loopAccountSelectionSchema,
  state: imLoopStateResponseSchema,
  tasks: z.array(imLoopTaskSchema),
});

export const macroDetailOverviewResponseSchema = z.discriminatedUnion('kind', [
  generalMacroDetailOverviewResponseSchema,
  bpMacroDetailOverviewResponseSchema,
  imMacroDetailOverviewResponseSchema,
]);

export const lowestLoopDetailOverviewResponseSchema = z.object({
  accounts: z.array(accountSummarySchema),
  selection: loopAccountSelectionSchema,
  state: lowestLoopStateResponseSchema,
  queueItems: z.array(lowestLoopQueueItemSchema),
});

export type MacroDetailOverviewKind = z.infer<typeof macroDetailOverviewKindSchema>;
export type MacroDetailOverviewResponse = z.infer<typeof macroDetailOverviewResponseSchema>;
export type LowestLoopDetailOverviewResponse = z.infer<typeof lowestLoopDetailOverviewResponseSchema>;
