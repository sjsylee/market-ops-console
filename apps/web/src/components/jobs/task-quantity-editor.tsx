'use client';

import type { generalLoopTaskSchema, bpLoopTaskSchema } from '@market-ops/shared';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { z } from 'zod';

import { updateMacroTask } from '../../lib/jobs-client';

type GeneralTask = z.infer<typeof generalLoopTaskSchema>;
type BpTask = z.infer<typeof bpLoopTaskSchema>;

export function TaskQuantityEditor({
  kind,
  task,
  running = false,
}: {
  kind: 'general-loop' | 'bp-loop';
  task: GeneralTask | BpTask;
  running?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [options, setOptions] = useState(task.options.map((item) => ({ ...item })));
  const editable = (task.status === 'PENDING' || task.status === 'FAILED' || task.status === 'WAITING_REQ2') && !running;

  async function handleSave() {
    setPending(true);
    try {
      await updateMacroTask(kind, task.id, { options });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      {options.map((option, index) => (
        <div key={`${task.id}-${option.optionKey ?? option.option}`} className="flex items-center justify-between gap-3 rounded-2xl border border-subtle bg-bg-card/80 px-3 py-2">
          <span className="min-w-0 truncate text-xs text-text-secondary">{option.option}</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              disabled={!editable || pending}
              value={option.quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                setOptions((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, quantity: Number.isFinite(next) && next > 0 ? next : 1 } : item,
                  ),
                );
              }}
              className="h-9 w-20 rounded-xl border border-subtle bg-bg-card px-3 text-sm text-text-primary outline-none"
            />
            <button
              type="button"
              disabled={!editable || pending || options.length <= 1}
              onClick={() => {
                setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index));
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-subtle bg-bg-card text-text-secondary transition hover:border-rose-300/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`${option.option} 옵션 제거`}
              title={options.length <= 1 ? '마지막 옵션은 작업 전체 삭제를 사용하세요.' : '옵션 제거'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      {options.length <= 1 ? (
        <p className="text-xs text-text-muted">마지막 옵션은 아래 작업 삭제 버튼으로 전체 제거할 수 있습니다.</p>
      ) : null}
      {task.status === 'PENDING' || task.status === 'FAILED' || task.status === 'WAITING_REQ2' ? (
        <button type="button" onClick={handleSave} disabled={!editable || pending} className="inline-flex items-center justify-center gap-2 rounded-full border border-subtle bg-bg-card px-4 py-2 text-sm text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-70">
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{running ? '실행 중에는 수정 불가' : '변경 저장'}</span>
        </button>
      ) : null}
    </div>
  );
}
