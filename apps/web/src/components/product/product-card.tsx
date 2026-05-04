import Image from 'next/image';

import { Badge } from '../ui/badge';

type ProductCardProps = {
  title: string;
  sku: string;
  image: string;
  ask: number | null;
  bid: number | null;
};

export function ProductCard({ title, sku, image, ask, bid }: ProductCardProps) {
  const format = new Intl.NumberFormat('ko-KR');

  return (
    <article className="card-panel group">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl border border-subtle bg-black/30">
        <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{sku}</p>
      <h3 className="product-title mt-1 text-lg font-semibold text-text-primary">{title}</h3>
      {ask !== null || bid !== null ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <Badge tone="ask">즉구가</Badge>
            <p className="mt-2 font-mono text-sm text-text-primary">{ask !== null ? `${format.format(ask)}원` : '-'}</p>
          </div>
          <div>
            <Badge tone="bid">즉판가</Badge>
            <p className="mt-2 font-mono text-sm text-text-primary">{bid !== null ? `${format.format(bid)}원` : '-'}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">시세 정보는 선택한 계정과 검색 결과에 맞춰 이어집니다.</p>
      )}
    </article>
  );
}
