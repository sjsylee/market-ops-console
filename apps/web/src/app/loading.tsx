export default function Loading() {
  return (
    <div className="grid gap-6" aria-hidden>
      <section className="card-panel p-6">
        <div className="skeleton-line h-3 w-28" />
        <div className="skeleton-line mt-4 h-10 w-full max-w-xl" />
        <div className="skeleton-line mt-4 h-4 w-full max-w-2xl" />
        <div className="skeleton-line mt-2 h-4 w-3/5 max-w-lg" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card-panel min-h-[12rem] p-5">
            <div className="skeleton-line h-3 w-24" />
            <div className="skeleton-line mt-4 h-7 w-3/5" />
            <div className="skeleton-line mt-5 h-4 w-full" />
            <div className="skeleton-line mt-2 h-4 w-4/5" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="skeleton-line h-12" />
              <div className="skeleton-line h-12" />
              <div className="skeleton-line h-12" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
