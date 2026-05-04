'use client';

import type { AccountSummary, LoopAccountSelectionKind } from '@market-ops/shared';
import { CheckCircle2, ChevronRight, Loader2, UserRoundCog, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { selectLoopAccount } from '../../lib/accounts-client';
import { ModalOverlay } from '../ui/modal-overlay';

export function LoopAccountSlot({
  kind,
  accounts,
  selectedAccountId,
  autoSelected,
  running,
}: {
  kind: LoopAccountSelectionKind;
  accounts: AccountSummary[];
  selectedAccountId?: string;
  autoSelected: boolean;
  running: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSelect(accountId: string) {
    if (running || accountId === selectedAccountId || pendingId) {
      setOpen(false);
      return;
    }

    setPendingId(accountId);
    try {
      await selectLoopAccount(kind, accountId);
      setOpen(false);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;
  const statusLabel = selectedAccount ? (autoSelected ? '자동 할당' : '할당됨') : '미선택';

  return (
    <>
      <div className="rounded-2xl border border-subtle bg-bg-card/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary">
              <UserRoundCog size={15} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-text-primary">계정 슬롯</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  selectedAccount
                    ? 'border-glow bg-accent-primary/10 text-accent-primary'
                    : 'border-subtle bg-bg-card text-text-muted'
                }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-text-secondary sm:text-sm">
                {selectedAccount
                  ? `${selectedAccount.displayName} · ${selectedAccount.email}`
                  : accounts.length > 1
                    ? '시작 전 사용할 계정을 선택해야 합니다.'
                    : '사용 가능한 계정이 없습니다.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!accounts.length || running}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-subtle bg-bg-card px-4 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{running ? '실행 중 변경 불가' : selectedAccount ? '계정 변경' : '계정 선택'}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <ModalOverlay open={open} onClose={() => setOpen(false)} maxWidthClass="max-w-2xl">
        <div className="modal-panel overflow-hidden p-0">
          <div className="flex items-start justify-between gap-4 border-b border-subtle p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Account Slot</p>
              <h3 className="mt-1 text-xl font-bold text-text-primary">루프 계정 선택</h3>
              <p className="mt-2 text-sm text-text-secondary">선택한 계정은 이 루프에 저장되고, 변경하기 전까지 계속 유지됩니다.</p>
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

            <div className="rounded-2xl border border-subtle bg-bg-card/45 p-3 text-xs leading-5 text-text-muted">
              일반 보관과 구매 입찰은 일반 운영 계정만, 입점 보관은 BP 계정만 선택할 수 있습니다.
            </div>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}
