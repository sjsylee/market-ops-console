import { getAccounts, getLoopAccountSelection } from '../../lib/accounts-server';
import { getCurrentItemsByOrigin, getCurrentStats, getCurrentSyncState } from '../../lib/current';
import { CurrentBackLink } from './current-back-link';
import { CurrentItemList } from './current-item-list';
import { CurrentStreamRefresher } from './current-stream-refresher';
import { SyncStateCard } from './sync-state-card';

type CurrentSaleOrigin = 'ASK' | 'INVENTORY';

const originCopy: Record<CurrentSaleOrigin, {
  title: string;
  eyebrow: string;
  description: string;
  countLabel: string;
}> = {
  INVENTORY: {
    title: '보관 입찰',
    eyebrow: 'Inventory Bids',
    description: '보관 판매 상태를 동기화하고, 저장된 보관 입찰 데이터를 상품 단위로 확인합니다.',
    countLabel: '보관 판매',
  },
  ASK: {
    title: '일반 입찰',
    eyebrow: 'Normal Bids',
    description: '일반 판매 입찰 데이터를 동기화하고, 현재 입찰가와 상태를 상품 단위로 확인합니다.',
    countLabel: '일반 판매',
  },
};

export async function CurrentDetailPage({
  saleOrigin,
  selectedItemId,
}: {
  saleOrigin: CurrentSaleOrigin;
  selectedItemId?: string;
}) {
  const currentSelection = await getLoopAccountSelection('current-sync');
  const selectedAccount = currentSelection.account;
  const [syncState, stats, items] = selectedAccount
    ? await Promise.all([
        getCurrentSyncState(selectedAccount.id),
        getCurrentStats(selectedAccount.id),
        getCurrentItemsByOrigin(selectedAccount.id, saleOrigin),
      ])
    : [await getCurrentSyncState(undefined), [], []];
  const stat = stats[0];
  const copy = originCopy[saleOrigin];
  const scope = saleOrigin === 'INVENTORY' ? 'INVENTORY' : 'ASK';
  const lastSyncedAt = saleOrigin === 'INVENTORY' ? stat?.lastSyncStoredAt ?? null : stat?.lastSyncNormalAt ?? null;

  return (
    <div className="grid min-w-0 gap-5 [overflow-anchor:none] sm:gap-6">
      <div className="grid gap-4">
        <CurrentStreamRefresher accountId={selectedAccount?.id} scope={scope} />
        <CurrentBackLink />
        <div className="card-panel p-5 sm:p-8">
          <p className="text-xs uppercase tracking-[0.12em] text-accent-primary/85">{copy.eyebrow}</p>
          <h1 className="hero-title mt-2 text-2xl font-black leading-tight text-text-primary sm:mt-3 sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 hidden break-keep text-sm leading-6 text-text-secondary sm:mt-4 sm:block sm:text-base">{copy.description}</p>
        </div>
      </div>

      <section className="min-w-0">
        <SyncStateCard
          state={syncState}
          accountId={selectedAccount?.id}
          scopes={[scope]}
          lastSyncedAt={lastSyncedAt}
          accountLabel={selectedAccount ? `${selectedAccount.displayName} · ${selectedAccount.email}` : null}
        />
      </section>

      <section className="card-panel min-w-0 overflow-hidden p-4 sm:p-6">
        <div className="mb-5 min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Bid Table</p>
          <h2 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl">{copy.title} 테이블</h2>
        </div>
        <CurrentItemList items={items} selectedItemId={selectedItemId} saleOrigin={saleOrigin} />
      </section>
    </div>
  );
}
