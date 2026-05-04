'use client';

import type { CurrentItem } from '@market-ops/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { updateCurrentBidPriceClient, updateCurrentInventoryBidPricesClient } from '../../lib/current-client';
import { createLowestLoopQueueItem } from '../../lib/lowest-loop-client';
import { getFreshness } from '../../lib/time-freshness';
import { ModalOverlay } from '../ui/modal-overlay';

const originLabel: Record<CurrentItem['saleOrigin'], string> = {
  ASK: '일반 판매',
  INVENTORY: '보관 판매',
};

const inventoryStatusLabel: Record<string, string> = {
  live: '입찰중',
  in_storage: '판매대기',
};

const inventoryStatusClass: Record<string, string> = {
  live: 'current-inventory-status-live',
  in_storage: 'current-inventory-status-storage',
};

const exposureClass: Record<string, string> = {
  exposed: 'current-exposure-status-live',
  hidden: 'current-exposure-status-hidden',
  planned: 'current-exposure-status-planned',
};

const filterValueClass: Record<BidFilter, string> = {
  ALL: 'current-filter-value-all',
  live: 'current-filter-value-live',
  in_storage: 'current-filter-value-storage',
  exposed: 'current-filter-value-exposed',
  hidden: 'current-filter-value-hidden',
};

function formatPrice(value: number | null) {
  return value ? `${value.toLocaleString('ko-KR')}원` : '-';
}

function parsePriceInput(value: string) {
  const parsed = Number(value.replace(/\D/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function roundToThousand(value: number) {
  return Math.max(0, Math.round(value / 1000) * 1000);
}

type BidFilter = 'ALL' | 'live' | 'in_storage' | 'exposed' | 'hidden';
type ExposureState = 'exposed' | 'hidden' | 'unknown';
type DisplayExposureState = ExposureState | 'planned';
type LowestLoopStrategy = 'FOLLOW' | 'OVERTAKE';

function getReferencePrice(item: CurrentItem, saleOrigin: CurrentItem['saleOrigin']) {
  return saleOrigin === 'INVENTORY' ? item.bPrice : item.pPrice;
}

function getExposureState(item: CurrentItem, saleOrigin: CurrentItem['saleOrigin']): ExposureState {
  if (saleOrigin === 'INVENTORY' && item.status === 'in_storage') return 'unknown';

  const referencePrice = getReferencePrice(item, saleOrigin);
  if (!item.price || !referencePrice) return 'unknown';

  return item.price > referencePrice ? 'hidden' : 'exposed';
}

function getHiddenDelta(item: CurrentItem, saleOrigin: CurrentItem['saleOrigin']) {
  const referencePrice = getReferencePrice(item, saleOrigin);
  if (!item.price || !referencePrice || item.price <= referencePrice) return null;

  return item.price - referencePrice;
}

function matchesFilter(item: CurrentItem, saleOrigin: CurrentItem['saleOrigin'], filter: BidFilter) {
  if (filter === 'ALL') return true;
  if (filter === 'live' || filter === 'in_storage') return item.status === filter;

  return getExposureState(item, saleOrigin) === filter;
}

export function CurrentItemList({
  items,
  selectedItemId,
  saleOrigin,
}: {
  items: CurrentItem[];
  selectedItemId?: string;
  saleOrigin: CurrentItem['saleOrigin'];
}) {
  const router = useRouter();
  const [bidFilter, setBidFilter] = useState<BidFilter>('ALL');
  const [priceInput, setPriceInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [lowestLoopPending, setLowestLoopPending] = useState(false);
  const [lowestLoopModalOpen, setLowestLoopModalOpen] = useState(false);
  const [lowestLoopTargets, setLowestLoopTargets] = useState<CurrentItem[]>([]);
  const [lowestLoopStrategy, setLowestLoopStrategy] = useState<LowestLoopStrategy>('FOLLOW');
  const [lowestLoopUndercutInput, setLowestLoopUndercutInput] = useState('1,000');
  const [lowestLoopBudgetInput, setLowestLoopBudgetInput] = useState('5,000');
  const [lowestLoopError, setLowestLoopError] = useState<string | null>(null);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const liveCount = items.filter((item) => item.status === 'live').length;
  const inStorageCount = items.filter((item) => item.status === 'in_storage').length;
  const exposedCount = items.filter((item) => getExposureState(item, saleOrigin) === 'exposed').length;
  const hiddenCount = items.filter((item) => getExposureState(item, saleOrigin) === 'hidden').length;
  const filteredItems = items.filter((item) => matchesFilter(item, saleOrigin, bidFilter));
  const selectedItem = filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0];
  const selectedExposure = selectedItem ? getExposureState(selectedItem, saleOrigin) : 'unknown';
  const selectedHiddenDelta = selectedItem ? getHiddenDelta(selectedItem, saleOrigin) : null;
  const selectedReferencePrice = selectedItem ? getReferencePrice(selectedItem, saleOrigin) : null;
  const nextPrice = parsePriceInput(priceInput);
  const nextExposure =
    selectedItem && nextPrice
      ? getExposureState({ ...selectedItem, price: nextPrice, status: selectedItem.status === 'in_storage' ? 'live' : selectedItem.status }, saleOrigin)
      : selectedExposure;
  const nextHiddenDelta =
    selectedItem && nextPrice
      ? getHiddenDelta({ ...selectedItem, price: nextPrice, status: selectedItem.status === 'in_storage' ? 'live' : selectedItem.status }, saleOrigin)
      : selectedHiddenDelta;
  const hasPriceDraft = selectedItem ? nextPrice !== null && nextPrice !== selectedItem.price : false;
  const canSubmitPriceUpdate = selectedItem ? hasPriceDraft && nextPrice !== null && nextPrice > 0 && nextPrice % 1000 === 0 : false;
  const displayExposure: DisplayExposureState =
    hasPriceDraft && selectedExposure !== 'exposed' && nextExposure === 'exposed' ? 'planned' : nextExposure;
  const reflectedAt = getFreshness(selectedItem?.lastSeenAt);
  const bulkCandidates = filteredItems.filter((item) => {
    const exposure = getExposureState(item, saleOrigin);
    return (exposure === 'hidden' || item.status === 'in_storage') && getReferencePrice(item, saleOrigin);
  });
  const bulkSelection = bulkCandidates.filter((item) => selectedBulkIds.includes(item.id));
  const allBulkSelected = bulkCandidates.length > 0 && bulkSelection.length === bulkCandidates.length;

  useEffect(() => {
    setPriceInput(selectedItem?.price ? roundToThousand(selectedItem.price).toLocaleString('ko-KR') : '');
    setFormError(null);
  }, [selectedItem?.id, selectedItem?.price]);

  useEffect(() => {
    setSelectedBulkIds([]);
    setBulkError(null);
  }, [bidFilter, saleOrigin]);

  function handlePriceInput(value: string) {
    const digits = value.replace(/\D/g, '');
    setPriceInput(digits ? roundToThousand(Number(digits)).toLocaleString('ko-KR') : '');
    setFormError(null);
  }

  function adjustPrice(delta: number) {
    const base = nextPrice ?? selectedItem?.price ?? 0;
    const adjusted = Math.max(0, roundToThousand(base + delta));
    setPriceInput(adjusted ? adjusted.toLocaleString('ko-KR') : '');
    setFormError(null);
  }

  function formatThousandInput(value: string) {
    const digits = value.replace(/\D/g, '');
    return digits ? roundToThousand(Number(digits)).toLocaleString('ko-KR') : '';
  }

  function adjustLowestLoopUndercut(delta: number) {
    const base = parsePriceInput(lowestLoopUndercutInput) ?? 1000;
    setLowestLoopUndercutInput(Math.max(1000, roundToThousand(base + delta)).toLocaleString('ko-KR'));
    setLowestLoopError(null);
  }

  function adjustLowestLoopBudget(delta: number) {
    const base = parsePriceInput(lowestLoopBudgetInput) ?? 5000;
    setLowestLoopBudgetInput(Math.max(1000, roundToThousand(base + delta)).toLocaleString('ko-KR'));
    setLowestLoopError(null);
  }

  function matchReferencePrice() {
    if (!selectedReferencePrice) return;

    setPriceInput(roundToThousand(selectedReferencePrice).toLocaleString('ko-KR'));
    setFormError(null);
  }

  function submitPriceUpdate() {
    if (!selectedItem || !nextPrice) {
      setFormError('변경할 입찰가를 입력해주세요.');
      return;
    }

    if (!canSubmitPriceUpdate) {
      setFormError('이전 입찰가와 다른 금액을 입력해주세요.');
      return;
    }

    if (nextPrice % 1000 !== 0) {
      setFormError('입찰가는 1,000원 단위로 변경할 수 있습니다.');
      return;
    }

    setSaving(true);
    updateCurrentBidPriceClient({
      accountId: selectedItem.accountId,
      saleOrigin,
      key: selectedItem.externalKey,
      price: nextPrice,
      productId: selectedItem.productId,
    })
      .then(() => {
        setMobileDetailOpen(false);
        router.refresh();
      })
      .catch((error) => {
        setFormError(error instanceof Error ? error.message : '입찰가 변경에 실패했습니다.');
      })
      .finally(() => setSaving(false));
  }

  function toggleBulkItem(id: string) {
    setSelectedBulkIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
    setBulkError(null);
  }

  function toggleAllBulkCandidates() {
    setSelectedBulkIds(allBulkSelected ? [] : bulkCandidates.map((item) => item.id));
    setBulkError(null);
  }

  function clearBulkSelection() {
    setSelectedBulkIds([]);
    setBulkError(null);
  }

  function submitBulkExposure() {
    if (saleOrigin !== 'INVENTORY' || bulkSelection.length === 0) {
      setBulkError('노출할 보관 입찰을 선택해주세요.');
      return;
    }

    const firstItem = bulkSelection[0];
    if (!firstItem) return;

    setBulkSaving(true);
    updateCurrentInventoryBidPricesClient({
      accountId: firstItem.accountId,
      items: bulkSelection
        .map((item) => {
          const price = getReferencePrice(item, saleOrigin);
          return price
            ? {
                key: item.externalKey,
                price: roundToThousand(price),
                productId: item.productId,
              }
            : null;
        })
        .filter((item): item is { key: number; price: number; productId: number } => item !== null),
    })
      .then(() => {
        clearBulkSelection();
        router.refresh();
      })
      .catch((error) => {
        setBulkError(error instanceof Error ? error.message : '일괄 노출 처리에 실패했습니다.');
      })
      .finally(() => setBulkSaving(false));
  }

  function openLowestLoopModal(targets: CurrentItem[]) {
    if (!targets.length || lowestLoopPending) return;

    setLowestLoopTargets(targets);
    setLowestLoopStrategy('FOLLOW');
    setLowestLoopUndercutInput('1,000');
    setLowestLoopBudgetInput('5,000');
    setLowestLoopError(null);
    setLowestLoopModalOpen(true);
  }

  function submitLowestLoopQueue() {
    if (!lowestLoopTargets.length || lowestLoopPending) return;

    const undercutStep = parsePriceInput(lowestLoopUndercutInput) ?? 1000;
    const budget = parsePriceInput(lowestLoopBudgetInput) ?? 5000;

    if (undercutStep <= 0 || undercutStep % 1000 !== 0) {
      setLowestLoopError('가격 단계는 1,000원 단위로 입력해주세요.');
      return;
    }

    if (budget <= 0 || budget % 1000 !== 0) {
      setLowestLoopError('예산은 1,000원 단위로 입력해주세요.');
      return;
    }

    setLowestLoopPending(true);
    Promise.all(
      lowestLoopTargets.map((item) =>
        createLowestLoopQueueItem({
          accountId: item.accountId,
          externalKey: item.externalKey,
          productId: item.productId,
          option: item.option,
          saleOrigin,
          active: true,
          strategy: lowestLoopStrategy,
          undercutStep,
          budget,
        }),
      ),
    )
      .then(() => {
        setLowestLoopModalOpen(false);
        setLowestLoopTargets([]);
        clearBulkSelection();
        router.refresh();
      })
      .catch((error) => {
        setLowestLoopError(error instanceof Error ? error.message : '최저가 루프 큐 추가에 실패했습니다.');
      })
      .finally(() => setLowestLoopPending(false));
  }

  return (
    <div className="grid min-w-0 gap-3">
      <div className={`grid min-w-0 grid-cols-3 gap-2 ${saleOrigin === 'INVENTORY' ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}>
        <BidFilterCard
          active={bidFilter === 'ALL'}
          label="전체"
          count={items.length}
          tone="ALL"
          onClick={() => setBidFilter('ALL')}
        />
        {saleOrigin === 'INVENTORY' ? (
          <>
            <BidFilterCard
              active={bidFilter === 'live'}
              label="입찰중"
              count={liveCount}
              tone="live"
              onClick={() => setBidFilter('live')}
            />
            <BidFilterCard
              active={bidFilter === 'in_storage'}
              label="판매대기"
              count={inStorageCount}
              tone="in_storage"
              onClick={() => setBidFilter('in_storage')}
            />
          </>
        ) : null}
        <BidFilterCard
          active={bidFilter === 'exposed'}
          label="노출중"
          count={exposedCount}
          tone="exposed"
          onClick={() => setBidFilter('exposed')}
        />
        <BidFilterCard
          active={bidFilter === 'hidden'}
          label="미노출"
          count={hiddenCount}
          tone="hidden"
          onClick={() => setBidFilter('hidden')}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[0.74fr_1.26fr]">
      <div className="min-w-0 rounded-3xl border border-subtle bg-bg-card/45 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <p className="text-sm font-bold text-text-primary">입찰 목록</p>
            <span className="text-xs text-text-muted">{filteredItems.length}개</span>
          </div>
          {bulkCandidates.length > 0 ? (
            <div className="flex items-center gap-2 text-xs">
              <button type="button" onClick={toggleAllBulkCandidates} className="font-bold text-accent-primary">
                {allBulkSelected ? '전체 해제' : '전체 선택'}
              </button>
              <span className="text-text-muted">선택 {bulkSelection.length}개</span>
            </div>
          ) : null}
        </div>
        {bulkSelection.length > 0 ? (
          <div className="mb-3 rounded-2xl border border-glow bg-accent-primary/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-text-primary">선택한 미노출 입찰을 최저가로 맞춥니다.</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={clearBulkSelection} className="text-xs font-bold text-text-muted">
                  선택 해제
                </button>
                <button
                  type="button"
                  onClick={submitBulkExposure}
                  disabled={bulkSaving || saleOrigin !== 'INVENTORY'}
                  className="btn-primary h-9 px-4 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkSaving ? '처리 중' : `${bulkSelection.length}개 노출`}
                </button>
                <button
                  type="button"
                  onClick={() => openLowestLoopModal(bulkSelection)}
                  disabled={bulkSaving}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-glow bg-accent-primary/10 px-4 text-xs font-bold text-accent-primary transition hover:bg-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  루프 추가
                </button>
              </div>
            </div>
            {bulkError ? <p className="failure-reason-card mt-2">{bulkError}</p> : null}
          </div>
        ) : null}
        <div className="-mx-1 max-h-[48vh] space-y-2 overflow-y-auto overflow-x-hidden px-2 py-1.5 [overflow-anchor:none]">
          {filteredItems.map((item) => {
            const selected = item.id === selectedItem?.id;
            const statusLabel = inventoryStatusLabel[item.status] ?? item.status;
            const exposure = getExposureState(item, saleOrigin);
            const exposureCardClass =
              exposure === 'hidden'
                ? 'current-bid-row-hidden'
                : exposure === 'exposed'
                  ? 'current-bid-row-exposed'
                  : '';
            const surfaceClass = exposureCardClass || 'bg-bg-card/65';
            const selectableForBulk =
              saleOrigin === 'INVENTORY' &&
              (exposure === 'hidden' || item.status === 'in_storage') &&
              Boolean(getReferencePrice(item, saleOrigin));
            const checkedForBulk = selectedBulkIds.includes(item.id);
            const compactPills = exposure === 'hidden';

            return (
              <Link
                key={item.id}
                href={`?item=${item.id}`}
                scroll={false}
                onClick={() => setMobileDetailOpen(true)}
                className={`relative block overflow-hidden rounded-2xl border p-3 transition ${selectableForBulk ? 'pl-7' : ''} ${surfaceClass} ${
                  selected
                    ? 'border-glow shadow-[inset_0_0_0_1px_var(--border-glow)]'
                    : 'border-subtle hover:border-glow hover:bg-bg-card-hover'
                }`}
              >
                {selectableForBulk ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleBulkItem(item.id);
                    }}
                    className={`absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded border transition ${
                      checkedForBulk ? 'border-glow bg-accent-primary shadow-[inset_0_0_0_3px_var(--accent-contrast)]' : 'border-subtle bg-bg-card'
                    }`}
                    aria-label="일괄 노출 선택"
                  />
                ) : null}
                <div className="flex min-w-0 gap-2.5">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
                    <img
                      src={item.imgUrl || '/product-aura-01.svg'}
                      alt={item.name || item.option}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                      <span className={`macro-attempt-pill shrink-0 ${compactPills ? 'px-2 py-0.5 text-[10px]' : ''}`}>{originLabel[item.saleOrigin]}</span>
                      {item.saleOrigin === 'INVENTORY' ? <InventoryStatusPill status={item.status} label={statusLabel} compact={compactPills} /> : null}
                      {exposure !== 'unknown' ? <ExposurePill state={exposure} compact={compactPills} /> : null}
                    </div>
                    <h3 className="product-title mt-2 truncate text-sm font-bold text-text-primary">{item.name || `상품 #${item.productId}`}</h3>
                    <p className="mt-1 truncate text-xs text-text-muted">{item.option}</p>
                  </div>
                </div>
              </Link>
            );
          })}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-4 text-sm text-text-secondary">
              선택한 조건에 해당하는 입찰이 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      {selectedItem && mobileDetailOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            aria-label="상세 닫기"
            className="current-mobile-sheet-backdrop absolute inset-0 bg-[color:var(--modal-backdrop)]"
            onClick={() => setMobileDetailOpen(false)}
          />
          <div className="current-mobile-sheet-panel absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[2rem] border border-subtle bg-[color:var(--modal-surface)] p-4 shadow-[0_-24px_64px_rgba(2,6,23,0.34)]">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-text-muted/30" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
                  <img
                    src={selectedItem.imgUrl || '/product-aura-01.svg'}
                    alt={selectedItem.name || selectedItem.option}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">입찰 상세</p>
                  <h3 className="product-title mt-1 overflow-hidden text-lg font-black leading-tight text-text-primary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{selectedItem.name || '상품명 없음'}</h3>
                  <p className="mt-1 truncate text-xs text-text-muted">옵션 {selectedItem.option}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-subtle bg-bg-card text-xl text-text-secondary"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label="현재 판매가" value={formatPrice(selectedItem.price)} accent />
              <Metric label={saleOrigin === 'INVENTORY' ? '보관 최저가' : '일반 최저가'} value={formatPrice(selectedReferencePrice)} />
              <Metric label="수수료" value={formatPrice(selectedItem.fee)} />
              <Metric label="판매 유형" value={selectedItem.isStored ? '리리셀' : '리셀'} />
            </div>

            <div className="mt-4 rounded-2xl border border-subtle bg-bg-card/45 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">최근 반영</p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                <span className={`time-freshness-${reflectedAt.tone}`}>{reflectedAt.relative}</span>
                <span className="ml-2 text-xs font-medium text-text-muted">{reflectedAt.absolute}</span>
              </p>
              <div className="mt-2">
                <ExposureSummary state={displayExposure} hiddenDelta={nextHiddenDelta} referencePrice={selectedReferencePrice} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">가격 조정</p>
              <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
                <button type="button" onClick={() => adjustPrice(-1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary">
                  -
                </button>
                <label className="macro-option-input flex items-center gap-2">
                  <input
                    value={priceInput}
                    onChange={(event) => handlePriceInput(event.target.value)}
                    onBlur={() => nextPrice ? setPriceInput(roundToThousand(nextPrice).toLocaleString('ko-KR')) : null}
                    inputMode="numeric"
                    placeholder="입찰가 입력"
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold outline-none"
                  />
                  <span className="shrink-0 text-sm text-text-muted">원</span>
                </label>
                <button type="button" onClick={() => adjustPrice(1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary">
                  +
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectedItem ? openLowestLoopModal([selectedItem]) : null}
                  disabled={lowestLoopPending}
                  className="col-span-2 h-10 rounded-2xl border border-glow bg-accent-primary/10 px-4 text-sm font-bold text-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lowestLoopPending ? '큐 추가 중' : '최저가 루프에 추가'}
                </button>
                <button
                  type="button"
                  onClick={matchReferencePrice}
                  disabled={!selectedReferencePrice || selectedExposure === 'exposed'}
                  className="h-11 rounded-2xl border border-glow bg-accent-primary/10 px-4 text-sm font-bold text-accent-primary disabled:cursor-not-allowed disabled:border-subtle disabled:bg-bg-card/55 disabled:text-text-muted"
                >
                  최저가
                </button>
                <button
                  type="button"
                  onClick={submitPriceUpdate}
                  disabled={saving || !canSubmitPriceUpdate}
                  className="btn-primary h-11 justify-center px-5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? '변경 중' : '변경 확인'}
                </button>
              </div>
              {formError ? <p className="failure-reason-card mt-3">{formError}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      <article className="hidden min-w-0 overflow-hidden rounded-3xl border border-subtle bg-bg-card/70 xl:block">
        {selectedItem ? (
          <>
            <div className="border-b border-subtle p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-subtle bg-black/10">
                  <img
                    src={selectedItem.imgUrl || '/product-aura-01.svg'}
                    alt={selectedItem.name || selectedItem.option}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">PRODUCT #{selectedItem.productId}</p>
                  <h2 className="product-title mt-2 max-w-3xl overflow-hidden break-keep text-2xl font-black leading-tight text-text-primary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {selectedItem.name || '상품명 없음'}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="macro-attempt-pill macro-attempt-pill-active">{originLabel[selectedItem.saleOrigin]}</span>
                    <span className="macro-attempt-pill">옵션 {selectedItem.option}</span>
                    {selectedItem.saleOrigin === 'INVENTORY' ? (
                      <InventoryStatusPill status={selectedItem.status} label={inventoryStatusLabel[selectedItem.status] ?? selectedItem.status} />
                    ) : null}
                    {selectedExposure !== 'unknown' ? <ExposurePill state={selectedExposure} /> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
              <Metric label="현재 판매가" value={formatPrice(selectedItem.price)} accent />
              <Metric label={saleOrigin === 'INVENTORY' ? '보관 최저가' : '일반 최저가'} value={formatPrice(selectedReferencePrice)} />
              <Metric label="수수료" value={formatPrice(selectedItem.fee)} />
              <Metric label="매입가" value={formatPrice(selectedItem.purchasePrice)} />
              <Metric label="판매 유형" value={selectedItem.isStored ? '리리셀' : '리셀'} />
            </div>

            <div className="border-t border-subtle p-5">
              <div className="grid gap-3">
                <div className="flex flex-col gap-2 rounded-2xl border border-subtle bg-bg-card/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">최근 반영</p>
                    <p className="mt-1 text-sm font-bold text-text-primary">
                      <span className={`time-freshness-${reflectedAt.tone}`}>{reflectedAt.relative}</span>
                      <span className="ml-2 text-xs font-medium text-text-muted">{reflectedAt.absolute}</span>
                    </p>
                  </div>
                  <ExposureSummary
                    state={displayExposure}
                    hiddenDelta={nextHiddenDelta}
                    referencePrice={selectedReferencePrice}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">가격 조정</p>
                  <div className="mt-2 grid gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto]">
                    <button
                      type="button"
                      onClick={() => adjustPrice(-1000)}
                      className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow"
                    >
                      -
                    </button>
                    <label className="macro-option-input flex items-center gap-2">
                      <input
                        value={priceInput}
                        onChange={(event) => handlePriceInput(event.target.value)}
                        onBlur={() => nextPrice ? setPriceInput(roundToThousand(nextPrice).toLocaleString('ko-KR')) : null}
                        inputMode="numeric"
                        placeholder="입찰가 입력"
                        className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold outline-none"
                      />
                      <span className="shrink-0 text-sm text-text-muted">원</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => adjustPrice(1000)}
                      className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedItem ? openLowestLoopModal([selectedItem]) : null}
                      disabled={lowestLoopPending}
                      className="h-11 rounded-2xl border border-glow bg-accent-primary/10 px-4 text-sm font-bold text-accent-primary transition hover:bg-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {lowestLoopPending ? '큐 추가 중' : '루프 추가'}
                    </button>
                    <button
                      type="button"
                      onClick={matchReferencePrice}
                      disabled={!selectedReferencePrice || selectedExposure === 'exposed'}
                      className="h-11 rounded-2xl border border-glow bg-accent-primary/10 px-4 text-sm font-bold text-accent-primary transition hover:bg-accent-primary/15 disabled:cursor-not-allowed disabled:border-subtle disabled:bg-bg-card/55 disabled:text-text-muted"
                    >
                      최저가
                    </button>
                    <button
                      type="button"
                      onClick={submitPriceUpdate}
                      disabled={saving || !canSubmitPriceUpdate}
                      className="btn-primary h-11 justify-center px-5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? '변경 중' : '변경 확인'}
                    </button>
                  </div>
                  {formError ? <p className="failure-reason-card mt-3">{formError}</p> : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-text-secondary">상세로 볼 항목을 선택하세요.</div>
        )}
      </article>
      </div>
      {saleOrigin === 'INVENTORY' ? (
        <Link
          href="/jobs/lowest-bid"
          className="group rounded-3xl border border-glow bg-accent-primary/10 p-4 transition hover:bg-accent-primary/15"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-text-primary">최저가 입찰 루프 운영</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                큐에 담긴 보관 입찰을 자동으로 최저가에 맞추고, 예산 소진 시 안전하게 멈춥니다.
              </p>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-glow bg-bg-card px-4 text-sm font-bold text-accent-primary transition group-hover:translate-x-0.5">
              운영 페이지로 이동
            </span>
          </div>
        </Link>
      ) : null}
      <ModalOverlay open={lowestLoopModalOpen} onClose={() => setLowestLoopModalOpen(false)} maxWidthClass="max-w-xl">
        <div className="modal-panel overflow-hidden p-0">
          <div className="border-b border-subtle p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Lowest Bid Queue</p>
            <h3 className="mt-1 text-xl font-bold text-text-primary">최저가 루프 설정</h3>
            <p className="mt-2 text-sm text-text-secondary">
              선택한 {lowestLoopTargets.length.toLocaleString('ko-KR')}개 입찰을 자동 최저가 큐에 추가합니다.
            </p>
          </div>

          <div className="grid gap-4 p-5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLowestLoopStrategy('FOLLOW')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  lowestLoopStrategy === 'FOLLOW'
                    ? 'border-glow bg-accent-primary/12 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]'
                    : 'border-subtle bg-bg-card/65 text-text-secondary hover:border-glow'
                }`}
              >
                <span className="block text-sm font-bold">최저가 맞춤</span>
                <span className="mt-1 block text-xs text-text-muted">현재 기준가에 맞춰 노출을 유지합니다.</span>
              </button>
              <button
                type="button"
                onClick={() => setLowestLoopStrategy('OVERTAKE')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  lowestLoopStrategy === 'OVERTAKE'
                    ? 'border-glow bg-accent-primary/12 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]'
                    : 'border-subtle bg-bg-card/65 text-text-secondary hover:border-glow'
                }`}
              >
                <span className="block text-sm font-bold">한 단계 낮춤</span>
                <span className="mt-1 block text-xs text-text-muted">기준가보다 설정 단계만큼 낮춥니다.</span>
              </button>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-text-primary">가격 단계</span>
              <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
                <button type="button" onClick={() => adjustLowestLoopUndercut(-1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow">
                  -
                </button>
                <span className="macro-option-input flex items-center gap-2">
                  <input
                    value={lowestLoopUndercutInput}
                    onChange={(event) => {
                      setLowestLoopUndercutInput(formatThousandInput(event.target.value));
                      setLowestLoopError(null);
                    }}
                    inputMode="numeric"
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold outline-none"
                  />
                  <span className="text-sm text-text-muted">원</span>
                </span>
                <button type="button" onClick={() => adjustLowestLoopUndercut(1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow">
                  +
                </button>
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-text-primary">예산</span>
              <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
                <button type="button" onClick={() => adjustLowestLoopBudget(-1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow">
                  -
                </button>
                <span className="macro-option-input flex items-center gap-2">
                  <input
                    value={lowestLoopBudgetInput}
                    onChange={(event) => {
                      setLowestLoopBudgetInput(formatThousandInput(event.target.value));
                      setLowestLoopError(null);
                    }}
                    inputMode="numeric"
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold outline-none"
                  />
                  <span className="text-sm text-text-muted">원</span>
                </span>
                <button type="button" onClick={() => adjustLowestLoopBudget(1000)} className="h-11 rounded-2xl border border-subtle bg-bg-card px-4 text-lg font-black text-text-primary transition hover:border-glow">
                  +
                </button>
              </span>
              <span className="text-xs leading-5 text-text-muted">입찰가를 낮춘 누적 금액이 예산을 모두 사용하면 큐를 멈춥니다. 기본값은 5,000원입니다.</span>
            </label>

            {lowestLoopError ? <p className="failure-reason-card">{lowestLoopError}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-subtle p-5">
            <button
              type="button"
              onClick={() => setLowestLoopModalOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-subtle bg-bg-card px-4 text-sm font-bold text-text-secondary transition hover:border-glow hover:text-text-primary"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submitLowestLoopQueue}
              disabled={lowestLoopPending}
              className="btn-primary h-11 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lowestLoopPending ? '추가 중' : '큐에 추가'}
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
    );
}

function BidFilterCard({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  tone: BidFilter;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-2xl border px-3 py-2.5 text-left transition sm:px-4 sm:py-3 ${
        active
          ? 'border-glow bg-accent-primary/12 shadow-[inset_0_0_0_1px_var(--border-glow)]'
          : 'border-subtle bg-bg-card/55 hover:border-glow hover:bg-bg-card-hover'
      }`}
    >
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      <span className={`mt-1 block font-mono text-2xl font-black ${filterValueClass[tone]}`}>
        {count.toLocaleString('ko-KR')}
      </span>
    </button>
  );
}

function InventoryStatusPill({ status, label, compact = false }: { status: string; label: string; compact?: boolean }) {
  const className = inventoryStatusClass[status] ?? 'border-subtle bg-bg-card text-text-secondary';

  return (
    <span className={`shrink-0 rounded-full border font-bold leading-none ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[10px] sm:px-2.5 sm:text-[11px]'} ${className}`}>
      {label}
    </span>
  );
}

function ExposurePill({ state, compact = false }: { state: Exclude<DisplayExposureState, 'unknown'>; compact?: boolean }) {
  const className = exposureClass[state];
  const label = state === 'exposed' ? '노출중' : state === 'planned' ? '노출 예정' : '미노출';

  return (
    <span className={`shrink-0 rounded-full border font-bold leading-none ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[10px] sm:px-2.5 sm:text-[11px]'} ${className}`}>
      {label}
    </span>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-subtle bg-bg-card/55 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-2 truncate font-mono text-lg font-bold ${accent ? 'text-accent-primary' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

function ExposureSummary({
  state,
  hiddenDelta,
  referencePrice,
}: {
  state: DisplayExposureState;
  hiddenDelta: number | null;
  referencePrice: number | null;
}) {
  const message =
    state === 'planned'
      ? '저장하면 노출 상태로 전환됩니다.'
      : state === 'hidden'
      ? `${formatPrice(hiddenDelta)} 낮추면 노출 가능`
      : state === 'exposed'
        ? '현재 기준가와 맞아 노출됩니다.'
        : '기준 가격 동기화가 필요합니다.';

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
      <span className="text-text-muted">노출 판단</span>
      {state === 'unknown' ? <span className="macro-attempt-pill">대기</span> : <ExposurePill state={state} />}
      <span className="font-semibold text-text-primary">{message}</span>
      <span className="text-text-muted">기준가 {formatPrice(referencePrice)}</span>
    </div>
  );
}
