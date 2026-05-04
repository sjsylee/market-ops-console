'use client';

import { useCallback, useEffect, useRef } from 'react';

import { type EventStreamName, type EventStreamPayload, useEventStreamContext } from './event-stream-provider';

export type EventRefreshRule = {
  eventName: EventStreamName;
  enabled?: boolean;
  shouldRefresh: (payload: EventStreamPayload) => boolean;
  ignoreInitial?: (payload: EventStreamPayload) => boolean;
};

type EventDrivenRefreshOptions = {
  rules: EventRefreshRule[];
  refresh: () => void;
  throttleMs: number;
  startThrottled?: boolean;
  refreshOnVisibleAfterMs?: number;
};

export function useEventDrivenRefresh({
  rules,
  refresh,
  throttleMs,
  startThrottled = false,
  refreshOnVisibleAfterMs,
}: EventDrivenRefreshOptions) {
  const eventStream = useEventStreamContext();
  const lastRefreshAtRef = useRef(startThrottled ? Date.now() : 0);
  const ignoredInitialKeysRef = useRef(new Set<string>());
  const scheduledRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtRef.current;

    if (elapsed >= throttleMs) {
      lastRefreshAtRef.current = now;
      refresh();
      return;
    }

    if (scheduledRefreshRef.current) {
      return;
    }

    scheduledRefreshRef.current = setTimeout(() => {
      scheduledRefreshRef.current = null;
      lastRefreshAtRef.current = Date.now();
      refresh();
    }, throttleMs - elapsed);
  }, [refresh, throttleMs]);

  useEffect(() => {
    if (!eventStream) {
      return;
    }

    const unsubscribeList = rules
      .filter((rule) => rule.enabled !== false)
      .map((rule, index) => {
        const initialKey = `${rule.eventName}:${index}`;

        return eventStream.subscribe(rule.eventName, (payload) => {
          if (rule.ignoreInitial && !ignoredInitialKeysRef.current.has(initialKey) && rule.ignoreInitial(payload)) {
            ignoredInitialKeysRef.current.add(initialKey);
            return;
          }

          if (!rule.shouldRefresh(payload)) {
            return;
          }

          queueRefresh();
        });
      });

    return () => {
      for (const unsubscribe of unsubscribeList) {
        unsubscribe();
      }
    };
  }, [eventStream, queueRefresh, rules]);

  useEffect(() => {
    if (!refreshOnVisibleAfterMs) {
      return;
    }
    const visibleRefreshDelayMs = refreshOnVisibleAfterMs;

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshAtRef.current > visibleRefreshDelayMs) {
        queueRefresh();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queueRefresh, refreshOnVisibleAfterMs]);

  useEffect(() => {
    return () => {
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
    };
  }, []);
}
