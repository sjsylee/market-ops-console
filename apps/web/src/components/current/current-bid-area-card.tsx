import Link from 'next/link';
import type { ReactNode } from 'react';

export function CurrentBidAreaCard({
  href,
  eyebrow,
  title,
  description,
  count,
  meta,
  icon,
  running = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  meta?: string | null;
  icon: ReactNode;
  running?: boolean;
}) {
  return (
    <article className={`card-panel macro-hub-card flex h-full flex-col p-6 ${running ? 'macro-hub-card-running' : ''}`}>
      {running ? (
        <>
          <div aria-hidden className="macro-running-aurora" />
          <div aria-hidden className="macro-running-sheen" />
          <div aria-hidden className="macro-running-scanlines" />
        </>
      ) : null}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{eyebrow}</p>
            <h3 className="mt-2 text-2xl font-bold text-text-primary">{title}</h3>
            <p className="mt-2 hidden break-keep text-sm leading-5 text-text-secondary sm:block">{description}</p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-bg-card/60 text-accent-primary">
            {icon}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
            <p className="text-xs text-text-muted">저장</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{count.toLocaleString('ko-KR')}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
            <p className="text-xs text-text-muted">동기화</p>
            <p className="mt-1 truncate text-sm font-semibold text-accent-primary">{meta || '전'}</p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className={`macro-status-pill ${running ? 'macro-status-pill-running' : ''}`}>
              <span aria-hidden className={`macro-status-dot ${running ? 'macro-status-dot-running' : ''}`} />
              {running ? '동기화 중' : '대기 중'}
            </span>
            <p className="mt-2 min-h-5 truncate text-xs text-text-muted">{title} 데이터 관리</p>
          </div>
          <Link href={href} className="btn-primary">
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
