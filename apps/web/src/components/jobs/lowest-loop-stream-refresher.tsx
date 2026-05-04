'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { type EventRefreshRule, useEventDrivenRefresh } from '../events/use-event-driven-refresh';

const REFRESH_THROTTLE_MS = 1000;

export function LowestLoopStreamRefresher({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);
  const rules = useMemo<EventRefreshRule[]>(
    () => [
      {
        eventName: 'lowest-loop',
        enabled: Boolean(accountId),
        shouldRefresh: (payload) =>
          payload['accountId'] === accountId && (payload['type'] === 'state' || payload['type'] === 'ended'),
      },
    ],
    [accountId],
  );

  useEventDrivenRefresh({ rules, refresh, throttleMs: REFRESH_THROTTLE_MS, startThrottled: true });

  return null;
}
