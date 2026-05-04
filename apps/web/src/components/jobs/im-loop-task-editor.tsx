'use client';

import { Loader2, Minus, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateMacroTask } from '../../lib/jobs-client';
import { IM_LOOP_MIN_PRICE } from './im-loop-constants';

type ImMethod = 'p' | 'b';

function normalizePrice(value: number) {
  if (!Number.isFinite(value)) {
    return IM_LOOP_MIN_PRICE;
  }

  return Math.max(IM_LOOP_MIN_PRICE, Math.round(value / 1000) * 1000);
}

function formatPrice(value: number) {
  return normalizePrice(value).toLocaleString('ko-KR');
}

function parsePrice(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function ImLoopTaskEditor({
  taskId,
  price,
  method,
  disabled = false,
}: {
  taskId: string;
  price: number;
  method: ImMethod;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [draftPrice, setDraftPrice] = useState(price);
  const [draftMethod, setDraftMethod] = useState<ImMethod>(method);
  const [priceFocused, setPriceFocused] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedDraftPrice = normalizePrice(draftPrice);
  const isDirty = normalizedDraftPrice !== price || draftMethod !== method;
  const isDisabled = disabled || pending;

  async function handleSave() {
    if (isDisabled || !isDirty) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      await updateMacroTask('im-loop', taskId, {
        price: normalizedDraftPrice,
        method: draftMethod,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업을 수정하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-subtle bg-bg-card/55 p-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">목표가</p>
          <div className="mt-2 grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] gap-2">
            <button
              type="button"
              onClick={() => setDraftPrice((current) => normalizePrice(current - 1000))}
              disabled={isDisabled}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-subtle bg-bg-card text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="목표가 1,000원 감소"
            >
              <Minus size={15} />
            </button>
            <label className="inline-flex h-10 min-w-0 flex-1 items-center rounded-xl border border-subtle bg-bg-card px-2 transition focus-within:border-glow focus-within:shadow-[0_0_0_1px_var(--border-glow)]">
              <input
                type="text"
                inputMode="numeric"
                value={priceFocused ? String(draftPrice || '') : formatPrice(draftPrice)}
                onChange={(event) => setDraftPrice(parsePrice(event.target.value))}
                onFocus={() => setPriceFocused(true)}
                onBlur={() => {
                  setDraftPrice((current) => normalizePrice(current));
                  setPriceFocused(false);
                }}
                disabled={isDisabled}
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-right text-sm font-semibold text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-70"
              />
              <span className="text-sm text-text-secondary">원</span>
            </label>
            <button
              type="button"
              onClick={() => setDraftPrice((current) => normalizePrice(current + 1000))}
              disabled={isDisabled}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-subtle bg-bg-card text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="목표가 1,000원 증가"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">타입</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDraftMethod('p')}
              disabled={isDisabled}
              className={`im-method-button ${draftMethod === 'p' ? 'im-method-button-instant-active' : 'im-method-button-idle'}`}
            >
              즉시구매
            </button>
            <button
              type="button"
              onClick={() => setDraftMethod('b')}
              disabled={isDisabled}
              className={`im-method-button ${draftMethod === 'b' ? 'im-method-button-bid-active' : 'im-method-button-idle'}`}
            >
              구매 입찰
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          {disabled ? '실행 중이거나 대기 상태가 아닌 작업은 수정할 수 없습니다.' : '목표가는 1,000원 단위로 저장됩니다.'}
          {!disabled ? ` 최소 ${IM_LOOP_MIN_PRICE.toLocaleString('ko-KR')}원 이상입니다.` : null}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isDisabled || !isDirty}
          className="btn-primary h-10 gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{pending ? '저장 중' : '변경 저장'}</span>
        </button>
      </div>
      {error ? <p className="feedback-error mt-3">{error}</p> : null}
    </div>
  );
}
