'use client';

import type { BpSessionState } from '@market-ops/shared';
import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '../../lib/cn';

type BpSessionStatusProps = {
  state: BpSessionState | null;
  expiresAt: string | null;
};

export function BpSessionStatus({ state, expiresAt }: BpSessionStatusProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!state) {
    return null;
  }

  const remainingMs = expiresAt ? new Date(expiresAt).getTime() - now : 0;
  const expired = state === 'EXPIRED' || remainingMs <= 0;
  const label =
    state === 'UNKNOWN'
      ? '인증 만료 시각 확인 필요'
      : expired
        ? '입점 인증 만료'
        : `입점 인증 ${formatRemaining(remainingMs)} 남음`;
  const detail =
    state === 'UNKNOWN' || expired
      ? '입점 계정은 로그인 후 24시간이 지나면 다시 OTP 인증이 필요합니다.'
      : `만료 예정 ${formatDateTime(expiresAt)}`;

  return (
    <div
      className={cn(
        'mt-4 rounded-2xl border px-4 py-3 text-sm',
        expired || state === 'UNKNOWN'
          ? 'status-badge-failed'
          : state === 'EXPIRING_SOON'
            ? 'status-badge-warning'
            : 'status-badge-success',
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <Clock3 size={15} />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-xs leading-5 opacity-90">{detail}</p>
    </div>
  );
}

function formatRemaining(value: number) {
  const minutes = Math.max(0, Math.ceil(value / 60_000));
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours <= 0) {
    return `${restMinutes}분`;
  }

  return `${hours}시간 ${restMinutes}분`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '확인 필요';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
