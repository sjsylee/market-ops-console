'use client';

import { openUrlModal } from '../../lib/url-modal';

export type MacroStatusCardItem = {
  label: string;
  count: number;
  href: string;
  tone: 'pending' | 'success' | 'failed';
};

const toneClass = {
  pending: 'status-value-pending',
  success: 'status-value-success',
  failed: 'status-value-failed',
};

export function MacroStatusCards({ cards }: { cards: MacroStatusCardItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => {
        const clickable = card.count > 0;
        const content = (
          <div
            className={[
              'macro-queue-stat-card rounded-2xl border p-4 transition',
              `macro-queue-stat-card-${card.tone}`,
              clickable ? 'cursor-pointer hover:border-glow hover:bg-bg-card-hover' : 'opacity-80',
            ].join(' ')}
          >
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold leading-none tabular-nums ${toneClass[card.tone]}`}>{card.count}</p>
            <p className="mt-3 text-[11px] text-text-secondary">{clickable ? '목록 보기' : '없음'}</p>
          </div>
        );

        return clickable ? (
          <button key={card.label} type="button" onClick={() => openUrlModal(card.href)} className="block h-full w-full text-left">
            {content}
          </button>
        ) : (
          <div key={card.label}>{content}</div>
        );
      })}
    </div>
  );
}
