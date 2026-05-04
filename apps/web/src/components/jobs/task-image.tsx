export function TaskImage({ src, alt }: { src?: string | null; alt: string }) {
  const safeSrc = src && src.trim() ? src : '/product-aura-01.svg';

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
