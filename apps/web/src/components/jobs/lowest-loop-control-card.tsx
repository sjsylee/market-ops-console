'use client';

import type { LowestLoopState } from '@market-ops/shared';
import { Loader2, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { startLowestLoop, stopLowestLoop } from '../../lib/lowest-loop-client';
import { openUrlModal } from '../../lib/url-modal';

const stageLabel: Record<LowestLoopState['stage'], string> = {
  idle: '대기 중',
  running: '실행 중',
  waiting_cycle: '다음 사이클 대기',
  ended: '종료',
};

export function LowestLoopControlCard({
  state,
  accountId,
  queueCount,
  activeQueueCount,
  inactiveQueueCount,
  basePath,
}: {
  state: LowestLoopState;
  accountId?: string;
  queueCount: number;
  activeQueueCount: number;
  inactiveQueueCount: number;
  basePath: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<'start' | 'stop' | null>(null);
  const progress = state.total > 0 ? Math.min(100, Math.round((state.activeCount / state.total) * 100)) : 0;

  async function start() {
    if (!accountId || state.running || pending) return;

    setPending('start');
    try {
      await startLowestLoop(accountId);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function stop() {
    if (!state.running || pending) return;

    setPending('stop');
    try {
      await stopLowestLoop();
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <section className={`card-panel macro-running-surface p-5 ${state.running ? 'macro-running-surface-active' : ''}`}>
      {state.running ? (
        <>
          <div aria-hidden className="macro-running-aurora" />
          <div aria-hidden className="macro-running-sheen" />
          <div aria-hidden className="macro-running-scanlines" />
        </>
      ) : null}
      <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Lowest Bid Automation</p>
          <h2 className="mt-2 text-2xl font-black text-text-primary">{stageLabel[state.stage]}</h2>
          <p className="mt-2 truncate text-sm text-text-secondary">
            {state.current ? `상품 #${state.current.productId} · ${state.current.option}` : '입찰 페이지에서 등록한 큐를 최저가 기준으로 자동 관리합니다.'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricLink label="전체 큐" value={queueCount} href={`${basePath}?modal=queue`} />
            <MetricLink label="활성 큐" value={activeQueueCount} href={`${basePath}?modal=queue`} />
            <MetricLink label="중지 큐" value={inactiveQueueCount} href={`${basePath}?modal=queue`} />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-muted">
              <span>활성 비율</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-accent-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {state.lastError ? <p className="failure-reason-card mt-4">{state.lastError}</p> : null}
        </div>

        <div className="grid gap-2 sm:min-w-48">
          {state.running ? (
            <button type="button" onClick={stop} disabled={pending !== null} className="btn-primary h-12 gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              {pending === 'stop' ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} />}
              중지
            </button>
          ) : (
            <button type="button" onClick={start} disabled={!accountId || queueCount === 0 || pending !== null} className="btn-primary h-12 gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              {pending === 'start' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              시작
            </button>
          )}
          <button
            type="button"
            onClick={() => openUrlModal(`${basePath}?modal=logs`)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-subtle bg-bg-card px-4 text-sm font-bold text-text-secondary transition hover:border-glow hover:text-text-primary"
          >
            로그 보기
          </button>
          <p className="text-center text-xs text-text-muted">큐가 비어 있으면 시작할 수 없습니다.</p>
        </div>
      </div>
    </section>
  );
}

function MetricLink({ label, value, href }: { label: string; value: number; href: string }) {
  const content = (
    <div className="rounded-2xl border border-subtle bg-bg-card/60 p-3 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg font-black text-text-primary">{value.toLocaleString('ko-KR')}</p>
    </div>
  );

  return value > 0 ? (
    <button type="button" onClick={() => openUrlModal(href)} className="block rounded-2xl text-left transition hover:-translate-y-0.5 hover:border-glow">
      {content}
    </button>
  ) : (
    content
  );
}
