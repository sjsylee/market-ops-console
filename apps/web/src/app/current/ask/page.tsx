import { CurrentDetailPage } from "../../../components/current/current-detail-page";
import { requireAuthenticatedPage } from "../../../lib/auth";
import { createPageMetadata } from "../../../lib/page-metadata";

export const metadata = createPageMetadata(
  "Normal Bids",
  "일반 판매 입찰 목록과 최저가 기준 노출 상태를 확인하고 조정합니다.",
);

export default async function AskCurrentPage({
  searchParams,
}: {
  searchParams?: { item?: string };
}) {
  await requireAuthenticatedPage('/current/ask');

  return <CurrentDetailPage saleOrigin="ASK" selectedItemId={searchParams?.item} />;
}
