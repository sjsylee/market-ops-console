'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

type EventStreamName = 'general-loop' | 'bp-loop' | 'im-loop' | 'lowest-loop' | 'current.sync';
type EventStreamPayload = Record<string, unknown>;
type EventStreamHandler = (payload: EventStreamPayload) => void;

type EventStreamContextValue = {
  subscribe: (eventName: EventStreamName, handler: EventStreamHandler) => () => void;
};

const eventNames: EventStreamName[] = ['general-loop', 'bp-loop', 'im-loop', 'lowest-loop', 'current.sync'];

const EventStreamContext = createContext<EventStreamContextValue | null>(null);

export function EventStreamProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const listenersRef = useRef(new Map<EventStreamName, Set<EventStreamHandler>>());

  const subscribe = useCallback((eventName: EventStreamName, handler: EventStreamHandler) => {
    const current = listenersRef.current.get(eventName) ?? new Set<EventStreamHandler>();
    current.add(handler);
    listenersRef.current.set(eventName, current);

    return () => {
      const listeners = listenersRef.current.get(eventName);
      if (!listeners) return;

      listeners.delete(handler);
      if (!listeners.size) {
        listenersRef.current.delete(eventName);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const eventSource = new EventSource('/api/events/stream', { withCredentials: true });

    const handlers = new Map<EventStreamName, (event: MessageEvent) => void>();

    for (const eventName of eventNames) {
      const handler = (event: MessageEvent) => {
        try {
          const parsed: unknown = JSON.parse(event.data as string);
          if (!parsed || typeof parsed !== 'object') {
            return;
          }

          const listeners = listenersRef.current.get(eventName);
          if (!listeners?.size) {
            return;
          }

          for (const listener of listeners) {
            listener(parsed as EventStreamPayload);
          }
        } catch {
          // SSE 파싱 실패는 개별 이벤트만 건너뜁니다.
        }
      };

      handlers.set(eventName, handler);
      eventSource.addEventListener(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of handlers) {
        eventSource.removeEventListener(eventName, handler);
      }
      eventSource.close();
    };
  }, [enabled]);

  const value = useMemo<EventStreamContextValue>(() => ({ subscribe }), [subscribe]);

  return <EventStreamContext.Provider value={value}>{children}</EventStreamContext.Provider>;
}

export function useEventStreamEvent(eventName: EventStreamName, handler: EventStreamHandler, enabled = true) {
  const context = useContext(EventStreamContext);

  useEffect(() => {
    if (!enabled || !context) {
      return;
    }

    return context.subscribe(eventName, handler);
  }, [context, enabled, eventName, handler]);
}
