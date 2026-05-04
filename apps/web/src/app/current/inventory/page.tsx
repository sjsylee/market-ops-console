import { CurrentDetailPage } from "../../../components/current/current-detail-page";
import { requireAuthenticatedPage } from "../../../lib/auth";
import { createPageMetadata } from "../../../lib/page-metadata";

export const metadata = createPageMetadata(
  "Inventory Bids",
  "보관 판매 입찰 목록과 가격 노출 상태를 확인하고 조정합니다.",
);

export default async function InventoryCurrentPage({
  searchParams,
}: {
  searchParams?: { item?: string };
}) {
  await requireAuthenticatedPage('/current/inventory');

  return <CurrentDetailPage saleOrigin="INVENTORY" selectedItemId={searchParams?.item} />;
}
