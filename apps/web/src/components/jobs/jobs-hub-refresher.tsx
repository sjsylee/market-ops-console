'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { type EventRefreshRule, useEventDrivenRefresh } from '../events/use-event-driven-refresh';

type HubEventName = 'general-loop' | 'bp-loop' | 'im-loop' | 'lowest-loop';
const hubEventNames: HubEventName[] = ['general-loop', 'bp-loop', 'im-loop', 'lowest-loop'];

export function JobsHubRefresher() {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  const rules = useMemo<EventRefreshRule[]>(
    () =>
      hubEventNames.map((eventName) => ({
        eventName,
        shouldRefresh: (payload) => payload['type'] === 'state' || payload['type'] === 'ended',
        ignoreInitial: (payload) => payload['type'] === 'state',
      })),
    [],
  );

  useEventDrivenRefresh({
    rules,
    refresh,
    throttleMs: 800,
    refreshOnVisibleAfterMs: 30_000,
  });

  return null;
}
