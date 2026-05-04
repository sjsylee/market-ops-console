'use client';

import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createMacroTask } from '../../lib/jobs-client';
import { IM_LOOP_MIN_PRICE } from './im-loop-constants';

export function ImTaskAddForm({
  accountId,
  productId,
  productName,
  imgUrl,
  category,
  option,
  onCreated,
}: {
  accountId: string;
  productId: number;
  productName?: string | null;
  imgUrl?: string | null;
  category?: string[] | null;
  option: string;
  onCreated?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [price, setPrice] = useState('');
  const [method, setMethod] = useState<'p' | 'b'>('p');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < IM_LOOP_MIN_PRICE) return;

    setPending(true);
    try {
      await createMacroTask('im-loop', {
        accountId,
        productId,
        productName: productName || undefined,
        imgUrl: imgUrl || undefined,
        category: category || undefined,
        option,
        price: parsedPrice,
        method,
      });
      setPrice('');
      await onCreated?.();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-3 rounded-2xl border border-subtle bg-bg-card/65 p-4">
      <p className="text-sm font-medium text-text-primary">{option}</p>
      <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="numeric"
          min={IM_LOOP_MIN_PRICE}
          placeholder="목표가 입력"
          className="modal-input h-11 w-full"
        />
        <div className="grid grid-cols-2 gap-2 sm:w-[10rem]">
          <button type="button" onClick={() => setMethod('p')} className={method === 'p' ? 'btn-primary h-11 px-3' : 'inline-flex h-11 items-center justify-center rounded-xl border border-subtle bg-bg-card px-3 text-sm text-text-secondary'}>즉시</button>
          <button type="button" onClick={() => setMethod('b')} className={method === 'b' ? 'btn-primary h-11 px-3' : 'inline-flex h-11 items-center justify-center rounded-xl border border-subtle bg-bg-card px-3 text-sm text-text-secondary'}>입찰</button>
        </div>
      </div>
      <p className="text-xs text-text-muted">목표가는 최소 {IM_LOOP_MIN_PRICE.toLocaleString('ko-KR')}원 이상이어야 합니다.</p>
      <button type="submit" disabled={pending || Number(price) < IM_LOOP_MIN_PRICE} className="btn-primary w-full gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70 md:w-auto">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        <span>입찰 작업 추가</span>
      </button>
    </form>
  );
}
