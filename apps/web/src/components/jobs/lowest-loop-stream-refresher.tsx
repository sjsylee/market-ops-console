'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useEventStreamEvent } from '../events/event-stream-provider';

const REFRESH_THROTTLE_MS = 1000;

export function LowestLoopStreamRefresher({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const lastRefreshAtRef = useRef(Date.now());
  const scheduledRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtRef.current;

    if (elapsed >= REFRESH_THROTTLE_MS) {
      lastRefreshAtRef.current = now;
      router.refresh();
      return;
    }

    if (scheduledRefreshRef.current) return;

    scheduledRefreshRef.current = setTimeout(() => {
      scheduledRefreshRef.current = null;
      lastRefreshAtRef.current = Date.now();
      router.refresh();
    }, REFRESH_THROTTLE_MS - elapsed);
  }, [router]);

  const handler = useCallback((data: Record<string, unknown>) => {
    if (!accountId) return;
    if (data['accountId'] !== accountId) return;
    if (data['type'] !== 'state' && data['type'] !== 'ended') return;

    queueRefresh();
  }, [accountId, queueRefresh]);

  useEventStreamEvent('lowest-loop', handler, Boolean(accountId));

  useEffect(() => {
    return () => {
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
    };
  }, []);

  return null;
}
