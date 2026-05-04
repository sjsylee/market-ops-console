'use client';

import { Loader2, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function CatalogSearchForm({ disabled, basePath = '/jobs' }: { disabled?: boolean; basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      next.set('keyword', keyword.trim());
    } else {
      next.delete('keyword');
    }

    startTransition(() => {
      router.replace(`${basePath}?${next.toString()}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-subtle bg-bg-card/80 px-4 focus-within:border-glow">
        <Search size={16} className="text-text-muted" />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-70"
          placeholder="상품명 또는 스타일 코드 검색"
        />
      </label>
      <button type="submit" disabled={disabled || isPending} className="btn-primary min-w-[7rem] gap-2 disabled:cursor-not-allowed disabled:opacity-70">
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        <span>{isPending ? '검색 중' : '검색'}</span>
      </button>
    </form>
  );
}
