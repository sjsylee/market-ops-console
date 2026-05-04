'use client';

import {
  catalogRecentTaskPresetItemSchema,
  catalogSearchItemSchema,
  type catalogProductOptionSchema,
} from '@market-ops/shared';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Search,
  Star,
  StarOff,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';

import {
  addCatalogFavoriteClient,
  getBpCatalogOptionsClient,
  getCatalogFavoritesClient,
  getCatalogOptionsClient,
  getRecentTaskPresetsClient,
  removeCatalogFavoriteClient,
  searchBpCatalogClient,
  searchCatalogClient,
} from '../../lib/catalog-client';
import { createMacroTask } from '../../lib/jobs-client';
import { GroupedTaskAddPanel } from './grouped-task-add-panel';
import { ImTaskAddForm } from './im-task-add-form';

type SearchItem = z.infer<typeof catalogSearchItemSchema>;
type ProductOption = z.infer<typeof catalogProductOptionSchema>;
type RecentTaskPreset = z.infer<typeof catalogRecentTaskPresetItemSchema>;
type BuilderTab = 'search' | 'favorites' | 'recent';
type RecentPresetOption = RecentTaskPreset['options'][number];

const fadeListTransition = {
  duration: 0.18,
  ease: 'easeOut' as const,
};

const tabLabels: Record<BuilderTab, string> = {
  search: '검색',
  favorites: '즐겨찾기',
  recent: '최근 추가',
};

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 전`;
}

function summarizePresetOptions(options: RecentTaskPreset['options']) {
  if (!options.length) {
    return '옵션 정보 없음';
  }

  const first = options[0];
  if (!first) {
    return '옵션 정보 없음';
  }

  if (options.length === 1) {
    if ('price' in first) {
      return `${first.option} · ${first.price.toLocaleString('ko-KR')}원 · ${first.method === 'b' ? '구매 입찰' : '즉시구매'}`;
    }

    return `${first.option} · ${first.quantity}개`;
  }

  return `${first.option} 외 ${options.length - 1}개 · 총 ${options.length}옵션`;
}

function filterProducts(items: SearchItem[], keyword: string) {
  if (!keyword) {
    return items;
  }

  return items.filter((item) => item.name.toLowerCase().includes(keyword));
}

function filterRecentPresets(items: RecentTaskPreset[], keyword: string) {
  if (!keyword) {
    return items;
  }

  return items.filter((item) => (item.productName || '').toLowerCase().includes(keyword));
}

function isImRecentOption(option: RecentPresetOption): option is Extract<RecentPresetOption, { price: number }> {
  return 'price' in option;
}

function getOptionCacheKey(mode: 'general-loop' | 'bp-loop' | 'im-loop', accountId: string, productId: number) {
  return `${mode}:${accountId}:${productId}`;
}

function preserveModalScroll(target: EventTarget | null, update: () => void) {
  const scrollElement =
    target instanceof HTMLElement
      ? target.closest<HTMLElement>('[data-macro-modal-scroll]')
      : null;
  const scrollTop = scrollElement?.scrollTop ?? null;

  update();

  if (scrollTop === null) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!scrollElement) {
        return;
      }

      scrollElement.scrollTop = scrollTop;
    });
  });
}

export function MacroTaskBuilderModal({
  accountId,
  mode,
}: {
  accountId?: string;
  mode: 'general-loop' | 'bp-loop' | 'im-loop';
}) {
  const router = useRouter();
  const supportsRecent = true;
  const [activeTab, setActiveTab] = useState<BuilderTab>('search');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [libraryKeyword, setLibraryKeyword] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [favorites, setFavorites] = useState<SearchItem[]>([]);
  const [recentPresets, setRecentPresets] = useState<RecentTaskPreset[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SearchItem | null>(null);
  const [selectedRecentPreset, setSelectedRecentPreset] = useState<RecentTaskPreset | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchVersion, setSearchVersion] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchPending, setSearchPending] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(supportsRecent);
  const [favoritePending, setFavoritePending] = useState(false);
  const [recentPendingId, setRecentPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const optionCacheRef = useRef(new Map<string, ProductOption[]>());

  const normalizedLibraryKeyword = libraryKeyword.trim().toLowerCase();
  const favoriteProductIds = useMemo(() => new Set(favorites.map((item) => item.productId)), [favorites]);
  const filteredFavorites = useMemo(
    () => filterProducts(favorites, normalizedLibraryKeyword),
    [favorites, normalizedLibraryKeyword],
  );
  const filteredRecentPresets = useMemo(
    () => filterRecentPresets(recentPresets, normalizedLibraryKeyword),
    [recentPresets, normalizedLibraryKeyword],
  );

  const totalSearchPages = Math.max(1, Math.ceil(results.length / pageSize));
  const totalFavoritePages = Math.max(1, Math.ceil(filteredFavorites.length / pageSize));
  const totalRecentPages = Math.max(1, Math.ceil(filteredRecentPresets.length / pageSize));
  const pagedResults = results.slice((searchPage - 1) * pageSize, searchPage * pageSize);
  const pagedFavorites = filteredFavorites.slice((favoritesPage - 1) * pageSize, favoritesPage * pageSize);
  const pagedRecentPresets = filteredRecentPresets.slice((recentPage - 1) * pageSize, recentPage * pageSize);

  async function loadFavorites() {
    setIsLoadingFavorites(true);
    try {
      const items = await getCatalogFavoritesClient();
      setFavorites(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '즐겨찾기를 불러오지 못했습니다.');
    } finally {
      setIsLoadingFavorites(false);
    }
  }

  async function loadRecentPresets() {
    if (!supportsRecent) {
      setRecentPresets([]);
      return;
    }

    setIsLoadingRecent(true);
    try {
      const items = await getRecentTaskPresetsClient(mode);
      setRecentPresets(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '최근 추가 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingRecent(false);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 767px)');
    const apply = () => setPageSize(media.matches ? 3 : 5);

    apply();
    media.addEventListener('change', apply);

    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    void loadFavorites();
    void loadRecentPresets();
  }, [mode]);

  useEffect(() => {
    if (!supportsRecent && activeTab === 'recent') {
      setActiveTab('search');
    }
  }, [activeTab, supportsRecent]);

  useEffect(() => {
    if (activeTab === 'search') {
      setLibraryKeyword('');
    }
  }, [activeTab]);

  useEffect(() => {
    setSearchPage(1);
  }, [results]);

  useEffect(() => {
    setFavoritesPage(1);
  }, [filteredFavorites.length]);

  useEffect(() => {
    setRecentPage(1);
  }, [filteredRecentPresets.length]);

  useEffect(() => {
    if (activeTab !== 'favorites') {
      return;
    }

    if (!filteredFavorites.length) {
      setSelectedProduct(null);
      return;
    }

    if (!selectedProduct || !filteredFavorites.some((item) => item.productId === selectedProduct.productId)) {
      setSelectedProduct(filteredFavorites[0] ?? null);
    }
  }, [activeTab, filteredFavorites, selectedProduct]);

  useEffect(() => {
    if (activeTab !== 'recent') {
      return;
    }

    if (!filteredRecentPresets.length) {
      setSelectedRecentPreset(null);
      return;
    }

    if (!selectedRecentPreset || !filteredRecentPresets.some((item) => item.id === selectedRecentPreset.id)) {
      setSelectedRecentPreset(filteredRecentPresets[0] ?? null);
    }
  }, [activeTab, filteredRecentPresets, selectedRecentPreset]);

  useEffect(() => {
    if (!accountId || !selectedProduct || activeTab === 'recent') {
      setOptions([]);
      setIsLoadingOptions(false);
      return;
    }

    const cacheKey = getOptionCacheKey(mode, accountId, selectedProduct.productId);
    const cachedOptions = optionCacheRef.current.get(cacheKey);
    if (cachedOptions) {
      setOptions(cachedOptions);
      setIsLoadingOptions(false);
      return;
    }

    let active = true;
    setIsLoadingOptions(true);
    setError(null);

    const loadOptions = mode === 'bp-loop' ? getBpCatalogOptionsClient : getCatalogOptionsClient;

    loadOptions(accountId, selectedProduct.productId)
      .then((payload) => {
        if (!active) return;
        optionCacheRef.current.set(cacheKey, payload.options);
        setOptions(payload.options);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '옵션을 불러오지 못했습니다.');
        setOptions([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [accountId, activeTab, mode, selectedProduct]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeTab !== 'search') {
      return;
    }

    if (!accountId || !searchKeyword.trim() || searchPending) return;

    const searchProducts = mode === 'bp-loop' ? searchBpCatalogClient : searchCatalogClient;
    setSearchPending(true);
    setHasSearched(true);
    setError(null);
    setResults([]);
    setSelectedProduct(null);
    setSelectedRecentPreset(null);
    setOptions([]);

    try {
      const items = await searchProducts(accountId, searchKeyword.trim());
      setResults(items);
      setSelectedProduct(items[0] || null);
      setSearchVersion((current) => current + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
      setSearchVersion((current) => current + 1);
    } finally {
      setSearchPending(false);
    }
  }

  async function handleFavoriteToggle() {
    if (!selectedProduct || favoritePending) {
      return;
    }

    setFavoritePending(true);
    try {
      if (favoriteProductIds.has(selectedProduct.productId)) {
        await removeCatalogFavoriteClient(selectedProduct.productId);
        setFavorites((current) => current.filter((item) => item.productId !== selectedProduct.productId));
      } else {
        const saved = await addCatalogFavoriteClient({
          productId: selectedProduct.productId,
          name: selectedProduct.name,
          modelName: selectedProduct.modelName,
          imgUrl: selectedProduct.imgUrl,
          category: selectedProduct.category,
        });
        setFavorites((current) => [saved, ...current.filter((item) => item.productId !== saved.productId)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '즐겨찾기 변경에 실패했습니다.');
    } finally {
      setFavoritePending(false);
    }
  }

  async function handleReAddRecentPreset() {
    if (!accountId || !selectedRecentPreset) {
      return;
    }

    setRecentPendingId(selectedRecentPreset.id);
    try {
      if (mode === 'im-loop') {
        for (const item of selectedRecentPreset.options) {
          if (!isImRecentOption(item)) {
            continue;
          }

          await createMacroTask('im-loop', {
            accountId,
            productId: selectedRecentPreset.productId,
            productName: selectedRecentPreset.productName || undefined,
            imgUrl: selectedRecentPreset.imgUrl || undefined,
            category: selectedRecentPreset.category,
            option: item.option,
            price: item.price,
            method: item.method,
          });
        }
      } else {
        await createMacroTask(mode, {
          accountId,
          productId: selectedRecentPreset.productId,
          productName: selectedRecentPreset.productName || undefined,
          imgUrl: selectedRecentPreset.imgUrl || undefined,
          category: selectedRecentPreset.category,
          options: selectedRecentPreset.options.filter((item) => !isImRecentOption(item)),
        });
      }
      await loadRecentPresets();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '최근 추가 작업을 다시 등록하지 못했습니다.');
    } finally {
      setRecentPendingId(null);
    }
  }

  const visibleTabs: BuilderTab[] = supportsRecent ? ['search', 'favorites', 'recent'] : ['search', 'favorites'];
  const currentProductIsFavorite = selectedProduct ? favoriteProductIds.has(selectedProduct.productId) : false;
  const leftPaneTitle =
    activeTab === 'search' ? '검색 결과' : activeTab === 'favorites' ? '즐겨찾기 상품' : '최근 추가 프리셋';
  const leftPaneCount =
    activeTab === 'search' ? results.length : activeTab === 'favorites' ? filteredFavorites.length : filteredRecentPresets.length;

  function renderPagination(currentPage: number, totalPages: number, onPageChange: React.Dispatch<React.SetStateAction<number>>) {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="relative mt-4 pt-4">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--border-subtle),transparent)]" />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onPageChange((current) => Math.max(1, current - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-2 rounded-full border border-subtle bg-bg-card px-3 py-2 text-sm text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ChevronLeft size={14} />
            <span>이전</span>
          </button>
          <span className="text-xs text-text-muted">{currentPage} / {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-2 rounded-full border border-subtle bg-bg-card px-3 py-2 text-sm text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>다음</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  function renderProductList(items: SearchItem[], emptyText: string, loading = false) {
    if (loading) {
      return (
        <motion.div
          key="loading-products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeListTransition}
          className="flex items-center gap-2 rounded-2xl border border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
        >
          <Loader2 size={16} className="shrink-0 animate-spin text-accent-primary" />
          <span>{emptyText}</span>
        </motion.div>
      );
    }

    if (!items.length) {
      return (
        <motion.div
          key="empty-products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeListTransition}
          className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
        >
          {emptyText}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={`${activeTab}-products-${searchVersion}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fadeListTransition}
        className="space-y-3"
      >
        {items.map((item) => (
          <button
            key={`${activeTab}-${item.productId}`}
            type="button"
            onClick={(event) => {
              preserveModalScroll(event.currentTarget, () => {
                setSelectedProduct(item);
                setSelectedRecentPreset(null);
              });
            }}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedProduct?.productId === item.productId ? 'border-glow bg-accent-primary/10 shadow-[inset_0_0_0_1px_var(--border-glow)]' : 'border-subtle bg-bg-card/60 hover:border-glow hover:bg-bg-card-hover'}`}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
              <img
                src={item.imgUrl || '/product-aura-01.svg'}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.src = '/product-aura-01.svg';
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="product-title truncate text-sm font-semibold text-text-primary">{item.name}</p>
              <p className="mt-1 truncate text-xs text-text-muted">PRODUCT #{item.productId}</p>
            </div>
          </button>
        ))}
      </motion.div>
    );
  }

  function renderRecentList(items: RecentTaskPreset[]) {
    if (isLoadingRecent) {
      return (
        <motion.div
          key="loading-recent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeListTransition}
          className="rounded-2xl border border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
        >
          최근 추가 작업을 불러오는 중입니다.
        </motion.div>
      );
    }

    if (!items.length) {
      return (
        <motion.div
          key="empty-recent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeListTransition}
          className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
        >
          {normalizedLibraryKeyword ? '조건에 맞는 최근 추가 프리셋이 없습니다.' : '최근에 등록한 작업 프리셋이 없습니다.'}
        </motion.div>
      );
    }

    return (
      <motion.div
        key="recent-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fadeListTransition}
        className="space-y-3"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedRecentPreset(item);
              setSelectedProduct(null);
            }}
            className={`w-full rounded-2xl border p-3 text-left transition ${selectedRecentPreset?.id === item.id ? 'border-glow bg-accent-primary/10 shadow-[inset_0_0_0_1px_var(--border-glow)]' : 'border-subtle bg-bg-card/60 hover:border-glow hover:bg-bg-card-hover'}`}
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
                <img
                  src={item.imgUrl || '/product-aura-01.svg'}
                  alt={item.productName || '최근 추가 상품'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.src = '/product-aura-01.svg';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="product-title truncate text-sm font-semibold text-text-primary">{item.productName || `상품 #${item.productId}`}</p>
                <p className="mt-1 truncate text-xs text-text-muted">{summarizePresetOptions(item.options)}</p>
                <p className="mt-1 text-[11px] text-text-muted">마지막 추가 · {formatRelativeDate(item.lastAddedAt)}</p>
              </div>
            </div>
          </button>
        ))}
      </motion.div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-3">
        <label className="modal-input flex-1">
          <Search size={16} className="text-text-muted" />
          <input
            value={activeTab === 'search' ? searchKeyword : libraryKeyword}
            onChange={(event) => {
              if (activeTab === 'search') {
                setSearchKeyword(event.target.value);
                return;
              }

              setLibraryKeyword(event.target.value);
            }}
            disabled={activeTab === 'search' ? !accountId || searchPending : false}
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-70"
            placeholder={
              activeTab === 'search'
                ? '상품명 또는 스타일 코드 검색'
                : activeTab === 'favorites'
                  ? '즐겨찾기 상품명 검색'
                  : '최근 추가 상품명 검색'
            }
          />
        </label>
        {activeTab === 'search' ? (
          <button type="submit" disabled={!accountId || searchPending || !searchKeyword.trim()} className="btn-primary min-w-[7rem] gap-2 disabled:cursor-not-allowed disabled:opacity-70">
            {searchPending ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{searchPending ? '검색 중' : '검색'}</span>
          </button>
        ) : null}
      </form>

      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'border-glow bg-accent-primary/12 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]' : 'border-subtle bg-bg-card text-text-secondary hover:border-glow hover:text-text-primary'}`}
          >
            {tab === 'search' ? <Search size={15} /> : tab === 'favorites' ? <Star size={15} /> : <History size={15} />}
            <span>{tabLabels[tab]}</span>
          </button>
        ))}
      </div>

      {!accountId && activeTab === 'search' ? <p className="mt-4 text-sm text-text-secondary">먼저 계정을 선택해야 상품을 검색할 수 있습니다.</p> : null}
      {error ? <p className="feedback-error mt-4">{error}</p> : null}

      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.62fr_1.38fr] xl:gap-5">
        <div className="min-w-0 rounded-3xl border border-subtle bg-bg-card/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">{leftPaneTitle}</p>
            <span className="text-xs text-text-muted">{searchPending && activeTab === 'search' ? '검색 중' : `${leftPaneCount}개`}</span>
          </div>
          <div className="max-h-[44vh] space-y-3 overflow-y-auto pr-1 sm:max-h-[48vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'search'
                ? searchPending
                  ? renderProductList([], '상품을 검색하는 중입니다.', true)
                  : pagedResults.length > 0
                  ? renderProductList(pagedResults, '검색 결과가 없습니다.')
                  : hasSearched
                    ? renderProductList([], '검색 결과가 없습니다. 다른 키워드로 다시 시도해보세요.')
                    : renderProductList([], '검색어를 입력하고 검색하면 작업에 추가할 상품이 여기에 표시됩니다.')
                : activeTab === 'favorites'
                  ? renderProductList(
                      pagedFavorites,
                      normalizedLibraryKeyword ? '조건에 맞는 즐겨찾기 상품이 없습니다.' : '즐겨찾기한 상품이 없습니다.',
                      isLoadingFavorites,
                    )
                  : renderRecentList(pagedRecentPresets)}
            </AnimatePresence>
          </div>

          {activeTab === 'search'
            ? renderPagination(searchPage, totalSearchPages, setSearchPage)
            : activeTab === 'favorites'
              ? renderPagination(favoritesPage, totalFavoritePages, setFavoritesPage)
              : renderPagination(recentPage, totalRecentPages, setRecentPage)}
        </div>

        <div className="min-w-0 rounded-3xl border border-subtle bg-bg-card/40 p-5">
          {activeTab === 'recent' ? (
            <>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Recent Preset</p>
              <h3 className="product-title mt-2 text-xl font-semibold text-text-primary">
                {selectedRecentPreset?.productName || '최근 추가 작업을 선택하세요'}
              </h3>
              <div className="mt-5">
                {selectedRecentPreset ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-subtle bg-bg-card/65 p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="macro-attempt-pill macro-attempt-pill-active">옵션 {selectedRecentPreset.options.length}개</span>
                        <span className="macro-attempt-pill">등록 {selectedRecentPreset.addCount}회</span>
                        <span className="macro-attempt-pill">최근 {formatRelativeDate(selectedRecentPreset.lastAddedAt)}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {selectedRecentPreset.options.map((item, index) => (
                          <div key={`${selectedRecentPreset.id}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-subtle bg-bg-card/80 px-3 py-2">
                            <span className="text-sm text-text-primary">{item.option}</span>
                            <span className="text-xs text-text-secondary">
                              {isImRecentOption(item)
                                ? `${item.price.toLocaleString('ko-KR')}원 · ${item.method === 'b' ? '구매 입찰' : '즉시구매'}`
                                : `${item.quantity}개`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleReAddRecentPreset}
                      disabled={!accountId || recentPendingId === selectedRecentPreset.id}
                      className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      {recentPendingId === selectedRecentPreset.id ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
                      <span>{accountId ? '이 조합 다시 추가' : '계정 선택 후 다시 추가 가능'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">
                    최근 추가 탭에서 다시 쓰고 싶은 작업 조합을 바로 불러올 수 있습니다.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{activeTab === 'favorites' ? 'Favorite Product' : 'Options'}</p>
                  <h3 className="product-title mt-2 text-xl font-semibold text-text-primary">{selectedProduct?.name || '상품을 먼저 선택하세요'}</h3>
                  {selectedProduct ? (
                    <p className="mt-1 text-xs text-text-muted">PRODUCT #{selectedProduct.productId}</p>
                  ) : null}
                </div>
                {selectedProduct ? (
                  <button
                    type="button"
                    onClick={handleFavoriteToggle}
                    disabled={favoritePending}
                    aria-label={currentProductIsFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${currentProductIsFavorite ? 'favorite-toggle-active' : 'border-subtle bg-bg-card text-text-secondary hover:border-glow hover:text-text-primary'}`}
                  >
                    {favoritePending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : currentProductIsFavorite ? (
                      <StarOff size={14} />
                    ) : (
                      <Star size={14} />
                    )}
                    <span className="hidden sm:inline">{currentProductIsFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-5 max-h-[44vh] space-y-3 overflow-y-auto pr-1 sm:max-h-[48vh]">
                <AnimatePresence mode="wait">
                  {!accountId && selectedProduct ? (
                    <motion.div
                      key="missing-account"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={fadeListTransition}
                      className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
                    >
                      옵션과 추가 기능을 사용하려면 먼저 계정을 선택해야 합니다.
                    </motion.div>
                  ) : isLoadingOptions ? (
                    <motion.div
                      key="loading-options"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={fadeListTransition}
                      className="rounded-2xl border border-subtle bg-bg-card/50 p-6 text-sm text-text-secondary"
                    >
                      옵션을 불러오는 중입니다.
                    </motion.div>
                  ) : options.length > 0 && selectedProduct && accountId ? (
                    <motion.div
                      key={`options-${selectedProduct.productId}-${activeTab}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={fadeListTransition}
                      className="space-y-3"
                    >
                      {mode === 'im-loop' ? null : (
                        <GroupedTaskAddPanel
                          kind={mode}
                          accountId={accountId}
                          productId={selectedProduct.productId}
                          productName={selectedProduct.name}
                          imgUrl={selectedProduct.imgUrl || undefined}
                          category={selectedProduct.category}
                          options={options}
                          onCreated={supportsRecent ? loadRecentPresets : undefined}
                        />
                      )}
                      {options.map((option) => {
                        if (mode === 'im-loop') {
                          return (
                            <ImTaskAddForm
                              key={option.key}
                              accountId={accountId}
                              productId={selectedProduct.productId}
                              productName={selectedProduct.name}
                              imgUrl={selectedProduct.imgUrl}
                              category={selectedProduct.category}
                              option={option.key}
                            />
                          );
                        }

                        return (
                          <div key={option.key} className="rounded-2xl border border-subtle bg-bg-card/65 p-4">
                            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-text-primary">{option.name || option.key}</p>
                                {option.stockStatus ? <p className="mt-1 text-xs text-text-muted">{option.stockStatus}</p> : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle-options"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={fadeListTransition}
                      className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary"
                    >
                      상품을 고르면 옵션별로 작업을 추가할 수 있습니다.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
