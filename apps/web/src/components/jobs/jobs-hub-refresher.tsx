'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useEventStreamEvent } from '../events/event-stream-provider';

export function JobsHubRefresher() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);
  const scheduledRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function refreshHub() {
      const now = Date.now();

      if (now - lastRefreshAt.current < 800) {
        if (!scheduledRefreshRef.current) {
          scheduledRefreshRef.current = setTimeout(() => {
            scheduledRefreshRef.current = null;
            refreshHub();
          }, 800 - (now - lastRefreshAt.current));
        }
        return;
      }

      lastRefreshAt.current = now;
      router.refresh();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshAt.current > 30_000) {
        refreshHub();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
    };
  }, [router]);

  const handler = useCallback((data: Record<string, unknown>) => {
    const type = data['type'];
    if (type === 'state' || type === 'ended') {
      const now = Date.now();
      if (now - lastRefreshAt.current >= 800) {
        lastRefreshAt.current = now;
        router.refresh();
        return;
      }

      if (!scheduledRefreshRef.current) {
        scheduledRefreshRef.current = setTimeout(() => {
          scheduledRefreshRef.current = null;
          lastRefreshAt.current = Date.now();
          router.refresh();
        }, 800 - (now - lastRefreshAt.current));
      }
    }
  }, [router]);

  useEventStreamEvent('general-loop', handler);
  useEventStreamEvent('bp-loop', handler);
  useEventStreamEvent('im-loop', handler);
  useEventStreamEvent('lowest-loop', handler);

  return null;
}
