'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { navItems } from './nav-items';

export function BottomNav({ jobsRunning }: { jobsRunning: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[1.75rem] border border-subtle bg-bg-card/90 p-2 backdrop-blur-xl xl:hidden">
      <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              onTouchStart={() => router.prefetch(item.href)}
              className={[
                'flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] transition',
                active
                  ? 'bg-accent-primary/15 text-accent-primary shadow-aura'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary',
              ].join(' ')}
            >
              <span className="relative inline-flex">
                <Icon size={16} />
                {item.href === '/jobs' && jobsRunning ? <span aria-hidden className="nav-alert-dot nav-alert-dot-mobile" /> : null}
              </span>
              <span className="mt-1">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
