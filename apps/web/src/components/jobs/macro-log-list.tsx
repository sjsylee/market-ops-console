'use client';

import type { JobLogItem } from '@market-ops/shared';
import { AlertTriangle, CheckCircle2, Info, Loader2, OctagonAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useJobLogs, type JobLoopKind } from '../../hooks/use-job-logs';

const levelTone: Record<
  JobLogItem['level'],
  {
    badgeClass: string;
    cardClass: string;
    messageClass: string;
    icon: LucideIcon;
    label: string;
  }
> = {
  INFO: {
    badgeClass: 'status-badge-info',
    cardClass: 'macro-log-card-info',
    messageClass: 'macro-log-message-info',
    icon: Info,
    label: '안내',
  },
  SUCCESS: {
    badgeClass: 'status-badge-success',
    cardClass: 'macro-log-card-success',
    messageClass: 'macro-log-message-success',
    icon: CheckCircle2,
    label: '성공',
  },
  WARNING: {
    badgeClass: 'status-badge-warning',
    cardClass: 'macro-log-card-warning',
    messageClass: 'macro-log-message-warning',
    icon: AlertTriangle,
    label: '주의',
  },
  ERROR: {
    badgeClass: 'status-badge-failed',
    cardClass: 'macro-log-card-error',
    messageClass: 'macro-log-message-error',
    icon: OctagonAlert,
    label: '오류',
  },
};

export function MacroLogList({
  initialLogs,
  kind,
  accountId,
}: {
  initialLogs: JobLogItem[];
  kind: JobLoopKind;
  accountId?: string;
}) {
  const { logs, loading } = useJobLogs({ kind, accountId, initialLogs });

  if (loading && !logs.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-subtle bg-bg-card/50 p-6 text-sm text-text-secondary">
        <Loader2 size={16} className="animate-spin text-accent-primary" />
        <span>로그를 가져오는 중입니다.</span>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">
        표시할 로그가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {logs.map((log) => {
        const tone = levelTone[log.level];
        const LevelIcon = tone.icon;

        return (
        <article key={log.id} className={`macro-log-card overflow-hidden rounded-2xl border ${tone.cardClass}`}>
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone.badgeClass}`}>
              <LevelIcon size={14} />
              {tone.label}
            </span>
            <span className="text-xs text-text-muted">{new Date(log.createdAt).toLocaleString('ko-KR')}</span>
          </div>

          {log.meta && (
            <div
              className="macro-log-meta flex items-start gap-3 border-y border-subtle px-4 py-3"
            >
              {log.meta.imgUrl ? (
                <img
                  src={log.meta.imgUrl}
                  alt={log.meta.productName ?? ''}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 flex-shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                />
              ) : (
                <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-subtle sm:h-16 sm:w-16" />
              )}
              <div className="min-w-0 flex-1">
                <p className="product-title line-clamp-2 text-sm font-semibold leading-tight text-text-primary">
                  {log.meta.productName || '상품명 없음'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="font-mono text-xs text-text-muted">#{log.meta.productId}</span>
                  {log.meta.options?.map((opt) => (
                    <span
                      key={opt}
                      className="rounded-md border border-subtle px-2 py-0.5 text-xs text-text-secondary"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-4">
            <p className={`macro-log-message break-words text-sm ${tone.messageClass}`}>{log.message}</p>
          </div>
        </article>
        );
      })}
    </div>
  );
}
