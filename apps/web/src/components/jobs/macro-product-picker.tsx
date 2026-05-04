import { getCatalogOptions, searchCatalog } from '../../lib/catalog';
import Link from 'next/link';
import { CatalogSearchForm } from '../catalog/catalog-search-form';
import { ImTaskAddForm } from './im-task-add-form';
import { OptionTaskAddControls } from './option-task-add-controls';

type MacroProductPickerProps = {
  accountId?: string;
  basePath: string;
  keyword: string;
  productId?: number;
  mode: 'general-loop' | 'bp-loop' | 'im-loop';
};

export async function MacroProductPicker({ accountId, basePath, keyword, productId, mode }: MacroProductPickerProps) {
  const results = accountId && keyword ? await searchCatalog(accountId, keyword) : [];
  const selectedProductId = productId ?? results[0]?.productId;
  const selected = accountId && selectedProductId
    ? await getCatalogOptions(accountId, selectedProductId).catch(() => null)
    : null;
  const buildHref = (nextProductId?: number) => {
    const query = new URLSearchParams();
    query.set('modal', 'add');
    if (keyword) query.set('keyword', keyword);
    if (nextProductId) query.set('productId', String(nextProductId));
    return `${basePath}?${query.toString()}`;
  };

  return (
    <section className="card-panel p-6">
      <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Task Builder</p>
      <h2 className="mt-2 text-2xl font-bold">상품 검색과 작업 추가</h2>
      <p className="mt-2 text-sm text-text-secondary">검색한 상품을 선택한 뒤 옵션별로 바로 큐에 추가합니다.</p>
      <div className="mt-5">
        <CatalogSearchForm disabled={!accountId} basePath={basePath} />
      </div>
      {!accountId ? <p className="mt-4 text-sm text-text-secondary">먼저 계정을 선택해야 상품을 검색할 수 있습니다.</p> : null}
      <div className="mt-5 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="grid gap-3">
          {results.length > 0
            ? results.slice(0, 6).map((item) => (
                <Link
                  key={item.productId}
                  href={buildHref(item.productId)}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${selectedProductId === item.productId ? 'border-glow bg-accent-primary/10 shadow-aura' : 'border-subtle bg-bg-card/60 hover:border-glow hover:bg-bg-card-hover'}`}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-subtle bg-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imgUrl || '/product-aura-01.svg'} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="product-title truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-text-muted">{item.modelName || `PRODUCT #${item.productId}`}</p>
                  </div>
                </Link>
              ))
            : [
                <div key="empty" className="rounded-3xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">
                  {keyword ? '검색 결과가 없습니다. 다른 키워드로 다시 시도해보세요.' : '검색어를 입력하면 작업 추가용 상품 후보가 표시됩니다.'}
                </div>,
              ]}
        </div>
        <div className="rounded-3xl border border-subtle bg-bg-card/50 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Options</p>
          <h3 className="product-title mt-2 text-xl font-semibold text-text-primary">{selected?.productName || '상품을 먼저 선택하세요'}</h3>
          <div className="mt-5 grid gap-3">
            {selected?.options?.length ? (
              selected.options.slice(0, 8).map((option) => {
                return (
                  <div key={option.key} className="rounded-2xl border border-subtle bg-bg-card/65 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{option.name || option.key}</p>
                        <p className="mt-1 text-xs text-text-muted">{option.stockStatus || '상태 정보 없음'}</p>
                      </div>
                      {mode === 'im-loop' && accountId ? (
                        <ImTaskAddForm
                          accountId={accountId}
                          productId={selected.productId}
                          productName={selected.productName}
                          imgUrl={selected.imgUrl}
                          option={option.key}
                        />
                      ) : mode === 'general-loop' || mode === 'bp-loop' ? (
                        <OptionTaskAddControls
                          kind={mode}
                          payload={{
                            accountId: accountId!,
                            productId: selected.productId,
                            productName: selected.productName || undefined,
                            imgUrl: selected.imgUrl || undefined,
                            optionKey: option.key,
                            option: option.key,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-subtle bg-bg-card/40 p-6 text-sm text-text-secondary">
                상품을 고르면 옵션별로 작업을 추가할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
