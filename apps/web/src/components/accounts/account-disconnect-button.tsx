'use client';

import { Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { disconnectAccount } from '../../lib/accounts-client';

export function AccountDisconnectButton({ accountId, displayName }: { accountId: string; displayName: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    const ok = window.confirm(`'${displayName}' 계정을 목록에서 삭제할까요? 관련 작업 정보도 함께 정리됩니다.`);
    if (!ok) {
      return;
    }

    setPending(true);

    try {
      await disconnectAccount(accountId);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-subtle bg-bg-card px-4 py-2 text-sm text-text-secondary transition hover:border-rose-300/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
      <span>삭제</span>
    </button>
  );
}
