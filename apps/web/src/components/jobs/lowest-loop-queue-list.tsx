'use client';

import type { LowestLoopQueueItem } from '@market-ops/shared';
import { Loader2, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { removeLowestLoopQueueItem, updateLowestLoopQueueItem } from '../../lib/lowest-loop-client';

const originLabel: Record<LowestLoopQueueItem['saleOrigin'], string> = {
  ASK: '일반 입찰',
  INVENTORY: '보관 입찰',
};

const strategyLabel: Record<LowestLoopQueueItem['strategy'], string> = {
  FOLLOW: '최저가 맞춤',
  OVERTAKE: '한 단계 낮춤',
};

function formatPrice(value: number | null) {
  return value ? `${value.toLocaleString('ko-KR')}원` : '-';
}

function parsePriceInput(value: string) {
  const parsed = Number(value.replace(/\D/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function roundToThousand(value: number) {
  return Math.max(1000, Math.round(value / 1000) * 1000);
}

function formatThousandInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? roundToThousand(Number(digits)).toLocaleString('ko-KR') : '';
}

export function LowestLoopQueueList({ items, running }: { items: LowestLoopQueueItem[]; running: boolean }) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-subtle bg-bg-card/45 p-6 text-sm leading-6 text-text-secondary">
        아직 등록된 최저가 루프 큐가 없습니다. 입찰 관리 페이지에서 상품을 선택하고 최저가 루프에 추가해보세요.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <LowestLoopQueueCard key={item.id} item={item} running={running} />
      ))}
    </div>
  );
}

function LowestLoopQueueCard({ item, running }: { item: LowestLoopQueueItem; running: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<'save' | 'reset' | 'active' | 'delete' | null>(null);
  const [strategy, setStrategy] = useState(item.strategy);
  const [undercutInput, setUndercutInput] = useState(item.undercutStep.toLocaleString('ko-KR'));
  const [budgetInput, setBudgetInput] = useState(item.budget.toLocaleString('ko-KR'));
  const [error, setError] = useState<string | null>(null);
  const undercutStep = parsePriceInput(undercutInput);
  const budget = parsePriceInput(budgetInput);
  const changed =
    strategy !== item.strategy ||
    undercutStep !== item.undercutStep ||
    budget !== item.budget;
  const disabled = running || pending !== null;

  function adjustUndercut(delta: number) {
    const base = undercutStep ?? item.undercutStep ?? 1000;
    setUndercutInput(roundToThousand(base + delta).toLocaleString('ko-KR'));
    setError(null);
  }

  function adjustBudget(delta: number) {
    const base = budget ?? item.budget ?? 5000;
    setBudgetInput(roundToThousand(base + delta).toLocaleString('ko-KR'));
    setError(null);
  }

  async function saveSettings() {
    if (disabled || !changed) return;
    if (!undercutStep || undercutStep % 1000 !== 0) {
      setError('가격 단계는 1,000원 단위로 입력해주세요.');
      return;
    }
    if (!budget || budget % 1000 !== 0) {
      setError('예산은 1,000원 단위로 입력해주세요.');
      return;
    }

    setPending('save');
    try {
      await updateLowestLoopQueueItem(item.id, { strategy, undercutStep, budget });
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '큐 설정 저장에 실패했습니다.');
    } finally {
      setPending(null);
    }
  }

  async function resetSpent() {
    if (disabled) return;
    setPending('reset');
    try {
      await updateLowestLoopQueueItem(item.id, { resetSpent: true, active: true });
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : '사용 예산 초기화에 실패했습니다.');
    } finally {
      setPending(null);
    }
  }

  async function toggleActive() {
    if (disabled) return;
    setPending('active');
    try {
      await updateLowestLoopQueueItem(item.id, { active: !item.active });
      router.refresh();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : '큐 상태 변경에 실패했습니다.');
    } finally {
      setPending(null);
    }
  }

  async function removeItem() {
    if (disabled) return;
    setPending('delete');
    try {
      await removeLowestLoopQueueItem(item.id);
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : '큐 삭제에 실패했습니다.');
    } finally {
      setPending(null);
    }
  }

  return (
    <article className={`min-w-0 overflow-hidden rounded-3xl border p-3 transition sm:p-4 ${item.active ? 'border-subtle bg-bg-card/70' : 'border-subtle bg-bg-card/35 opacity-75'}`}>
      <div className="flex min-w-0 gap-2.5 sm:gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10 sm:h-16 sm:w-16">
          <img
            src={item.imgUrl || '/product-aura-01.svg'}
            alt={item.productName || item.option}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="macro-attempt-pill macro-attempt-pill-active px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs">{originLabel[item.saleOrigin]}</span>
            <span className="macro-attempt-pill px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs">{strategyLabel[item.strategy]}</span>
            <span className={`macro-attempt-pill px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs ${item.active ? 'status-badge-success' : 'status-badge-warning'}`}>
              {item.active ? '활성' : '중지'}
            </span>
          </div>
          <h3 className="product-title mt-2 truncate text-sm font-bold text-text-primary sm:text-base">{item.productName || `상품 #${item.productId}`}</h3>
          <p className="mt-1 truncate text-xs text-text-muted">옵션 {item.option}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
            <PriceCell label="현재가" value={item.bidPrice} />
            <PriceCell label="기준가" value={item.referencePrice} />
            <BudgetCell spent={item.spent} budget={item.budget} />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2.5 rounded-2xl border border-subtle bg-bg-card/45 p-2.5 sm:mt-4 sm:gap-3 sm:p-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">운영 모드</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['FOLLOW', 'OVERTAKE'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStrategy(value);
                  setError(null);
                }}
                disabled={disabled}
                className={`rounded-2xl border px-2.5 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 ${
                  strategy === value
                    ? 'border-glow bg-accent-primary/12 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]'
                    : 'border-subtle bg-bg-card/60 text-text-secondary hover:border-glow'
                }`}
              >
                <span className="block font-bold">{strategyLabel[value]}</span>
                <span className="mt-1 hidden text-[11px] text-text-muted sm:block">
                  {value === 'FOLLOW' ? '기준가에 맞춥니다.' : '기준가보다 한 단계 낮춥니다.'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <QueueNumberEditor
          label="가격 단계"
          value={undercutInput}
          disabled={disabled}
          onChange={(value) => {
            setUndercutInput(formatThousandInput(value));
            setError(null);
          }}
          onDecrease={() => adjustUndercut(-1000)}
          onIncrease={() => adjustUndercut(1000)}
        />
        <QueueNumberEditor
          label="예산"
          value={budgetInput}
          disabled={disabled}
          onChange={(value) => {
            setBudgetInput(formatThousandInput(value));
            setError(null);
          }}
          onDecrease={() => adjustBudget(-1000)}
          onIncrease={() => adjustBudget(1000)}
        />

        {error ? <p className="failure-reason-card">{error}</p> : null}
        {running ? <p className="text-xs text-text-muted">루프 실행 중에는 큐 설정과 삭제를 변경할 수 없습니다.</p> : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={saveSettings}
          disabled={disabled || !changed}
          className="btn-primary h-10 gap-1.5 px-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {pending === 'save' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          저장
        </button>
        <button
          type="button"
          onClick={resetSpent}
          disabled={disabled || item.spent === 0}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-subtle bg-bg-card px-2 text-xs font-bold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {pending === 'reset' ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
          예산 초기화
        </button>
        <button
          type="button"
          onClick={toggleActive}
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-subtle bg-bg-card px-2 text-xs font-bold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
        >
          {pending === 'active' ? <Loader2 size={15} className="animate-spin" /> : item.active ? '일시 중지' : '다시 활성화'}
        </button>
        <button
          type="button"
          onClick={removeItem}
          disabled={disabled}
          className="popconfirm-danger-button inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border px-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {pending === 'delete' ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          삭제
        </button>
      </div>
    </article>
  );
}

function QueueNumberEditor({
  label,
  value,
  disabled,
  onChange,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <span className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] gap-1.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-2">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled}
          className="h-10 rounded-2xl border border-subtle bg-bg-card px-0 text-lg font-black text-text-primary transition hover:border-glow disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
        >
          -
        </button>
        <span className="macro-option-input flex h-10 min-w-0 items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            inputMode="numeric"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold outline-none disabled:cursor-not-allowed"
          />
          <span className="text-sm text-text-muted">원</span>
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={disabled}
          className="h-10 rounded-2xl border border-subtle bg-bg-card px-0 text-lg font-black text-text-primary transition hover:border-glow disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
        >
          +
        </button>
      </span>
    </label>
  );
}

function PriceCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="min-w-0 rounded-2xl border border-subtle bg-bg-card/55 p-1.5 sm:p-2">
      <p className="text-text-muted">{label}</p>
      <p className="mt-1 truncate font-mono font-bold text-text-primary">{formatPrice(value)}</p>
    </div>
  );
}

function BudgetCell({ spent, budget }: { spent: number; budget: number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-subtle bg-bg-card/55 p-1.5 sm:p-2">
      <p className="text-text-muted">예산</p>
      <p className="mt-1 truncate font-mono font-bold text-text-primary">{formatPrice(budget || null)}</p>
      {budget > 0 ? <p className="mt-0.5 truncate text-[10px] text-text-muted">사용 {formatPrice(spent)}</p> : null}
    </div>
  );
}
