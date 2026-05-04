'use client';

import type { CurrentSyncScope } from '@market-ops/shared';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useEventStreamEvent } from '../events/event-stream-provider';

const REFRESH_THROTTLE_MS = 1500;

export function CurrentStreamRefresher({ accountId, scope }: { accountId?: string; scope?: CurrentSyncScope }) {
  const router = useRouter();
  const lastRefreshAtRef = useRef(0);
  const scheduledRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const queueRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtRef.current;

    if (elapsed >= REFRESH_THROTTLE_MS) {
      lastRefreshAtRef.current = now;
      refreshWithoutScrollDrift();
      return;
    }

    if (scheduledRefreshRef.current) {
      return;
    }

    scheduledRefreshRef.current = setTimeout(() => {
      scheduledRefreshRef.current = null;
      lastRefreshAtRef.current = Date.now();
      refreshWithoutScrollDrift();
    }, REFRESH_THROTTLE_MS - elapsed);
  }, [refreshWithoutScrollDrift]);

  const handler = useCallback((data: Record<string, unknown>) => {
    if (!accountId) return;
    if (data['accountId'] !== accountId) return;
    if (scope && data['scope'] !== scope && data['scope'] !== 'ALL') return;
    if (data['type'] !== 'snapshot-ready' && data['type'] !== 'ended') return;

    queueRefresh();
  }, [accountId, queueRefresh, scope]);

  useEventStreamEvent('current.sync', handler, Boolean(accountId));

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
