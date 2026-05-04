import { Archive, BadgeDollarSign } from 'lucide-react';
import type { CurrentSyncState } from '@market-ops/shared';

import { CurrentBidAreaCard } from "../../components/current/current-bid-area-card";
import { CurrentPageContext } from "../../components/current/current-page-context";
import { SectionHero } from "../../components/dashboard/section-hero";
import { Reveal } from "../../components/ui/reveal";
import { requireAuthenticatedPage } from "../../lib/auth";
import { getConsoleOverview } from "../../lib/overview";
import { createPageMetadata } from "../../lib/page-metadata";

export const metadata = createPageMetadata(
  "Bid Management",
  "계정별 판매 입찰 데이터를 동기화하고 보관 입찰과 일반 입찰 상태를 관리합니다.",
);

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString('ko-KR') : null;
}

function isCurrentAreaRunning(state: CurrentSyncState, area: 'inventory' | 'ask') {
  if (!state.running) return false;

  if (state.scope) {
    if (state.scope === 'ALL') return true;
    return area === 'inventory' ? state.scope === 'INVENTORY' : state.scope === 'ASK';
  }

  return area === 'inventory' ? state.stage === 'sync_inventory' : state.stage === 'sync_ask';
}

export default async function CurrentPage() {
  await requireAuthenticatedPage("/current");
  const overview = await getConsoleOverview();
  const accounts = overview.accounts;
  const currentSelection = overview.selections.currentSync;
  const currentAccounts = accounts.filter((account) => account.type === 'ILBAN' && account.status === 'ACTIVE');
  const selectedAccount = currentSelection.account;
  const syncState = overview.states.currentSync.state;
  const stats = overview.currentStats;
  const stat = stats[0];

  return (
    <>
      <Reveal>
        <SectionHero
          eyebrow="Bid Management"
          title="Bid Management"
          description="계정별 판매 입찰 데이터를 동기화하고, 보관 입찰과 일반 입찰을 분리해 가격 노출 상태를 빠르게 확인합니다."
        />
      </Reveal>

      <div className="mt-6 grid min-w-0 gap-5 sm:gap-6">
        <Reveal delay={0.05}>
          <CurrentPageContext
            accounts={currentAccounts}
            selectedAccount={selectedAccount}
            autoSelected={currentSelection.autoSelected}
            syncState={syncState}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <section className="grid min-w-0 gap-4 md:grid-cols-2">
            <CurrentBidAreaCard
              href="/current/inventory"
              eyebrow="Inventory Bids"
              title="보관 입찰"
              description="보관 판매 상태와 보관 입찰가를 확인하고 필요한 동기화를 실행합니다."
              count={stat?.storedCount ?? 0}
              meta={formatDate(stat?.lastSyncStoredAt)}
              icon={<Archive size={20} />}
              running={isCurrentAreaRunning(syncState, 'inventory')}
            />
            <CurrentBidAreaCard
              href="/current/ask"
              eyebrow="Normal Bids"
              title="일반 입찰"
              description="일반 판매 입찰 목록과 가격 상태를 별도 테이블에서 확인합니다."
              count={stat?.normalCount ?? 0}
              meta={formatDate(stat?.lastSyncNormalAt)}
              icon={<BadgeDollarSign size={20} />}
              running={isCurrentAreaRunning(syncState, 'ask')}
            />
          </section>
        </Reveal>

        {stat?.lastErrorMessage ? (
          <Reveal delay={0.15}>
            <p className="failure-reason-card">최근 동기화 오류 · {stat.lastErrorMessage}</p>
          </Reveal>
        ) : null}
      </div>
    </>
  );
}
