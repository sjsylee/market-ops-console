export type FreshnessTone = 'fresh' | 'warm' | 'stale' | 'empty';

export function getFreshness(value?: string | null): {
  absolute: string;
  relative: string;
  tone: FreshnessTone;
} {
  if (!value) {
    return {
      absolute: '-',
      relative: '동기화 전',
      tone: 'empty',
    };
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));

  return {
    absolute: date.toLocaleString('ko-KR'),
    relative: formatRelative(minutes),
    tone: minutes <= 30 ? 'fresh' : minutes <= 180 ? 'warm' : 'stale',
  };
}

function formatRelative(minutes: number) {
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return `${Math.floor(hours / 24)}일 전`;
}
