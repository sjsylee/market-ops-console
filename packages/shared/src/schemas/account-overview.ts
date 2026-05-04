import { z } from 'zod';

import { accountSummarySchema } from './accounts.js';

export const accountOverviewResponseSchema = z.object({
  accounts: z.array(accountSummarySchema),
  selectedAccount: accountSummarySchema.nullable(),
});

export type AccountOverviewResponse = z.infer<typeof accountOverviewResponseSchema>;
