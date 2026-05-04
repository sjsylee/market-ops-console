'use client';

import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createMacroTask } from '../../lib/jobs-client';

export function OptionTaskAddControls({
  kind,
  payload,
}: {
  kind: 'general-loop' | 'bp-loop';
  payload: {
    accountId: string;
    productId: number;
    productName?: string;
    imgUrl?: string;
    optionKey?: string | number;
    option: string;
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [quantity, setQuantity] = useState(1);

  async function handleClick() {
    setPending(true);
    try {
      await createMacroTask(kind, {
        accountId: payload.accountId,
        productId: payload.productId,
        productName: payload.productName,
        imgUrl: payload.imgUrl,
        options: [
          {
            optionKey: payload.optionKey,
            option: payload.option,
            productId: payload.productId,
            quantity,
          },
        ],
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => {
          const next = Number(event.target.value);
          setQuantity(Number.isFinite(next) && next > 0 ? next : 1);
        }}
        className="h-11 w-full rounded-xl border border-subtle bg-bg-card px-3 text-sm text-text-primary outline-none sm:w-20"
      />
      <button type="button" onClick={handleClick} disabled={pending} className="btn-primary w-full gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        <span>작업 추가</span>
      </button>
    </div>
  );
}
