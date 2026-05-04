import Link from 'next/link';
import { UserRound } from 'lucide-react';

import { CommandSearch } from './command-search';
import { NotificationCenter } from './notification-center';
import { ThemeToggle } from '../ui/theme-toggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-subtle bg-bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center transition hover:scale-[1.02]">
            <img
              src="/app-icon-symbol.svg"
              alt="Market Ops mark"
              width={40}
              height={40}
              decoding="async"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="font-display text-lg tracking-tight text-text-primary">Market Ops</p>
            <p className="text-xs text-text-muted">Resell Operations Console</p>
          </div>
        </Link>

        <div className="hidden flex-1 px-4 md:block">
          <CommandSearch />
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Link
            href="/accounts"
            aria-label="계정 페이지로 이동"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-bg-card text-text-secondary transition hover:border-glow hover:text-text-primary"
          >
            <UserRound size={16} />
          </Link>
          <ThemeToggle compact className="sm:hidden" />
          <ThemeToggle className="hidden sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}
