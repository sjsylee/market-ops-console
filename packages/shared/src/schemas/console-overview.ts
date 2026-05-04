import { z } from 'zod';

import { accountSummarySchema, loopAccountSelectionSchema } from './accounts.js';
import { bpLoopStateResponseSchema } from './bp-loop.js';
import { currentStatSchema, currentSyncStateResponseSchema } from './current.js';
import { generalLoopStateResponseSchema } from './general-loop.js';
import { imLoopStateResponseSchema } from './im-loop.js';
import { lowestLoopQueueItemSchema, lowestLoopStateResponseSchema } from './lowest-loop.js';

export const consoleOverviewResponseSchema = z.object({
  accounts: z.array(accountSummarySchema),
  selectedAccount: accountSummarySchema.nullable(),
  selections: z.object({
    generalLoop: loopAccountSelectionSchema,
    bpLoop: loopAccountSelectionSchema,
    imLoop: loopAccountSelectionSchema,
    currentSync: loopAccountSelectionSchema,
  }),
  states: z.object({
    generalLoop: generalLoopStateResponseSchema,
    bpLoop: bpLoopStateResponseSchema,
    imLoop: imLoopStateResponseSchema,
    currentSync: currentSyncStateResponseSchema,
    lowestLoop: lowestLoopStateResponseSchema,
  }),
  currentStats: z.array(currentStatSchema),
  lowestLoopQueue: z.array(lowestLoopQueueItemSchema),
});

export type ConsoleOverviewResponse = z.infer<typeof consoleOverviewResponseSchema>;
