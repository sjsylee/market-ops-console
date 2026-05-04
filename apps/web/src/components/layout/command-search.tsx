'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Archive,
  BadgeDollarSign,
  Bell,
  Bot,
  Boxes,
  Gauge,
  Home,
  Search,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type CommandItem = {
  href: string;
  title: string;
  description: string;
  group: string;
  keywords: string[];
  icon: LucideIcon;
};

const commandItems: CommandItem[] = [
  {
    href: '/home',
    title: 'Dashboard',
    description: '전체 매크로와 입찰 상태를 한 화면에서 확인합니다.',
    group: '이동',
    keywords: ['home', 'dashboard', '홈', '대시보드', '상태', '운영'],
    icon: Home,
  },
  {
    href: '/jobs',
    title: '매크로 허브',
    description: '모든 매크로 카드와 실행 상태를 확인합니다.',
    group: '매크로',
    keywords: ['jobs', 'macro', '매크로', '루프', '실행', '실패', '대기'],
    icon: Boxes,
  },
  {
    href: '/jobs/general',
    title: '일반 보관 매크로',
    description: '일반 보관 작업 큐와 실행 로그로 이동합니다.',
    group: '매크로',
    keywords: ['일반', '보관', 'general', 'storage', 'macro', '큐', '로그'],
    icon: Bot,
  },
  {
    href: '/jobs/vendor',
    title: '입점 보관 매크로',
    description: '입점 계정의 보관 작업과 인증 상태를 확인합니다.',
    group: '매크로',
    keywords: ['입점', 'bp', 'vendor', '보관', '계정', '인증'],
    icon: Bot,
  },
  {
    href: '/jobs/purchase-bid',
    title: '구매 입찰 매크로',
    description: '구매 입찰 작업 큐와 실패 사유를 확인합니다.',
    group: '매크로',
    keywords: ['구매', '입찰', 'im', 'purchase', 'bid', '실패', '상품'],
    icon: BadgeDollarSign,
  },
  {
    href: '/jobs/lowest-bid',
    title: '최저가 입찰 루프',
    description: '자동 최저가 입찰 큐와 실행 로그로 이동합니다.',
    group: '매크로',
    keywords: ['최저가', 'lowest', 'loop', '가격', '예산', '사이클'],
    icon: Gauge,
  },
  {
    href: '/current',
    title: '입찰 관리',
    description: '보관 입찰과 일반 입찰 현황을 확인합니다.',
    group: '입찰',
    keywords: ['current', '입찰', '관리', '보관', '일반', '동기화'],
    icon: Activity,
  },
  {
    href: '/current/inventory',
    title: '보관 입찰',
    description: '보관 판매 입찰 목록과 노출 상태를 확인합니다.',
    group: '입찰',
    keywords: ['보관', 'inventory', '리리셀', '노출', '미노출', '가격'],
    icon: Archive,
  },
  {
    href: '/current/ask',
    title: '일반 입찰',
    description: '일반 판매 입찰 목록과 최저가 상태를 확인합니다.',
    group: '입찰',
    keywords: ['일반', 'ask', '리셀', '노출', '미노출', '가격'],
    icon: BadgeDollarSign,
  },
  {
    href: '/accounts',
    title: '계정 관리',
    description: '일반/입점 운영 계정과 세션 상태를 관리합니다.',
    group: '설정',
    keywords: ['account', 'accounts', '계정', '로그인', '입점', '세션', 'bp'],
    icon: UserRound,
  },
  {
    href: '/jobs/general?modal=logs',
    title: '최근 실행 로그',
    description: '실패나 경고가 있을 때 각 매크로 로그로 빠르게 이동합니다.',
    group: '점검',
    keywords: ['로그', 'log', 'warning', 'error', '실패', '경고', '확인'],
    icon: Bell,
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreItem(item: CommandItem, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 1;

  const haystack = [item.title, item.description, item.group, ...item.keywords].join(' ').toLowerCase();
  if (item.title.toLowerCase().startsWith(normalizedQuery)) return 4;
  if (item.keywords.some((keyword) => keyword.toLowerCase().startsWith(normalizedQuery))) return 3;
  if (haystack.includes(normalizedQuery)) return 2;
  return 0;
}

export function CommandSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    return commandItems
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(({ item }) => item);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
        return;
      }

      if (!isTypingTarget && event.key === '/') {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function goTo(item: CommandItem) {
    setOpen(false);
    setQuery('');
    router.push(item.href);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex] ?? results[0];
      if (selected) goTo(selected);
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-3">
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-subtle bg-bg-card px-4 transition focus-within:border-glow">
        <Search size={16} className="text-text-muted" />
        <input
          ref={inputRef}
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          placeholder="명령어, 페이지, 상태 검색"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <span className="hidden rounded-full border border-subtle px-2 py-0.5 text-[10px] font-semibold text-text-muted lg:inline-flex">
          ⌘K
        </span>
      </label>

      <div
        className={cn(
          'command-search-panel absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-3xl border border-subtle bg-[color:var(--modal-surface)] p-2 shadow-panel backdrop-blur-xl transition',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        <div className="max-h-[min(70vh,420px)] overflow-y-auto pr-1">
          {results.length ? (
            results.map((item, index) => {
              const Icon = item.icon;
              const active = index === activeIndex;

              return (
                <button
                  key={`${item.href}-${item.title}`}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition',
                    active ? 'bg-accent-primary/12 text-text-primary shadow-[inset_0_0_0_1px_var(--border-glow)]' : 'text-text-secondary hover:bg-bg-card/70 hover:text-text-primary',
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goTo(item)}
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-bg-card text-accent-primary">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold">{item.title}</span>
                      <span className="shrink-0 rounded-full border border-subtle bg-bg-card px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                        {item.group}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-text-muted">{item.description}</span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-semibold text-text-primary">검색 결과가 없습니다</p>
              <p className="mt-1 text-xs text-text-muted">매크로, 입찰, 계정, 실패 같은 키워드로 찾아보세요.</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-subtle px-3 pt-2 text-[11px] text-text-muted">
          <span>Enter 이동</span>
          <span>↑ ↓ 선택 · Esc 닫기</span>
        </div>
      </div>
    </div>
  );
}
