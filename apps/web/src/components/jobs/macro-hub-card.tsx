import Link from 'next/link';

type MacroHubCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  running: boolean;
  accountName: string | null;
  pendingCount: number;
  successCount: number;
  failedCount: number;
  pendingLabel?: string;
  successLabel?: string;
  failedLabel?: string;
  successTone?: 'success' | 'info';
  failedTone?: 'failed' | 'warning';
};

export function MacroHubCard(props: MacroHubCardProps) {
  const successValueClass = props.successTone === 'info' ? 'status-value-info' : 'status-value-success';
  const failedValueClass = props.failedTone === 'warning' ? 'status-value-warning' : 'status-value-failed';

  return (
    <article className={`card-panel macro-hub-card flex h-full flex-col p-6 ${props.running ? 'macro-hub-card-running' : ''}`}>
      {props.running ? (
        <>
          <div aria-hidden className="macro-running-aurora" />
          <div aria-hidden className="macro-running-sheen" />
          <div aria-hidden className="macro-running-scanlines" />
        </>
      ) : null}
      <div className="relative z-10 flex h-full flex-col">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{props.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold">{props.title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{props.description}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
            <p className="text-xs text-text-muted">{props.pendingLabel ?? '대기'}</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{props.pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
            <p className="text-xs text-text-muted">{props.successLabel ?? '성공'}</p>
            <p className={`mt-1 text-lg font-semibold ${successValueClass}`}>{props.successCount}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
            <p className="text-xs text-text-muted">{props.failedLabel ?? '실패'}</p>
            <p className={`mt-1 text-lg font-semibold ${failedValueClass}`}>{props.failedCount}</p>
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className={`macro-status-pill ${props.running ? 'macro-status-pill-running' : ''}`}>
              <span aria-hidden className={`macro-status-dot ${props.running ? 'macro-status-dot-running' : ''}`} />
              {props.running ? '실행 중' : '대기 중'}
            </span>
            <p className="mt-2 min-h-5 truncate text-xs text-text-muted">
              {props.accountName ? `계정 · ${props.accountName}` : '계정 미선택'}
            </p>
          </div>
          <Link href={props.href} className="btn-primary">
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
