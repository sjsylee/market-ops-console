'use client';

import type { CurrentSyncScope } from '@market-ops/shared';
import { Loader2, Pause, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { startCurrentSyncClient, stopCurrentSyncClient } from '../../lib/current-client';

const scopeDescription: Record<CurrentSyncScope, string> = {
  ALL: '전체',
  INVENTORY: '보관',
  ASK: '일반',
};

export function CurrentSyncActions({
  accountId,
  running,
  locked = false,
  scopes,
}: {
  accountId?: string;
  running: boolean;
  locked?: boolean;
  scopes?: CurrentSyncScope[];
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const disabled = !accountId || locked || pendingAction !== null;
  const visibleScopes = scopes?.length ? scopes : (['ALL'] satisfies CurrentSyncScope[]);

  async function start(scope: CurrentSyncScope, includePrices: boolean) {
    if (!accountId || running || pendingAction) return;

    const actionKey = `${scope}:${includePrices ? 'price' : 'list'}`;
    setPendingAction(actionKey);
    try {
      await startCurrentSyncClient(accountId, scope, includePrices);
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  async function stop() {
    if (!running || pendingAction) return;

    setPendingAction('stop');
    try {
      await stopCurrentSyncClient();
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2">
      {running ? (
        <button
          type="button"
          onClick={stop}
          disabled={pendingAction !== null}
          className="col-span-2 inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-2xl border border-subtle bg-bg-card px-3 text-sm font-bold text-text-primary transition hover:border-glow disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-4"
        >
          {pendingAction === 'stop' ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} />}
          <span>동기화 중지</span>
        </button>
      ) : (
        visibleScopes.flatMap((scope) => [
          <SyncButton
            key={`${scope}:list`}
            label="입찰 동기화"
            description={`${scopeDescription[scope]} 리스트만 갱신`}
            pending={pendingAction === `${scope}:list`}
            disabled={disabled}
            onClick={() => start(scope, false)}
          />,
          <SyncButton
            key={`${scope}:price`}
            label="가격 동기화"
            description="리스트 갱신 후 가격 갱신"
            pending={pendingAction === `${scope}:price`}
            disabled={disabled}
            onClick={() => start(scope, true)}
          />,
        ])
      )}
      {locked ? (
        <p className="col-span-2 text-center text-xs font-medium text-text-muted">다른 입찰 동기화가 끝나면 실행할 수 있습니다.</p>
      ) : null}
    </div>
  );
}

function SyncButton({
  label,
  description,
  pending,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group min-w-0 rounded-2xl border border-subtle bg-bg-card/65 px-3 py-2 text-left transition hover:border-glow hover:bg-bg-card-hover disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3"
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-text-primary">
        {pending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-1 hidden text-xs leading-5 text-text-muted sm:block">{description}</span>
    </button>
  );
}
