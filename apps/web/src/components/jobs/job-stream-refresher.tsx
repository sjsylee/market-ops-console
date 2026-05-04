'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { type EventRefreshRule, useEventDrivenRefresh } from '../events/use-event-driven-refresh';

type JobLoopKind = 'general-loop' | 'bp-loop' | 'im-loop';

const REFRESH_THROTTLE_MS = 1200;

export function JobStreamRefresher({
  kind,
  accountId,
}: {
  kind: JobLoopKind;
  accountId?: string;
}) {
  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);
  const rules = useMemo<EventRefreshRule[]>(
    () => [
      {
        eventName: kind,
        enabled: Boolean(accountId),
        shouldRefresh: (payload) =>
          (payload['type'] === 'state' || payload['type'] === 'ended') &&
          typeof payload['accountId'] === 'string' &&
          payload['accountId'] === accountId,
      },
    ],
    [accountId, kind],
  );

  useEventDrivenRefresh({ rules, refresh, throttleMs: REFRESH_THROTTLE_MS, startThrottled: true });

  return null;
}
