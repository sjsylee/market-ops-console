'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navItems } from './nav-items';

export function SidebarNav({ jobsRunning }: { jobsRunning: boolean }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="hidden w-64 shrink-0 xl:block">
      <div className="sticky top-24 card-panel p-4">
        <p className="mb-4 text-xs uppercase tracking-[0.14em] text-text-muted">Control Surface</p>
        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  'flex items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition',
                  active
                    ? 'border-glow bg-accent-primary/12 text-text-primary shadow-aura'
                    : 'border-transparent bg-transparent text-text-secondary hover:border-subtle hover:bg-bg-card/70 hover:text-text-primary',
                ].join(' ')}
              >
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon size={16} />
                  {item.href === '/jobs' && jobsRunning ? <span aria-hidden className="nav-alert-dot" /> : null}
                </span>
                <span>
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-xs text-text-muted">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
