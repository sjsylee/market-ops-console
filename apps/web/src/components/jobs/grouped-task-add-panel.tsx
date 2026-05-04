'use client';

import type { catalogProductOptionSchema } from '@market-ops/shared';
import { CheckSquare2, Loader2, Plus, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { z } from 'zod';

import { createMacroTask } from '../../lib/jobs-client';

type ProductOption = z.infer<typeof catalogProductOptionSchema>;

type SelectedOption = {
  optionKey?: string | number;
  option: string;
  productId: number;
  quantity: number;
};

export function GroupedTaskAddPanel({
  kind,
  accountId,
  productId,
  productName,
  imgUrl,
  category,
  options,
  onCreated,
}: {
  kind: 'general-loop' | 'bp-loop';
  accountId: string;
  productId: number;
  productName?: string;
  imgUrl?: string;
  category?: string[];
  options: ProductOption[];
  onCreated?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [selectionMap, setSelectionMap] = useState<Record<string, SelectedOption>>({});

  useEffect(() => {
    setSelectionMap({});
  }, [productId, options]);

  const selectedOptions = useMemo(() => Object.values(selectionMap), [selectionMap]);

  async function handleCreateGroupedTask() {
    if (!selectedOptions.length) {
      return;
    }

    setPending(true);
    try {
      await createMacroTask(kind, {
        accountId,
        productId,
        productName,
        imgUrl,
        category,
        options: selectedOptions,
      });
      setSelectionMap({});
      await onCreated?.();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function toggleOption(option: ProductOption) {
    const key = String(option.key);
    setSelectionMap((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      return {
        ...current,
        [key]: {
          optionKey: option.key,
          option: option.key,
          productId,
          quantity: 1,
        },
      };
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-subtle bg-bg-card/55 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">선택 옵션 묶음 추가</p>
            <p className="mt-1 text-xs text-text-muted">동일 상품의 여러 옵션을 하나의 작업으로 함께 보낼 수 있습니다.</p>
          </div>
          <button
            type="button"
            onClick={handleCreateGroupedTask}
            disabled={pending || selectedOptions.length === 0}
            className="btn-primary w-full gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>{selectedOptions.length > 0 ? `${selectedOptions.length}개 옵션 묶음 추가` : '옵션 선택 후 추가'}</span>
          </button>
        </div>
      </div>

      {options.map((option) => {
        const key = String(option.key);
        const selected = selectionMap[key];

        return (
          <div key={option.key} className={`rounded-2xl border p-4 transition ${selected ? 'border-glow bg-accent-primary/10 shadow-[inset_0_0_0_1px_var(--border-glow)]' : 'border-subtle bg-bg-card/65'}`}>
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={() => toggleOption(option)} className="flex min-w-0 items-start gap-3 text-left">
                <span className="mt-0.5 text-accent-primary">
                  {selected ? <CheckSquare2 size={18} /> : <Square size={18} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">{option.name || option.key}</span>
                  {option.stockStatus ? <span className="mt-1 block text-xs text-text-muted">{option.stockStatus}</span> : null}
                </span>
              </button>
              <div className="flex items-center gap-3 lg:justify-end">
                <span className="text-xs text-text-muted">수량</span>
                <input
                  type="number"
                  min={1}
                  disabled={!selected || pending}
                  value={selected?.quantity ?? 1}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setSelectionMap((current) => ({
                      ...current,
                      [key]: {
                        optionKey: option.key,
                        option: option.key,
                        productId,
                        quantity: Number.isFinite(next) && next > 0 ? next : 1,
                      },
                    }));
                  }}
                  className="h-11 w-24 rounded-xl border border-subtle bg-bg-card px-3 text-sm text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
