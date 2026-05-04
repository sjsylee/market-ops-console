'use client';

import type { AccountSummary } from '@market-ops/shared';
import { CheckCircle2, ChevronRight, Loader2, Radar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { selectLoopAccount } from '../../lib/accounts-client';
import { ModalOverlay } from '../ui/modal-overlay';

export function CurrentAccountSlot({
  accounts,
  selectedAccountId,
  autoSelected,
  running,
}: {
  accounts: AccountSummary[];
  selectedAccountId?: string;
  autoSelected: boolean;
  running: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;
  const statusLabel = selectedAccount ? (autoSelected ? '자동 선택' : '선택됨') : '미선택';

  async function handleSelect(accountId: string) {
    if (running || pendingId || accountId === selectedAccountId) {
      setOpen(false);
      return;
    }

    setPendingId(accountId);
    try {
      await selectLoopAccount('current-sync', accountId);
      setOpen(false);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-subtle bg-bg-card/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-[color:var(--modal-elevated)] text-accent-primary sm:h-11 sm:w-11">
              <Radar size={19} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">입찰 계정</p>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  selectedAccount
                    ? 'border-glow bg-accent-primary/10 text-accent-primary'
                    : 'border-subtle bg-bg-card text-text-muted'
                }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap pb-1 pt-0.5 font-body text-base font-bold leading-[1.45] text-text-primary sm:text-xl sm:leading-[1.45]">
                {selectedAccount ? selectedAccount.displayName : '입찰 동기화 계정을 선택하세요'}
              </p>
              <p className="mt-1 hidden truncate text-sm text-text-secondary sm:block">
                {selectedAccount
                  ? `${selectedAccount.email} · 변경 전까지 이 계정의 저장된 입찰 데이터를 사용합니다.`
                  : accounts.length > 1
                    ? '여러 일반 계정 중 입찰 페이지에서 사용할 계정을 선택합니다.'
                    : '사용 가능한 일반 계정이 없습니다.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!accounts.length || running}
            className="inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-2xl border border-subtle bg-bg-card px-4 text-sm font-bold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 lg:w-auto"
          >
            <span>{running ? '동기화 중 변경 불가' : selectedAccount ? '계정 변경' : '계정 선택'}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      <ModalOverlay open={open} onClose={() => setOpen(false)} maxWidthClass="max-w-2xl">
        <div className="modal-panel overflow-hidden p-0">
          <div className="flex items-start justify-between gap-4 border-b border-subtle p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">입찰 계정</p>
              <h3 className="mt-1 text-xl font-bold text-text-primary">동기화 계정 선택</h3>
              <p className="mt-2 text-sm text-text-secondary">선택한 계정은 current 페이지에 저장되고, 다시 변경하기 전까지 유지됩니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary transition hover:border-glow hover:text-text-primary"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid gap-3 p-5">
            {accounts.map((account) => {
              const selected = account.id === selectedAccountId;
              const pending = pendingId === account.id;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelect(account.id)}
                  disabled={running || pendingId !== null}
                  className={`flex min-w-0 items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${
                    selected
                      ? 'border-glow bg-accent-primary/10 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]'
                      : 'border-subtle bg-bg-card/65 text-text-secondary hover:border-glow hover:text-text-primary'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{account.displayName}</span>
                    <span className="mt-1 block truncate text-xs text-text-muted">{account.email}</span>
                  </span>
                  {pending ? <Loader2 size={17} className="shrink-0 animate-spin" /> : selected ? <CheckCircle2 size={18} className="shrink-0 text-accent-primary" /> : <ChevronRight size={17} className="shrink-0 text-text-muted" />}
                </button>
              );
            })}
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}
