import { SectionHero } from "../../components/dashboard/section-hero";
import { Reveal } from "../../components/ui/reveal";
import { MacroHubCard } from "../../components/jobs/macro-hub-card";
import { JobsHubRefresher } from "../../components/jobs/jobs-hub-refresher";
import { requireAuthenticatedPage } from "../../lib/auth";
import { getMacroSummary } from "../../lib/jobs";
import { getConsoleOverview } from "../../lib/overview";
import { createPageMetadata } from "../../lib/page-metadata";

export const metadata = createPageMetadata(
  "Macro Control",
  "일반, 입점, 구매 입찰, 최저가 루프의 실행 상태와 큐를 관리합니다.",
);

export default async function JobsPage() {
  await requireAuthenticatedPage("/jobs");
  const overview = await getConsoleOverview();
  const generalSelection = overview.selections.generalLoop;
  const vendorSelection = overview.selections.bpLoop;
  const purchaseBidSelection = overview.selections.imLoop;
  const currentSelection = overview.selections.currentSync;
  const general = overview.states.generalLoop;
  const vendor = overview.states.bpLoop;
  const purchaseBid = overview.states.imLoop;
  const lowestLoop = overview.states.lowestLoop;
  const lowestQueue = overview.lowestLoopQueue;

  const generalSummary = getMacroSummary(general.state);
  const vendorSummary = getMacroSummary(vendor.state);
  const purchaseBidSummary = getMacroSummary(purchaseBid.state);

  return (
    <>
      <JobsHubRefresher />
      <Reveal>
        <SectionHero
          eyebrow="Macros"
          title="Macro Control"
          description="매크로별로 작업 큐를 관리하고, 상품을 추가하며, 시작과 중지를 제어합니다."
        />
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <MacroHubCard
            href="/jobs/general"
            eyebrow="Storage Macro"
            title="일반 보관 매크로"
            description="기본 보관 판매 작업을 순서대로 관리하고 실행합니다."
            accountName={generalSelection.account?.displayName ?? null}
            {...generalSummary}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <MacroHubCard
            href="/jobs/vendor"
            eyebrow="Vendor Storage"
            title="입점 보관 매크로"
            description="입점 계정 기준 보관 판매 작업과 인증 상태를 함께 관리합니다."
            accountName={vendorSelection.account?.displayName ?? null}
            {...vendorSummary}
          />
        </Reveal>
        <Reveal delay={0.15}>
          <MacroHubCard
            href="/jobs/purchase-bid"
            eyebrow="Purchase Bid"
            title="구매 입찰 매크로"
            description="구매 입찰 작업을 추가하고 목표가 기준으로 자동 실행합니다."
            accountName={purchaseBidSelection.account?.displayName ?? null}
            {...purchaseBidSummary}
          />
        </Reveal>
        <Reveal delay={0.2}>
          <MacroHubCard
            href="/jobs/lowest-bid"
            eyebrow="Lowest Bid Loop"
            title="최저가 입찰 루프"
            description="입찰 관리에서 등록한 상품을 최저가 기준으로 자동 조정합니다."
            accountName={currentSelection.account?.displayName ?? null}
            running={lowestLoop.state.running}
            pendingLabel="활성"
            pendingCount={lowestLoop.state.activeCount || lowestQueue.filter((item) => item.active).length}
            successLabel="사이클"
            successTone="info"
            successCount={lowestLoop.state.cycleCount}
            failedLabel="중지"
            failedTone="warning"
            failedCount={lowestQueue.filter((item) => !item.active).length}
          />
        </Reveal>
      </div>
    </>
  );
}
