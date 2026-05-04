'use client';

import type { BpLoopState, GeneralLoopState, ImLoopState } from '@market-ops/shared';
import {
  AlertTriangle,
  BadgeDollarSign,
  Clock3,
  Flame,
  Loader2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldAlert,
  TimerReset,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { MacroKind, MacroStartOptions } from '../../lib/jobs-client';
import { startMacro, stopMacro } from '../../lib/jobs-client';
import { openUrlModal } from '../../lib/url-modal';
import { ModalOverlay } from '../ui/modal-overlay';

type MacroOptionField = {
  key: string;
  label: string;
  description: string;
  type?: 'number' | 'boolean';
  min?: number;
  step?: number;
  suffix?: string;
  icon: LucideIcon;
};

type MacroOptionSection = {
  title?: string;
  description?: string;
  fields: MacroOptionField[];
};

function normalizeOptionValue(value: unknown, min: number) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= min) {
    return Math.round(value);
  }

  return min;
}

function normalizeBooleanOptionValue(value: unknown) {
  return typeof value === 'boolean' ? value : Boolean(value);
}

const optionFieldConfig: Record<MacroKind, MacroOptionSection[]> = {
  'general-loop': [
    {
      title: '기본 설정',
      description: '루프 전체 흐름과 일반 재시도 간격을 조정합니다.',
      fields: [
        { key: 'delayPerTask', label: '작업 간격', description: '각 상품 처리 사이 대기 시간', min: 500, step: 500, suffix: 'ms', icon: Clock3 },
        { key: 'delayAfterCycle', label: '사이클 간격', description: '한 바퀴 종료 후 다음 순회까지 대기', min: 500, step: 500, suffix: 'ms', icon: RefreshCw },
        { key: 'delayAfterExceed', label: '초과 응답 대기', description: '수량 초과 응답 후 재시도 전 대기', min: 500, step: 500, suffix: 'ms', icon: AlertTriangle },
      ],
    },
    {
      title: '2차 설정',
      description: '2차 요청 전환 시의 간격과 최대 시도 횟수를 조정합니다.',
      fields: [
        { key: 'delayAfterSecondReq', label: '2차 요청 간격', description: '2차 요청 전환 시 추가 대기', min: 500, step: 500, suffix: 'ms', icon: TimerReset },
        { key: 'maxSecondAttempts', label: '2차 최대 시도', description: '2차 요청 재시도 횟수 상한', min: 1, step: 1, suffix: '회', icon: RotateCcw },
      ],
    },
  ],
  'bp-loop': [
    {
      fields: [
        { key: 'delayPerTask', label: '작업 간격', description: '각 상품 처리 사이 대기 시간', min: 500, step: 500, suffix: 'ms', icon: Clock3 },
        { key: 'delayAfterCycle', label: '사이클 간격', description: '한 바퀴 종료 후 다음 순회까지 대기', min: 500, step: 500, suffix: 'ms', icon: RefreshCw },
        { key: 'delayAfterExceed', label: '초과 응답 대기', description: '초과 응답 후 재시도 전 대기', min: 500, step: 500, suffix: 'ms', icon: AlertTriangle },
        { key: 'delayAfterIpBlock', label: 'IP 제한 대기', description: '차단성 응답 후 재개까지 대기', min: 500, step: 500, suffix: 'ms', icon: ShieldAlert },
        { key: 'delayAfterSecondReq', label: '2차 요청 간격', description: '2차 요청 전환 시 추가 대기', min: 500, step: 500, suffix: 'ms', icon: TimerReset },
        { key: 'maxSecondAttempts', label: '2차 최대 시도', description: '2차 요청 재시도 횟수 상한', min: 1, step: 1, suffix: '회', icon: RotateCcw },
      ],
    },
  ],
  'im-loop': [
    {
      fields: [
        { key: 'delayPerTask', label: '작업 간격', description: '각 상품 처리 사이 대기 시간', min: 500, step: 500, suffix: 'ms', icon: Clock3 },
        { key: 'delayAfterCycle', label: '사이클 간격', description: '한 바퀴 종료 후 다음 순회까지 대기', min: 500, step: 500, suffix: 'ms', icon: RefreshCw },
        { key: 'priceTolerance', label: '허용 가격 오차', description: '목표가 비교 시 허용 범위', min: 0, step: 500, suffix: '원', icon: BadgeDollarSign },
      ],
    },
    {
      title: '버닝 설정',
      description: '성공한 상품과 같은 카테고리 후보를 짧은 간격으로 추가 시도합니다.',
      fields: [
        { key: 'burningEnabled', type: 'boolean', label: '버닝 실행', description: '성공 시 같은 대분류 후보를 즉시 이어서 시도합니다.', icon: Flame },
        { key: 'burningRepeatCount', label: '버닝 반복', description: '후보 묶음을 반복 시도하는 횟수', min: 1, step: 1, suffix: '회', icon: RotateCcw },
        { key: 'burningDelayMinMs', label: '버닝 최소 간격', description: '버닝 후보 사이 최소 대기', min: 0, step: 100, suffix: 'ms', icon: Clock3 },
        { key: 'burningDelayMaxMs', label: '버닝 최대 간격', description: '버닝 후보 사이 최대 대기', min: 0, step: 100, suffix: 'ms', icon: RefreshCw },
      ],
    },
  ],
};

export function MacroControlBar({
  kind,
  accountId,
  running,
  canStart,
  addHref,
  options,
}: {
  kind: MacroKind;
  accountId?: string;
  running: boolean;
  canStart: boolean;
  addHref: string;
  options: GeneralLoopState['options'] | BpLoopState['options'] | ImLoopState['options'];
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<'start' | 'stop' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const startButtonBusy = running || pendingAction === 'start';
  const addDisabled = running || !accountId;
  const [draftOptions, setDraftOptions] = useState<Record<string, number | boolean>>(() => ({ ...options }));
  const optionSections = optionFieldConfig[kind];

  useEffect(() => {
    setDraftOptions({ ...options });
  }, [options]);

  function buildStartOptions() {
    const merged = { ...options } as Record<string, unknown>;

    for (const section of optionSections) {
      for (const field of section.fields) {
        if (field.type === 'boolean') {
          merged[field.key] = normalizeBooleanOptionValue(draftOptions[field.key]);
          continue;
        }

        merged[field.key] = normalizeOptionValue(draftOptions[field.key], field.min ?? 0);
      }
    }

    return merged as MacroStartOptions;
  }

  async function handleStart() {
    if (!accountId) return;
    setPendingAction('start');
    try {
      const response = await startMacro(kind, { accountId, options: buildStartOptions() });
      if (
        response &&
        typeof response === 'object' &&
        'state' in response &&
        response.state &&
        typeof response.state === 'object' &&
        'options' in response.state &&
        response.state.options &&
        typeof response.state.options === 'object'
      ) {
        setDraftOptions(response.state.options as Record<string, number | boolean>);
      }
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  async function handleStop() {
    setPendingAction('stop');
    try {
      await stopMacro(kind);
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
      <div className="grid w-full gap-3">
        <button
          type="button"
          onClick={() => {
            if (!addDisabled) {
              openUrlModal(addHref);
            }
          }}
          disabled={addDisabled}
          aria-disabled={addDisabled}
          className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>상품 추가</span>
        </button>
      </div>
      <div className="relative w-full pt-5">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--border-subtle),transparent)]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <button
            type="button"
            onClick={handleStart}
            disabled={!accountId || !canStart || running || pendingAction !== null}
            className={`btn-primary gap-2 disabled:cursor-not-allowed disabled:opacity-70 ${running ? 'shadow-aura' : ''}`}
          >
            {startButtonBusy ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
            <span>{startButtonBusy ? '실행 중' : '시작'}</span>
          </button>
          <button type="button" onClick={handleStop} disabled={!running || pendingAction !== null} className="inline-flex items-center justify-center gap-2 rounded-xl border border-subtle bg-bg-card px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-70">
            {pendingAction === 'stop' ? <Loader2 size={16} className="animate-spin" /> : <PauseCircle size={16} />}
            <span>중지</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            disabled={pendingAction !== null}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-subtle bg-bg-card px-4 py-3 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-70 md:col-span-1"
          >
            <Settings2 size={16} />
            <span className="hidden sm:inline">실행 옵션</span>
          </button>
        </div>
      </div>
      </div>

      <ModalOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidthClass="max-w-3xl">
        <div className="modal-panel flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden p-4 sm:max-h-[calc(100vh-4rem)] sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-subtle pb-4 sm:pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Run Settings</p>
              <h3 className="mt-2 text-2xl font-bold text-text-primary">실행 옵션 설정</h3>
              <p className="mt-2 text-sm text-text-secondary">
                시작 버튼을 누를 때 적용할 루프 옵션입니다.
                {running ? ' 실행 중에는 값을 수정할 수 없습니다.' : ' 작업 특성에 맞게 조정한 뒤 시작하세요.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-[color:var(--modal-elevated)] text-text-secondary transition hover:border-glow hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-5">
            {optionSections.map((section, sectionIndex) => (
              <section key={`${kind}-section-${sectionIndex}`} className="grid gap-3">
                {section.title ? (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{section.title}</h4>
                    {section.description ? <p className="mt-1 text-xs text-text-muted">{section.description}</p> : null}
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {section.fields.map((field) => {
                    const FieldIcon = field.icon;

                    return (
                    <label key={field.key} className="macro-option-field">
                      <div className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-bg-card/70 text-accent-primary">
                          <FieldIcon size={16} />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="text-sm font-semibold text-text-primary">{field.label}</span>
                        <span className="text-xs text-text-muted">{field.description}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        {field.type === 'boolean' ? (
                          <button
                            type="button"
                            disabled={running || pendingAction !== null}
                            onClick={() => {
                              setDraftOptions((current) => ({
                                ...current,
                                [field.key]: !normalizeBooleanOptionValue(current[field.key]),
                              }));
                            }}
                            className={`h-11 rounded-2xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${normalizeBooleanOptionValue(draftOptions[field.key]) ? 'im-method-button-instant-active' : 'im-method-button-idle'}`}
                          >
                            {normalizeBooleanOptionValue(draftOptions[field.key]) ? '사용' : '미사용'}
                          </button>
                        ) : (
                          <>
                            <input
                              type="number"
                              min={field.min}
                              step={field.step}
                              disabled={running || pendingAction !== null}
                              value={Number(draftOptions[field.key] ?? 0)}
                              onChange={(event) => {
                                const next = Number(event.target.value);
                                const min = field.min ?? 0;
                                setDraftOptions((current) => ({
                                  ...current,
                                  [field.key]: Number.isFinite(next) && next >= min ? next : min,
                                }));
                              }}
                              className="macro-option-input"
                            />
                            <span className="text-xs font-medium text-text-muted">{field.suffix}</span>
                          </>
                        )}
                      </div>
                    </label>
                    );
                  })}
                </div>
              </section>
            ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end border-t border-subtle pt-4 sm:mt-5 sm:pt-5">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-subtle bg-bg-card px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-glow hover:text-text-primary"
            >
              닫기
            </button>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}
