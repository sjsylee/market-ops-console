'use client';

import type { JobLogItem, LowestLoopQueueItem } from '@market-ops/shared';

import { useUrlModal } from '../../lib/url-modal';
import { LowestLoopQueueList } from './lowest-loop-queue-list';
import { MacroLogList } from './macro-log-list';
import { MacroModalShell } from './macro-modal-shell';

export function LowestLoopPageModals({
  basePath,
  accountId,
  initialModal,
  items,
  running,
  initialLogs = [],
}: {
  basePath: string;
  accountId?: string;
  initialModal?: string;
  items: LowestLoopQueueItem[];
  running: boolean;
  initialLogs?: JobLogItem[];
}) {
  const modal = useUrlModal(initialModal);

  if (modal === 'queue') {
    return (
      <MacroModalShell
        eyebrow="Automation Queue"
        title="자동 최저가 큐"
        description="입찰 관리 페이지에서 등록한 상품을 확인하고, 필요하면 큐를 일시 중지하거나 제거합니다."
        closeHref={basePath}
      >
        <LowestLoopQueueList items={items} running={running} />
      </MacroModalShell>
    );
  }

  if (modal === 'logs') {
    return (
      <MacroModalShell title="최근 로그" closeHref={basePath}>
        <MacroLogList initialLogs={initialLogs} kind="lowest-loop" accountId={accountId} />
      </MacroModalShell>
    );
  }

  return null;
}
