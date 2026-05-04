import { CurrentAccountSlot } from '../../../components/current/current-account-slot';
import Link from 'next/link';
import { SectionHero } from '../../../components/dashboard/section-hero';
import { LowestLoopControlCard } from '../../../components/jobs/lowest-loop-control-card';
import { LowestLoopStreamRefresher } from '../../../components/jobs/lowest-loop-stream-refresher';
import { MacroBackLink } from '../../../components/jobs/macro-back-link';
import { Reveal } from '../../../components/ui/reveal';
import { requireAuthenticatedPage } from '../../../lib/auth';
import { getLowestLoopDetailOverview } from '../../../lib/macro-detail-overview';
import { createPageMetadata } from '../../../lib/page-metadata';
import { LowestLoopPageModals } from '../../../components/jobs/lowest-loop-page-modals';

export const metadata = createPageMetadata(
  'Lowest Bid Loop',
  '입찰 관리에 등록한 상품을 최저가 기준으로 자동 조정하는 루프를 관리합니다.',
);

export default async function LowestBidLoopPage({
  searchParams,
}: {
  searchParams?: { modal?: string };
}) {
  await requireAuthenticatedPage('/jobs/lowest-bid');
  const basePath = '/jobs/lowest-bid';
  const modal = searchParams?.modal;

  const overview = await getLowestLoopDetailOverview();
  const accounts = overview.accounts;
  const currentSelection = overview.selection;
  const currentAccounts = accounts;
  const selectedAccount = currentSelection.account;
  const stateResponse = overview.state;
  const queueItems = overview.queueItems;
  const activeQueueItems = queueItems.filter((item) => item.active);
  const inactiveQueueItems = queueItems.filter((item) => !item.active);

  return (
    <>
      <LowestLoopStreamRefresher accountId={selectedAccount?.id} />
      <Reveal>
        <MacroBackLink />
      </Reveal>
      <Reveal delay={0.05}>
        <SectionHero
          eyebrow="Lowest Bid Loop"
          title="최저가 입찰 루프"
          description="입찰 관리에서 등록한 상품을 최저가 기준으로 자동 조정하고, 큐가 많아져도 매크로 화면에서 한 번에 운영합니다."
          hideDescriptionOnMobile
        />
      </Reveal>

      <div className="mt-6 grid gap-5 sm:gap-6">
        <Reveal delay={0.1}>
          <CurrentAccountSlot
            accounts={currentAccounts}
            selectedAccountId={selectedAccount?.id}
            autoSelected={currentSelection.autoSelected}
            running={stateResponse.state.running}
          />
        </Reveal>

        <Reveal delay={0.15}>
          <LowestLoopControlCard
            accountId={selectedAccount?.id}
            state={stateResponse.state}
            queueCount={queueItems.length}
            activeQueueCount={activeQueueItems.length}
            inactiveQueueCount={inactiveQueueItems.length}
            basePath={basePath}
          />
        </Reveal>
        <Reveal delay={0.2}>
          <section className="grid grid-cols-2 gap-2 sm:gap-3">
            <BidBoardLink
              href="/current/inventory"
              eyebrow="Inventory Bids"
              title="보관 입찰로 이동"
              description="보관 판매 입찰 상태와 최저가 기준을 확인합니다."
            />
            <BidBoardLink
              href="/current/ask"
              eyebrow="Normal Bids"
              title="일반 입찰로 이동"
              description="일반 판매 입찰 목록과 노출 상태를 확인합니다."
            />
          </section>
        </Reveal>
      </div>
      <LowestLoopPageModals
        basePath={basePath}
        accountId={selectedAccount?.id}
        initialModal={modal}
        items={queueItems}
        running={stateResponse.state.running}
      />
    </>
  );
}

function BidBoardLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-subtle bg-bg-card/60 p-3 transition hover:border-glow hover:bg-bg-card-hover sm:p-5"
    >
      <p className="hidden text-xs uppercase tracking-[0.12em] text-text-muted sm:block">{eyebrow}</p>
      <div className="flex items-center justify-between gap-2 sm:mt-2 sm:gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-text-primary sm:text-lg">{title}</h3>
          <p className="mt-1 hidden text-sm leading-6 text-text-secondary sm:block">{description}</p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-2xl border border-glow bg-accent-primary/10 px-2 text-xs font-bold text-accent-primary transition group-hover:translate-x-0.5 sm:h-9 sm:px-3 sm:text-sm">
          이동
        </span>
      </div>
    </Link>
  );
}
