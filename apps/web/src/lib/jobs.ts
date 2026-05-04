import {
  bpLoopStateResponseSchema,
  bpLoopTaskListResponseSchema,
  generalLoopStateResponseSchema,
  generalLoopTaskListResponseSchema,
  imLoopStateResponseSchema,
  imLoopTaskListResponseSchema,
  jobLogListResponseSchema,
  type BpLoopState,
  type GeneralLoopState,
  type ImLoopState,
} from '@market-ops/shared';

import { getLoopAccountSelection } from './accounts-server';
import { apiGetServer } from './api-server';
import { getLowestLoopState } from './lowest-loop';

export type MacroKind = 'general-loop' | 'bp-loop' | 'im-loop';

export async function getGeneralLoopState(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return generalLoopStateResponseSchema.parse(await apiGetServer(`/jobs/general-loop/state${suffix}`));
}

export async function getGeneralLoopTasks(accountId: string) {
  const suffix = `?accountId=${encodeURIComponent(accountId)}`;
  return generalLoopTaskListResponseSchema.parse(await apiGetServer(`/jobs/general-loop/tasks${suffix}`)).items;
}

export async function getBpLoopState(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return bpLoopStateResponseSchema.parse(await apiGetServer(`/jobs/bp-loop/state${suffix}`));
}

export async function getBpLoopTasks(accountId: string) {
  const suffix = `?accountId=${encodeURIComponent(accountId)}`;
  return bpLoopTaskListResponseSchema.parse(await apiGetServer(`/jobs/bp-loop/tasks${suffix}`)).items;
}

export async function getImLoopState(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return imLoopStateResponseSchema.parse(await apiGetServer(`/jobs/im-loop/state${suffix}`));
}

export async function getImLoopTasks(accountId: string) {
  const suffix = `?accountId=${encodeURIComponent(accountId)}`;
  return imLoopTaskListResponseSchema.parse(await apiGetServer(`/jobs/im-loop/tasks${suffix}`)).items;
}

export async function getMacroLogs(kind: MacroKind, accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return jobLogListResponseSchema.parse(await apiGetServer(`/jobs/${kind}/logs${suffix}`)).items;
}

export function getMacroSummary(state: GeneralLoopState | BpLoopState | ImLoopState) {
  return {
    running: state.running,
    pendingCount: state.pendingCount,
    successCount: state.successCount,
    failedCount: state.failedCount,
    currentTaskId: state.currentTaskId,
    lastError: state.lastError,
  };
}

export async function getMacroRunningFlag(accountId?: string) {
  const [general, bp, im] = await Promise.all([
    getGeneralLoopState(accountId),
    getBpLoopState(accountId),
    getImLoopState(accountId),
  ]);

  return general.state.running || bp.state.running || im.state.running;
}

export async function getAssignedMacroRunningFlag() {
  const [generalSelection, bpSelection, imSelection, currentSelection] = await Promise.all([
    getLoopAccountSelection('general-loop'),
    getLoopAccountSelection('bp-loop'),
    getLoopAccountSelection('im-loop'),
    getLoopAccountSelection('current-sync'),
  ]);

  const [general, bp, im, lowestLoop] = await Promise.all([
    getGeneralLoopState(generalSelection.account?.id),
    getBpLoopState(bpSelection.account?.id),
    getImLoopState(imSelection.account?.id),
    getLowestLoopState(currentSelection.account?.id),
  ]);

  return general.state.running || bp.state.running || im.state.running || lowestLoop.state.running;
}
