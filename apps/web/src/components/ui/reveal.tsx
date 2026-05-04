'use client';

import type { ReactNode } from 'react';

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="reveal-enter overflow-visible"
      style={{ animationDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
