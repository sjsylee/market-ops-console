import {
  lowestLoopQueueCreateSchema,
  lowestLoopQueueItemSchema,
  lowestLoopQueueUpdateSchema,
  lowestLoopStateResponseSchema,
} from '@market-ops/shared';
import { z } from 'zod';

import { apiDeleteClient, apiPatchClient, apiPostClient } from './api-client';

const lowestLoopQueueItemResponseSchema = z.object({
  item: lowestLoopQueueItemSchema,
});

export async function createLowestLoopQueueItem(input: z.infer<typeof lowestLoopQueueCreateSchema>) {
  return lowestLoopQueueItemResponseSchema.parse(
    await apiPostClient('/api/current/lowest-loop/queue', lowestLoopQueueCreateSchema.parse(input)),
  ).item;
}

export async function updateLowestLoopQueueItem(id: string, input: z.infer<typeof lowestLoopQueueUpdateSchema>) {
  return lowestLoopQueueItemResponseSchema.parse(
    await apiPatchClient(`/api/current/lowest-loop/queue/${id}`, lowestLoopQueueUpdateSchema.parse(input)),
  ).item;
}

export async function removeLowestLoopQueueItem(id: string) {
  return apiDeleteClient<{ ok: true }>(`/api/current/lowest-loop/queue/${id}`, {});
}

export async function startLowestLoop(accountId: string) {
  return lowestLoopStateResponseSchema.parse(
    await apiPostClient('/api/current/lowest-loop/start', {
      accountId,
    }),
  );
}

export async function stopLowestLoop() {
  return lowestLoopStateResponseSchema.parse(await apiPostClient('/api/current/lowest-loop/stop', {}));
}
