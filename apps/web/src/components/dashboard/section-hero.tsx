export function SectionHero({
  eyebrow,
  title,
  description,
  hideDescriptionOnMobile = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  hideDescriptionOnMobile?: boolean;
}) {
  return (
    <section className="card-panel p-5 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-accent-primary/85">{eyebrow}</p>
        <h1 className="hero-title mt-2 text-2xl font-extrabold uppercase leading-tight sm:mt-3 sm:text-5xl">{title}</h1>
        <p className={`mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base ${hideDescriptionOnMobile ? 'hidden sm:block' : ''}`}>{description}</p>
      </div>
    </section>
  );
}
