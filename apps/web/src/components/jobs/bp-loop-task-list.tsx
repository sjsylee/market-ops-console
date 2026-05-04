import { bpLoopTaskSchema } from '@market-ops/shared';
import type { z } from 'zod';

import { MacroTaskDeleteButton } from './macro-task-row-actions';
import { TaskImage } from './task-image';
import { TaskQuantityEditor } from './task-quantity-editor';

type BpLoopTask = z.infer<typeof bpLoopTaskSchema>;

type BpLoopTaskGroup = {
  productId: number;
  productName: string | null;
  imgUrl: string | null;
  tasks: BpLoopTask[];
};

const statusLabel: Record<BpLoopTask['status'], string> = {
  PENDING: '1차 대기',
  WAITING_REQ2: '2차 진행',
  SUCCEEDED: '완료',
  FAILED: '실패',
};

function groupTasksByProductId(tasks: BpLoopTask[]): BpLoopTaskGroup[] {
  const groups = new Map<number, BpLoopTaskGroup>();

  for (const task of tasks) {
    const current = groups.get(task.productId);
    if (current) {
      current.tasks.push(task);
      continue;
    }

    groups.set(task.productId, {
      productId: task.productId,
      productName: task.productName,
      imgUrl: task.imgUrl,
      tasks: [task],
    });
  }

  return Array.from(groups.values());
}

export function BpLoopTaskList({
  tasks,
  editableQuantities = false,
  running = false,
}: {
  tasks: BpLoopTask[];
  editableQuantities?: boolean;
  running?: boolean;
}) {
  if (!tasks.length) {
    return <div className="rounded-3xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">아직 등록된 입점 보관 작업이 없습니다.</div>;
  }

  const groupedTasks = groupTasksByProductId(tasks);

  return (
    <div className="grid gap-3">
      {groupedTasks.map((group) => {
        const totalOptionCount = group.tasks.reduce((sum, task) => sum + task.options.length, 0);

        return (
          <article key={`bp-product-${group.productId}`} className="rounded-3xl border border-subtle bg-bg-card/70 p-5">
            <div className="flex min-w-0 gap-4">
              <TaskImage src={group.imgUrl} alt={group.productName || '상품 이미지'} />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">상품 #{group.productId}</p>
                <h3 className="product-title mt-1 text-lg font-semibold text-text-primary">{group.productName || '상품명 없음'}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="macro-attempt-pill macro-attempt-pill-active">등록 작업 {group.tasks.length}건</span>
                  <span className="macro-attempt-pill">선택 옵션 {totalOptionCount}개</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {group.tasks.map((task, index) => (
                <div key={task.id} className="rounded-2xl border border-subtle bg-bg-card/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                        {group.tasks.length > 1 ? `묶음 작업 ${index + 1}` : '등록 옵션'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`macro-attempt-pill macro-attempt-pill-active ${task.status === 'WAITING_REQ2' ? 'macro-attempt-pill-accent' : ''}`}>
                          현재 단계 · {statusLabel[task.status]}
                        </span>
                        <span className="macro-attempt-pill">1차 시도 {task.retries1}회</span>
                        <span className={`macro-attempt-pill ${task.status === 'WAITING_REQ2' ? 'macro-attempt-pill-accent' : ''}`}>2차 시도 {task.retries2}회</span>
                        {task.status === 'SUCCEEDED' || task.status === 'FAILED' ? (
                          <span className="macro-attempt-pill">
                            {task.status === 'SUCCEEDED' ? '성공 시간' : '실패 시간'} · {new Date(task.updatedAt).toLocaleString('ko-KR')}
                          </span>
                        ) : null}
                      </div>
                      {task.status === 'FAILED' && task.lastError ? (
                        <p className="failure-reason-card mt-3">실패 사유 · {task.lastError}</p>
                      ) : null}
                    </div>
                    <span className="text-sm text-text-secondary">옵션 {task.options.length}개</span>
                  </div>

                  {editableQuantities ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <TaskQuantityEditor kind="bp-loop" task={task} running={running} />
                      <div className="flex justify-end">
                        <MacroTaskDeleteButton kind="bp-loop" id={task.id} disabled={running} />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
