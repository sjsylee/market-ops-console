'use client';

import {
  bpLoopTaskSchema,
  generalLoopTaskSchema,
  imLoopTaskSchema,
  type JobLogItem,
} from '@market-ops/shared';
import type { z } from 'zod';

import type { MacroKind } from '../../lib/jobs-client';
import { useUrlModal } from '../../lib/url-modal';
import { BpLoopTaskList } from './bp-loop-task-list';
import { GeneralLoopTaskList } from './general-loop-task-list';
import { ImLoopTaskList } from './im-loop-task-list';
import { MacroLogList } from './macro-log-list';
import { MacroModalShell } from './macro-modal-shell';
import { MacroTaskBuilderModal } from './macro-task-builder-modal';

type GeneralLoopTask = z.infer<typeof generalLoopTaskSchema>;
type BpLoopTask = z.infer<typeof bpLoopTaskSchema>;
type ImLoopTask = z.infer<typeof imLoopTaskSchema>;
type MacroModalType = 'add' | 'pending' | 'success' | 'failed' | 'logs';

type SharedProps = {
  basePath: string;
  accountId?: string;
  initialModal?: string;
  running: boolean;
  initialLogs?: JobLogItem[];
};

type GeneralProps = SharedProps & {
  kind: 'general-loop';
  pendingTasks: GeneralLoopTask[];
  successTasks: GeneralLoopTask[];
  failedTasks: GeneralLoopTask[];
};

type BpProps = SharedProps & {
  kind: 'bp-loop';
  pendingTasks: BpLoopTask[];
  successTasks: BpLoopTask[];
  failedTasks: BpLoopTask[];
};

type ImProps = SharedProps & {
  kind: 'im-loop';
  pendingTasks: ImLoopTask[];
  successTasks: ImLoopTask[];
  failedTasks: ImLoopTask[];
};

type MacroPageModalsProps = GeneralProps | BpProps | ImProps;

const addCopy: Record<MacroKind, { title: string; description: string }> = {
  'general-loop': {
    title: '상품 추가',
    description: '검색한 상품을 옵션별로 바로 일반 보관 작업 큐에 추가합니다.',
  },
  'bp-loop': {
    title: '상품 추가',
    description: '검색한 상품을 옵션별로 바로 입점 보관 작업 큐에 추가합니다.',
  },
  'im-loop': {
    title: '상품 추가',
    description: '검색한 상품을 옵션별로 바로 구매 입찰 작업 큐에 추가합니다.',
  },
};

export function MacroPageModals(props: MacroPageModalsProps) {
  const modal = useUrlModal(props.initialModal) as MacroModalType | null;

  if (modal === 'add') {
    const copy = addCopy[props.kind];

    return (
      <MacroModalShell eyebrow="Add Products" title={copy.title} description={copy.description} closeHref={props.basePath}>
        <MacroTaskBuilderModal accountId={props.accountId} mode={props.kind} />
      </MacroModalShell>
    );
  }

  if (modal === 'pending') {
    return (
      <MacroModalShell title="대기 작업" closeHref={props.basePath}>
        <TaskListByKind props={props} tasks={props.pendingTasks} modal={modal} />
      </MacroModalShell>
    );
  }

  if (modal === 'success') {
    return (
      <MacroModalShell title="성공 작업" closeHref={props.basePath}>
        <TaskListByKind props={props} tasks={props.successTasks} modal={modal} />
      </MacroModalShell>
    );
  }

  if (modal === 'failed') {
    return (
      <MacroModalShell title="실패 작업" closeHref={props.basePath}>
        <TaskListByKind props={props} tasks={props.failedTasks} modal={modal} />
      </MacroModalShell>
    );
  }

  if (modal === 'logs') {
    return (
      <MacroModalShell title="최근 로그" closeHref={props.basePath}>
        <MacroLogList initialLogs={props.initialLogs ?? []} kind={props.kind} accountId={props.accountId} />
      </MacroModalShell>
    );
  }

  return null;
}

function TaskListByKind({
  props,
  tasks,
  modal,
}: {
  props: MacroPageModalsProps;
  tasks: GeneralLoopTask[] | BpLoopTask[] | ImLoopTask[];
  modal: 'pending' | 'success' | 'failed';
}) {
  if (props.kind === 'general-loop') {
    return (
      <GeneralLoopTaskList
        tasks={tasks as GeneralLoopTask[]}
        editableQuantities={modal === 'pending'}
        running={props.running}
      />
    );
  }

  if (props.kind === 'bp-loop') {
    return (
      <BpLoopTaskList
        tasks={tasks as BpLoopTask[]}
        editableQuantities={modal === 'pending'}
        running={props.running}
      />
    );
  }

  return (
    <ImLoopTaskList
      tasks={tasks as ImLoopTask[]}
      running={props.running}
      readonly={modal !== 'pending'}
    />
  );
}
