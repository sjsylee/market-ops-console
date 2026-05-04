'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { selectAccount } from '../../lib/accounts-client';

export function AccountSelectButton({ accountId, selected }: { accountId: string; selected: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (selected || pending) {
      return;
    }

    setPending(true);

    try {
      await selectAccount(accountId);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={selected || pending}
      className={[
        'inline-flex w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition',
        selected
          ? 'border-glow bg-accent-primary/12 text-accent-primary'
          : 'border-subtle bg-bg-card text-text-secondary hover:border-glow hover:text-text-primary',
        pending ? 'opacity-75' : '',
      ].join(' ')}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : null}
      <span>{selected ? '선택됨' : '이 계정 사용'}</span>
    </button>
  );
}
