type PriceTagProps = {
  label: string;
  value: number;
  delta?: number;
};

export function PriceTag({ label, value, delta }: PriceTagProps) {
  const format = new Intl.NumberFormat('ko-KR');

  return (
    <div className="rounded-2xl border border-subtle bg-bg-card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-accent-primary tabular-nums">
        {format.format(value)}원
      </p>
      {typeof delta === 'number' ? (
        <p className="mt-1 text-xs text-text-secondary">전일 대비 {delta > 0 ? '+' : ''}{format.format(delta)}원</p>
      ) : null}
    </div>
  );
}
