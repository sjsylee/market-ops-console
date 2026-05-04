'use client';

import { X } from 'lucide-react';

import { closeUrlModal } from '../../lib/url-modal';
import { ModalOverlay } from '../ui/modal-overlay';

export function MacroModalShell({
  eyebrow = 'Product Builder',
  title,
  description,
  closeHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  closeHref: string;
  children: React.ReactNode;
}) {
  return (
    <ModalOverlay open maxWidthClass="max-w-5xl">
      <div className="rounded-3xl border border-subtle bg-[color:var(--modal-surface)] shadow-[0_30px_80px_rgba(2,6,23,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-subtle px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary">{title}</h2>
            {description ? <p className="mt-2 hidden text-sm text-text-secondary sm:block">{description}</p> : null}
          </div>
          <button type="button" onClick={() => closeUrlModal(closeHref)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary transition hover:border-glow hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <div
          data-macro-modal-scroll
          className="max-h-[78vh] overflow-x-hidden overflow-y-auto px-4 py-4 [overflow-anchor:none] sm:px-6 sm:py-6"
        >
          {children}
        </div>
      </div>
    </ModalOverlay>
  );
}
