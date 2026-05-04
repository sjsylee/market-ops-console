import type { BpLoopState, GeneralLoopState, ImLoopState } from '@market-ops/shared';

import { apiDeleteClient, apiPatchClient, apiPostClient } from './api-client';

export type MacroKind = 'general-loop' | 'bp-loop' | 'im-loop';
export type MacroStartOptions = GeneralLoopState['options'] | BpLoopState['options'] | ImLoopState['options'];

export async function startMacro(kind: MacroKind, payload: { accountId: string; options?: MacroStartOptions }) {
  return apiPostClient(`/api/jobs/${kind}/start`, payload);
}

export async function stopMacro(kind: MacroKind) {
  return apiPostClient(`/api/jobs/${kind}/stop`, {});
}

export async function createMacroTask(kind: MacroKind, payload: Record<string, unknown>) {
  return apiPostClient(`/api/jobs/${kind}/tasks`, payload);
}

export async function clearMacroTasks(kind: MacroKind, accountId: string) {
  return apiDeleteClient(`/api/jobs/${kind}/tasks`, { accountId });
}

export async function removeMacroTask(kind: MacroKind, id: string) {
  return apiDeleteClient(`/api/jobs/${kind}/tasks/${id}`, {});
}

type GeneralOrBpTaskUpdatePayload = {
  options: Array<{ optionKey?: string | number; option: string; productId: number; quantity: number }>;
};

type ImTaskUpdatePayload = {
  price: number;
  method: 'p' | 'b';
};

export async function updateMacroTask(kind: Extract<MacroKind, 'general-loop' | 'bp-loop'>, id: string, payload: GeneralOrBpTaskUpdatePayload): Promise<unknown>;
export async function updateMacroTask(kind: Extract<MacroKind, 'im-loop'>, id: string, payload: ImTaskUpdatePayload): Promise<unknown>;
export async function updateMacroTask(kind: MacroKind, id: string, payload: GeneralOrBpTaskUpdatePayload | ImTaskUpdatePayload) {
  return apiPatchClient(`/api/jobs/${kind}/tasks/${id}`, payload);
}
