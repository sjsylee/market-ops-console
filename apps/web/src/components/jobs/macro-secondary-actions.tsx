'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { clearMacroTasks, type MacroKind } from '../../lib/jobs-client';
import { openUrlModal } from '../../lib/url-modal';

export function MacroSecondaryActions({
  kind,
  accountId,
  clearEnabled,
  running,
  logsHref,
}: {
  kind: MacroKind;
  accountId?: string;
  clearEnabled: boolean;
  running: boolean;
  logsHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!confirmRef.current?.contains(event.target as Node)) {
        setConfirmOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setConfirmOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [confirmOpen]);

  async function handleClear() {
    if (!accountId || !clearEnabled) return;
    setPending(true);
    try {
      await clearMacroTasks(kind, accountId);
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div ref={confirmRef} className="relative">
        {confirmOpen ? (
          <div className="popconfirm-panel absolute inset-x-0 bottom-[calc(100%+0.75rem)] z-20 rounded-2xl border p-4">
            <p className="text-sm font-semibold text-text-primary">대기 중인 작업을 모두 비울까요?</p>
            <p className="mt-1 text-xs text-text-secondary">삭제된 대기 작업은 다시 복구되지 않습니다.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={pending}
                className="popconfirm-danger-button inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{pending ? '비우는 중' : '비우기'}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-subtle bg-bg-card px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                취소
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!accountId || !clearEnabled || running || pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-subtle bg-bg-card px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-rose-300/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          <span>대기 작업 비우기</span>
        </button>
      </div>
      <button type="button" onClick={() => openUrlModal(logsHref)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-subtle bg-bg-card px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary">
        <span>로그 보기</span>
      </button>
    </div>
  );
}
