'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '../../lib/cn';
import { useThemeStore } from '../../store/theme-store';

export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const theme = useThemeStore((state) => state.theme);
  const preference = useThemeStore((state) => state.preference);
  const hydrated = useThemeStore((state) => state.hydrated);
  const toggle = useThemeStore((state) => state.toggle);
  const hydrate = useThemeStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        compact
          ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-bg-card text-text-primary transition hover:border-glow hover:shadow-aura'
          : 'inline-flex h-10 items-center gap-2 rounded-full border border-subtle bg-bg-card px-4 text-sm font-medium text-text-primary transition hover:border-glow hover:shadow-aura',
        className,
      )}
      aria-label="테마 전환"
      title={hydrated ? `테마: ${preference === 'system' ? '시스템' : preference === 'light' ? '라이트' : '다크'}` : '테마 전환'}
    >
      {hydrated && theme === 'light' ? <SunMedium size={16} /> : <MoonStar size={16} />}
      {compact ? null : <span>{hydrated ? (preference === 'system' ? '시스템' : preference === 'light' ? '라이트' : '다크') : '다크'}</span>}
    </button>
  );
}
