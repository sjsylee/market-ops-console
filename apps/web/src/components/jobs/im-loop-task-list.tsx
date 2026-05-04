import { imLoopTaskSchema } from '@market-ops/shared';
import type { z } from 'zod';

import { ImLoopTaskEditor } from './im-loop-task-editor';
import { MacroTaskDeleteButton } from './macro-task-row-actions';
import { TaskImage } from './task-image';

type ImLoopTask = z.infer<typeof imLoopTaskSchema>;

const statusLabel: Record<ImLoopTask['status'], string> = {
  PENDING: '대기 중',
  SUCCEEDED: '완료',
  FAILED: '실패',
};

const methodLabel: Record<ImLoopTask['method'], string> = {
  p: '즉시구매',
  b: '구매 입찰',
};

export function ImLoopTaskList({
  tasks,
  running = false,
  readonly = false,
}: {
  tasks: ImLoopTask[];
  running?: boolean;
  readonly?: boolean;
}) {
  if (!tasks.length) {
    return <div className="rounded-3xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">아직 등록된 구매 입찰 작업이 없습니다.</div>;
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <article key={task.id} className="min-w-0 overflow-hidden rounded-3xl border border-subtle bg-bg-card/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
              <TaskImage src={task.imgUrl} alt={task.productName || '상품 이미지'} />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">상품 #{task.productId}</p>
                <h3 className="product-title mt-1 break-keep text-lg font-semibold leading-snug text-text-primary">{task.productName || '상품명 없음'}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="macro-attempt-pill macro-attempt-pill-active">현재 상태 · {statusLabel[task.status]}</span>
                  <span className="macro-attempt-pill">목표가 {task.price.toLocaleString('ko-KR')}원</span>
                  <span className={`macro-attempt-pill ${task.method === 'p' ? 'im-method-pill-instant' : 'im-method-pill-bid'}`}>
                    {methodLabel[task.method]}
                  </span>
                  {readonly && task.status !== 'PENDING' ? (
                    <span className="macro-attempt-pill">
                      {task.status === 'SUCCEEDED' ? '성공 시간' : '실패 시간'} · {new Date(task.updatedAt).toLocaleString('ko-KR')}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-text-secondary">옵션 {task.option}</p>
                {task.status === 'FAILED' && task.lastError ? (
                  <p className="failure-reason-card mt-3">
                    실패 사유 · {task.lastError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          {!readonly ? (
            <>
              <ImLoopTaskEditor
                taskId={task.id}
                price={task.price}
                method={task.method}
                disabled={running || task.status !== 'PENDING'}
              />
              <div className="mt-4 flex justify-end">
                <MacroTaskDeleteButton kind="im-loop" id={task.id} disabled={running} />
              </div>
            </>
          ) : null}
        </article>
      ))}
    </div>
  );
}
