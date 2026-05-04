'use client';

import { useCallback, useEffect, useState } from 'react';

import type { JobLogItem } from '@market-ops/shared';

import { useEventStreamEvent } from '../components/events/event-stream-provider';

export type JobLoopKind = 'general-loop' | 'bp-loop' | 'im-loop' | 'lowest-loop';

type SseLogLevel = 'info' | 'success' | 'warning' | 'error';

const LEVEL_MAP: Record<SseLogLevel, JobLogItem['level']> = {
  info: 'INFO',
  success: 'SUCCESS',
  warning: 'WARNING',
  error: 'ERROR',
};
const MAX_LIVE_LOGS = 120;

function isSseLogLevel(v: unknown): v is SseLogLevel {
  return v === 'info' || v === 'success' || v === 'warning' || v === 'error';
}

export function useJobLogs({
  kind,
  accountId,
  initialLogs,
}: {
  kind: JobLoopKind;
  accountId?: string;
  initialLogs: JobLogItem[];
}): { logs: JobLogItem[]; loading: boolean } {
  const [logs, setLogs] = useState<JobLogItem[]>(initialLogs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function fetchLogs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (accountId) {
          params.set('accountId', accountId);
        }
        const suffix = params.toString() ? `?${params.toString()}` : '';
        const path =
          kind === 'lowest-loop'
            ? `/api/current/lowest-loop/logs${suffix}`
            : `/api/jobs/${kind}/logs${suffix}`;
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as { items?: unknown };
        if (!disposed && Array.isArray(payload.items)) {
          setLogs(payload.items.slice(0, MAX_LIVE_LOGS) as JobLogItem[]);
        }
      } catch {
        // 로그는 보조 정보라 초기 조회 실패는 조용히 무시합니다.
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    }

    if (!initialLogs.length) {
      void fetchLogs();
    } else {
      setLoading(false);
      setLogs(initialLogs.slice(0, MAX_LIVE_LOGS));
    }

    return () => {
      disposed = true;
    };
  }, [accountId, initialLogs, kind]);

  const handler = useCallback((data: Record<string, unknown>) => {
    if (data['type'] !== 'log') return;
    if (accountId && typeof data['accountId'] === 'string' && data['accountId'] !== accountId) return;

    const log = data['log'];
    if (typeof log !== 'object' || log === null) return;

    const { level, message, timestamp, meta } = log as Record<string, unknown>;
    if (!isSseLogLevel(level) || typeof message !== 'string' || typeof timestamp !== 'string') return;

    const newItem: JobLogItem = {
      id: `sse-${Date.now()}-${Math.random()}`,
      level: LEVEL_MAP[level],
      message,
      createdAt: timestamp,
      ...(meta && typeof meta === 'object' ? { meta: meta as JobLogItem['meta'] } : {}),
    };
    setLogs((prev) => [newItem, ...prev].slice(0, MAX_LIVE_LOGS));
  }, [accountId]);

  useEventStreamEvent(kind, handler);

  return { logs, loading };
}
