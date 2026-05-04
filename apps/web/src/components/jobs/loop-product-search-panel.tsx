import { searchCatalog } from '../../lib/catalog';
import { ProductCard } from '../product/product-card';
import { CatalogSearchForm } from '../catalog/catalog-search-form';

export async function LoopProductSearchPanel({
  accountId,
  keyword,
}: {
  accountId?: string;
  keyword: string;
}) {
  const results = accountId && keyword ? await searchCatalog(accountId, keyword) : [];

  return (
    <section className="card-panel p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Task Builder</p>
      <h2 className="mt-2 text-2xl font-bold">작업에 넣을 상품 찾기</h2>
      <p className="mt-2 text-sm text-text-secondary">상품 검색은 별도 기능이 아니라, 루프 작업을 추가하기 위한 준비 단계로 사용합니다.</p>
      <div className="mt-5">
        <CatalogSearchForm disabled={!accountId} basePath="/jobs" />
      </div>
      {!accountId ? <p className="mt-4 text-sm text-text-secondary">먼저 계정을 선택해야 검색할 수 있습니다.</p> : null}
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {results.length > 0
          ? results.slice(0, 6).map((item) => (
              <ProductCard
                key={item.productId}
                title={item.name}
                sku={item.modelName || `PRODUCT #${item.productId}`}
                image={item.imgUrl || '/product-aura-01.svg'}
                ask={null}
                bid={null}
              />
            ))
          : [
              <div key="empty" className="rounded-3xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary sm:col-span-2">
                {keyword ? '검색 결과가 없습니다. 다른 키워드로 다시 시도해보세요.' : '검색어를 입력하면 작업 추가용 상품 후보가 표시됩니다.'}
              </div>,
            ]}
      </div>
    </section>
  );
}
