'use client';

import type { CurrentSyncScope } from '@market-ops/shared';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { type EventRefreshRule, useEventDrivenRefresh } from '../events/use-event-driven-refresh';

const REFRESH_THROTTLE_MS = 1500;

export function CurrentStreamRefresher({ accountId, scope }: { accountId?: string; scope?: CurrentSyncScope }) {
  const router = useRouter();

  const refreshWithoutScrollDrift = useCallback(() => {
    const scrollY = window.scrollY;
    router.refresh();
    const restore = () => window.scrollTo(0, scrollY);
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
    window.setTimeout(restore, 80);
    window.setTimeout(restore, 180);
    window.setTimeout(restore, 360);
  }, [router]);
  const rules = useMemo<EventRefreshRule[]>(
    () => [
      {
        eventName: 'current.sync',
        enabled: Boolean(accountId),
        shouldRefresh: (payload) =>
          payload['accountId'] === accountId &&
          (!scope || payload['scope'] === scope || payload['scope'] === 'ALL') &&
          (payload['type'] === 'snapshot-ready' || payload['type'] === 'ended'),
      },
    ],
    [accountId, scope],
  );

  useEventDrivenRefresh({ rules, refresh: refreshWithoutScrollDrift, throttleMs: REFRESH_THROTTLE_MS });

  return null;
}
