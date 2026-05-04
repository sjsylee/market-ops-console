import { cn } from '../../lib/cn';

type BadgeTone = 'ask' | 'bid' | 'trade' | 'watch';

const toneClass: Record<BadgeTone, string> = {
  ask: 'bg-sky-400/15 text-sky-200 border-sky-300/30',
  bid: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
  trade: 'bg-amber-400/15 text-amber-100 border-amber-200/40',
  watch: 'bg-fuchsia-400/12 text-fuchsia-100 border-fuchsia-300/25',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: string }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-1 text-xs font-semibold', toneClass[tone])}>
      {children}
    </span>
  );
}
