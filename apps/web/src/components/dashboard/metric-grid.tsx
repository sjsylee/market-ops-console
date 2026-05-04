export type MetricItem = {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
};

export function MetricGrid({ items, columns = 3 }: { items: readonly MetricItem[]; columns?: 2 | 3 | 4 }) {
  const colClass =
    columns === 4 ? 'xl:grid-cols-4' : columns === 2 ? 'sm:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`grid gap-3 ${colClass}`}>
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-subtle bg-bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{item.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${item.accent || 'text-text-primary'}`}>{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-text-secondary">{item.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}
