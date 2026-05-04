import type { ReactNode } from 'react';

type MacroState = {
  running: boolean;
  cycleCount?: number;
  pendingCount: number;
  successCount: number;
  failedCount: number;
  currentTaskId: string | null;
  lastError: string | null;
  options: Record<string, unknown>;
};

type CurrentTaskSummary = {
  productId: number;
  productName: string | null;
  optionCount: number;
};

import { MacroStatusCards, type MacroStatusCardItem } from './macro-status-cards';

export function GeneralLoopStateCard({
  state,
  statusCards,
  currentTaskSummary,
  secondaryActions,
}: {
  state: MacroState;
  statusCards: MacroStatusCardItem[];
  currentTaskSummary?: CurrentTaskSummary | null;
  secondaryActions?: ReactNode;
}) {
  const currentTaskText = currentTaskSummary
    ? `${currentTaskSummary.productName || `상품 #${currentTaskSummary.productId}`} · 옵션 ${currentTaskSummary.optionCount}개`
    : state.currentTaskId
      ? '작업 정보를 불러오는 중입니다'
      : state.running
        ? '대기 중'
        : '없음';

  return (
    <section className={`card-panel macro-running-surface p-6 ${state.running ? 'macro-running-surface-active' : ''}`}>
      {state.running ? (
        <>
          <div aria-hidden className="macro-running-aurora" />
          <div aria-hidden className="macro-running-sheen" />
          <div aria-hidden className="macro-running-scanlines" />
        </>
      ) : null}
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Queue Status</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{state.running ? '실행 중' : '대기 중'}</h2>
            <p className="mt-2 text-sm text-text-secondary">현재 작업</p>
            <p className="mt-1 text-sm font-medium text-text-primary">{currentTaskText}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className={`macro-status-pill ${state.running ? 'macro-status-pill-running' : ''}`}>
              <span aria-hidden className={`macro-status-dot ${state.running ? 'macro-status-dot-running' : ''}`} />
              {state.running ? '큐 진행 중' : '큐 대기'}
            </span>
            <span className="rounded-full border border-glow bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary">
              cycle {state.cycleCount ?? 0}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <MacroStatusCards cards={statusCards} />
        </div>
        {secondaryActions ? <div className="mt-5">{secondaryActions}</div> : null}
      </div>
    </section>
  );
}
