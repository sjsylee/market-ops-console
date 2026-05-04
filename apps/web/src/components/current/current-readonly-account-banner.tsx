import type { AccountSummary } from '@market-ops/shared';
import { UserRoundCog } from 'lucide-react';
import Link from 'next/link';

export function CurrentReadonlyAccountBanner({ account }: { account: AccountSummary | null }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-subtle bg-bg-card/60 p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-[color:var(--modal-elevated)] text-accent-primary">
            <UserRoundCog size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">입찰 계정</p>
            <h2 className="mt-1 truncate text-base font-bold text-text-primary sm:text-lg">
              {account ? account.displayName : '선택된 계정 없음'}
            </h2>
            <p className="mt-1 truncate text-xs text-text-secondary sm:text-sm">
              {account ? account.email : '입찰 홈에서 계정을 먼저 선택하세요.'}
            </p>
          </div>
        </div>
        <Link
          href="/current"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-bg-card px-4 text-sm font-bold text-text-secondary transition hover:border-glow hover:text-text-primary"
        >
          홈에서 변경
        </Link>
      </div>
    </section>
  );
}
