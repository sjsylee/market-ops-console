'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { removeMacroTask, type MacroKind } from '../../lib/jobs-client';

export function MacroTaskDeleteButton({
  kind,
  id,
  disabled = false,
}: {
  kind: MacroKind;
  id: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (disabled) return;
    setPending(true);
    try {
      await removeMacroTask(kind, id);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled || pending} className="inline-flex items-center gap-2 rounded-full border border-subtle bg-bg-card px-4 py-2 text-sm text-text-secondary transition hover:border-rose-300/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      <span>{disabled ? '실행 중에는 삭제 불가' : '삭제'}</span>
    </button>
  );
}
