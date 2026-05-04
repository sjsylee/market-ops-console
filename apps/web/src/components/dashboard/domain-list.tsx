export type DomainItem = {
  title: string;
  description: string;
  value: string;
  status: string;
};

export function DomainList({ title, eyebrow, items }: { title: string; eyebrow: string; items: DomainItem[] }) {
  return (
    <section className="card-panel p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-3xl border border-subtle bg-bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
              </div>
              <span className="rounded-full border border-glow bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary">
                {item.status}
              </span>
            </div>
            <p className="mt-4 font-mono text-sm text-accent-secondary">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
