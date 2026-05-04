'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useEventStreamEvent } from '../events/event-stream-provider';

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

    if (scheduledRefreshRef.current) {
      return;
    }

    scheduledRefreshRef.current = setTimeout(() => {
      scheduledRefreshRef.current = null;
      lastRefreshAtRef.current = Date.now();
      router.refresh();
    }, REFRESH_THROTTLE_MS - elapsed);
  }, [router]);

  const handler = useCallback((data: Record<string, unknown>) => {
    if (!accountId) {
      return;
    }

    if (data['type'] !== 'state' && data['type'] !== 'ended') {
      return;
    }

    if (typeof data['accountId'] !== 'string' || data['accountId'] !== accountId) {
      return;
    }

    queueRefresh();
  }, [accountId, queueRefresh]);

  useEventStreamEvent(kind, handler, Boolean(accountId));

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
