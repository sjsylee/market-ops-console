'use client';

import type { CurrentSyncScope, CurrentSyncState } from '@market-ops/shared';
import { useCallback, useEffect, useState } from 'react';

import { useEventStreamEvent } from '../events/event-stream-provider';
import { getFreshness } from '../../lib/time-freshness';
import { CurrentSyncActions } from './current-sync-actions';

const stageLabel: Record<CurrentSyncState['stage'], string> = {
  idle: '대기',
  sync_inventory: '보관 동기화',
  sync_ask: '일반 판매 동기화',
  bulk_price: '가격 반영',
  ended: '완료',
};

export function SyncStateCard({
  state,
  accountId,
  scopes,
  lastSyncedAt,
  accountLabel,
}: {
  state: CurrentSyncState;
  accountId?: string;
  scopes?: CurrentSyncScope[];
  lastSyncedAt?: string | null;
  accountLabel?: string | null;
}) {
  const [liveState, setLiveState] = useState(state);
  const scopedState = isRelevantScope(liveState, scopes) ? liveState : toIdleScopedState(liveState, scopes?.[0] ?? null);
  const progress = scopedState.total > 0 ? Math.min(100, Math.round((scopedState.done / scopedState.total) * 100)) : 0;
  const syncedAt = getFreshness(lastSyncedAt);
  const lockedByOtherScope = liveState.running && !scopedState.running;

  useEffect(() => {
    setLiveState(state);
  }, [state]);

  const handler = useCallback((data: Record<string, unknown>) => {
    if (data['accountId'] !== accountId || data['type'] !== 'state') return;
    if (!isEventScopeRelevant(data['scope'], scopes)) return;

    const nextState = data['state'];
    if (isCurrentSyncState(nextState)) {
      setLiveState(nextState);
    }
  }, [accountId, scopes]);

  useEventStreamEvent('current.sync', handler, Boolean(accountId));

  return (
    <section className="card-panel min-w-0 overflow-hidden p-3 [overflow-anchor:none] sm:p-5">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-center lg:gap-5">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">입찰 동기화</p>
            <span className="shrink-0 rounded-full border border-subtle bg-bg-card px-2.5 py-1 text-[11px] font-bold text-text-secondary sm:hidden">
              {progress}%
            </span>
          </div>
          <div className="mt-1.5 flex min-w-0 flex-col gap-1.5 sm:mt-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-text-primary sm:text-2xl">{scopedState.running ? '동기화 진행 중' : '대기 중'}</h2>
              <p className="mt-1 h-5 truncate text-xs leading-5 text-text-secondary sm:mt-2 sm:text-sm">
                {scopedState.current
                  ? `상품 #${scopedState.current.productId} · ${scopedState.current.option}`
                  : accountLabel || '계정 선택 후 동기화할 수 있습니다.'}
              </p>
            </div>
            <span className="hidden w-fit shrink-0 rounded-full border border-glow bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary sm:inline-flex">
              {progress}%
            </span>
          </div>

          <div className="mt-2.5">
            <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-text-muted">
              <span>{lockedByOtherScope ? '다른 입찰 동기화 대기' : stageLabel[scopedState.stage]}</span>
              <span className="shrink-0">{scopedState.done} / {scopedState.total}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-accent-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 truncate text-[11px] text-text-muted sm:mt-2 sm:text-xs">
              최근 동기화 · <span className={`time-freshness-${syncedAt.tone}`}>{syncedAt.relative}</span> · {syncedAt.absolute}
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-subtle bg-bg-card/45 p-3">
          <p className="sr-only sm:not-sr-only sm:mb-2 sm:text-sm sm:font-semibold sm:text-text-primary">동기화 실행</p>
          <CurrentSyncActions accountId={accountId} running={scopedState.running} locked={lockedByOtherScope} scopes={scopes} />
        </div>
      </div>
      {scopedState.lastError ? (
        <p className="failure-reason-card mt-4">
          {scopedState.lastError.message}
        </p>
      ) : null}
    </section>
  );
}

function isCurrentSyncState(value: unknown): value is CurrentSyncState {
  if (!value || typeof value !== 'object') return false;

  const state = value as Record<string, unknown>;
  return (
    typeof state['running'] === 'boolean' &&
    typeof state['accountId'] !== 'undefined' &&
    typeof state['scope'] !== 'undefined' &&
    typeof state['stage'] === 'string' &&
    typeof state['total'] === 'number' &&
    typeof state['done'] === 'number'
  );
}

function isRelevantScope(state: CurrentSyncState, scopes?: CurrentSyncScope[]) {
  if (!scopes?.length) return true;
  if (!state.scope) return isStageRelevant(state.stage, scopes);
  if (state.scope === 'ALL') return true;
  return scopes.includes(state.scope);
}

function isEventScopeRelevant(scope: unknown, scopes?: CurrentSyncScope[]) {
  if (!scopes?.length) return true;
  if (scope === 'ALL') return true;
  if (scope === 'ASK' || scope === 'INVENTORY') return scopes.includes(scope);
  return false;
}

function isStageRelevant(stage: CurrentSyncState['stage'], scopes: CurrentSyncScope[]) {
  if (stage === 'sync_inventory') return scopes.includes('INVENTORY');
  if (stage === 'sync_ask') return scopes.includes('ASK');
  return stage !== 'bulk_price';
}

function toIdleScopedState(state: CurrentSyncState, scope: CurrentSyncScope | null): CurrentSyncState {
  return {
    ...state,
    running: false,
    scope,
    stage: 'idle',
    total: 0,
    done: 0,
    current: null,
    lastError: null,
    retryState: { active: false },
  };
}
