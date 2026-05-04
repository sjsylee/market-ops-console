import { redirect } from 'next/navigation';

import { createPageMetadata } from '../../lib/page-metadata';

export const metadata = createPageMetadata(
  'Catalog',
  '작업에 추가할 마켓 상품 탐색 화면으로 이동합니다.',
);

export default function CatalogPage() {
  redirect('/jobs');
}
